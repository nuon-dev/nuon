import { MigrationInterface, QueryRunner } from "typeorm"

/**
 * 새가족 마을의 4단 구조를 평탄화.
 *
 * 새가족 트리는 다른 마을과 달리 한 단 더 깊은 4단 구조였음:
 *   새가족 (root)
 *     ├ 김유진 (마을 d1) → 7개 다락방 (d2) → user
 *     └ 백은비 (마을 d1) → 7개 다락방 (d2) → user
 *
 * 김유진/백은비를 root 마을로 승격하고 새가족 노드를 삭제하여
 * 다른 일반 마을들과 동일한 3단(마을→다락방→순원) 구조로 정렬.
 *
 * 부수 효과: newcomer.assignmentId FK는 ON DELETE SET NULL이므로,
 * assignmentId가 새가족 노드를 가리키던 newcomer record는 NULL이 됨.
 */
export class FlattenNewcomerSubtree1779000000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const newcomer: { id: number }[] = await queryRunner.query(
      `SELECT id FROM community WHERE parentId IS NULL AND name = '새가족'`,
    )

    if (newcomer.length === 0) {
      console.log(
        `[FlattenNewcomerSubtree] '새가족' 노드 없음 — 이미 평탄화된 상태로 추정`,
      )
      return
    }
    const newcomerId = newcomer[0].id

    // 새가족 직속 user(있다면) → community NULL. 김유진/백은비 마을의
    // 더 깊은 다락방에 매달려있는 user는 영향받지 않음.
    await queryRunner.query(
      `UPDATE user SET communityId = NULL WHERE communityId = ${newcomerId}`,
    )

    // 김유진/백은비를 root로 승격
    await queryRunner.query(
      `UPDATE community SET parentId = NULL WHERE parentId = ${newcomerId}`,
    )

    // 새가족 노드 삭제
    await queryRunner.query(
      `DELETE FROM community WHERE id = ${newcomerId}`,
    )

    console.log(
      `[FlattenNewcomerSubtree] '새가족' 노드(id=${newcomerId}) 삭제, children 마을들을 root로 승격 완료`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "FlattenNewcomerSubtree.down() 은 데이터 손실 때문에 자동 복원할 수 없습니다.",
    )
  }
}
