import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 4단(담당→마을→다락방→순원) 구조를 3단(마을→다락방→순원)으로 평탄화.
 *
 * 1) 전도사 담당 노드를 삭제하고 그 children(마을)을 root로 승격.
 * 2) 사역팀 마을 안에 다락방 "성은비"를 생성하고, 사역팀에 직속이던 user들을
 *    그 다락방으로 이동. (3단 구조의 균일성 확보 — 평탄 마을 예외 케이스 제거)
 * 3) 새가족은 이미 마을 구조이므로 손대지 않음.
 *
 * 데이터 손실 주의: 전도사 노드의 정보(어느 마을이 누구 담당이었는지)는
 * 영원히 사라짐. deploy:safe가 마이그레이션 전 자동 백업을 떠줌.
 */
export class FlattenCommunityHierarchy1778000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================================================
    // 1) 전도사 담당 노드 삭제 + 그 children(마을)을 root로 승격
    // ============================================================
    const evangelists: { id: number; name: string }[] =
      await queryRunner.query(
        `SELECT id, name FROM community WHERE parentId IS NULL AND name LIKE '%전도사%'`,
      )

    if (evangelists.length > 0) {
      console.log(
        `[FlattenCommunityHierarchy] 전도사 노드 ${evangelists.length}개 발견:`,
        evangelists.map((e) => e.name).join(", "),
      )
      const ids = evangelists.map((e) => e.id).join(",")

      await queryRunner.query(
        `UPDATE community SET parentId = NULL WHERE parentId IN (${ids})`,
      )
      // 전도사 본인 user들이 자기 담당 노드를 community로 가리키고 있어
      // FK 위반을 일으키므로, 삭제 전 그 user들의 community를 NULL로 풀어줌.
      // 전도사들은 출석 체크 대상이 아니므로 community 미소속이 정상 상태.
      await queryRunner.query(
        `UPDATE user SET communityId = NULL WHERE communityId IN (${ids})`,
      )
      await queryRunner.query(
        `DELETE FROM community WHERE id IN (${ids})`,
      )
    } else {
      console.log(
        `[FlattenCommunityHierarchy] 전도사 노드 없음 — 이미 평탄화된 상태로 추정`,
      )
    }

    // ============================================================
    // 2) 사역팀 마을 안에 다락방 "성은비" 생성 + 직속 user 이동
    // ============================================================
    const ministry: { id: number }[] = await queryRunner.query(
      `SELECT id FROM community WHERE parentId IS NULL AND name = '사역팀'`,
    )

    if (ministry.length === 0) {
      console.log(
        `[FlattenCommunityHierarchy] '사역팀' 마을을 찾을 수 없음 — 사역팀 처리 건너뜀`,
      )
      return
    }
    const ministryId = ministry[0].id

    // 이미 사역팀에 다락방이 있으면 재실행 안전성 확보
    const existing: { c: number }[] = await queryRunner.query(
      `SELECT COUNT(*) AS c FROM community WHERE parentId = ${ministryId}`,
    )
    if (Number(existing[0].c) > 0) {
      console.log(
        `[FlattenCommunityHierarchy] '사역팀'에 이미 다락방이 존재 — 사역팀 처리 건너뜀`,
      )
      return
    }

    // 성은비 user lookup
    const seongs: { id: string }[] = await queryRunner.query(
      `SELECT id FROM user WHERE name = '성은비' AND deletedAt IS NULL`,
    )
    if (seongs.length === 0) {
      throw new Error(
        `[FlattenCommunityHierarchy] '성은비' user를 찾을 수 없습니다.`,
      )
    }
    if (seongs.length > 1) {
      throw new Error(
        `[FlattenCommunityHierarchy] '성은비' 동명이인이 ${seongs.length}명입니다. 마이그레이션을 수정하여 user id를 명시해주세요.`,
      )
    }
    const seongUserId = seongs[0].id

    // 새 다락방 INSERT
    const insertResult: { insertId: number } = await queryRunner.query(
      `INSERT INTO community (name, parentId, leaderId) VALUES ('성은비', ${ministryId}, '${seongUserId}')`,
    )
    const newDarakId = insertResult.insertId

    // 사역팀 직속 user들을 새 다락방으로 이동
    await queryRunner.query(
      `UPDATE user SET communityId = ${newDarakId} WHERE communityId = ${ministryId}`,
    )

    console.log(
      `[FlattenCommunityHierarchy] 다락방 '성은비' 생성 완료 (id=${newDarakId}). 사역팀 직속 user들을 다락방으로 이동.`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 전도사 노드의 매핑 정보가 사라졌기 때문에 완전 복원이 불가능.
    // 백업에서 복원하는 것이 정확.
    throw new Error(
      "FlattenCommunityHierarchy.down() 은 데이터 손실 때문에 자동 복원할 수 없습니다. db:backup에서 복원하세요.",
    )
  }
}
