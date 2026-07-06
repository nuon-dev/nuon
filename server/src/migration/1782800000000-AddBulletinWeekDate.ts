import { MigrationInterface, QueryRunner } from "typeorm"

export class AddBulletinWeekDate1782800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn("bulletin_image", "weekDate"))) {
      await queryRunner.query(`
        ALTER TABLE \`bulletin_image\`
        ADD COLUMN \`weekDate\` date NULL FIRST
      `)
    }
    await queryRunner.query(`
      SET @bulletinToday = DATE(DATE_ADD(UTC_TIMESTAMP(), INTERVAL 9 HOUR))
    `)
    await queryRunner.query(`
      UPDATE \`bulletin_image\`
      SET \`weekDate\` = DATE_ADD(
        @bulletinToday,
        INTERVAL IF(DAYOFWEEK(@bulletinToday) = 1, 0, 8 - DAYOFWEEK(@bulletinToday)) DAY
      )
      WHERE \`weekDate\` IS NULL
    `)
    await queryRunner.query(`
      ALTER TABLE \`bulletin_image\`
      DROP PRIMARY KEY,
      MODIFY \`weekDate\` date NOT NULL,
      ADD PRIMARY KEY (\`weekDate\`, \`slot\`)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Cannot safely revert AddBulletinWeekDate because it would merge weekly bulletin rows.",
    )
  }
}
