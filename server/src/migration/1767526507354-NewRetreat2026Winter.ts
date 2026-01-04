import { MigrationInterface, QueryRunner } from "typeorm"

export class NewRetreat2026Winter1767526507354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`delete from in_out_info`)
    await queryRunner.query(`delete from retreat_attend`)
    await queryRunner.query(`drop table if exists chat_log`)
    await queryRunner.query(`
            ALTER TABLE retreat_attend
            ADD COLUMN isWorker BOOLEAN NOT NULL DEFAULT true,
            ADD COLUMN isHalf BOOLEAN NOT NULL DEFAULT false
        `)
    await queryRunner.query(
      `ALTER TABLE retreat_attend ALTER COLUMN isCanceled SET DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE retreat_attend
            DROP COLUMN isWorker,
            DROP COLUMN isHalf
        `)
  }
}
