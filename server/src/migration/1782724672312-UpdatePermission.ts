import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdatePermission1782724672312 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM \`permission\`    
        `)

    await queryRunner.query(`
            ALTER TABLE \`permission\` MODIFY COLUMN \`permissionType\` varchar(255) NOT NULL COMMENT '부여된 권한 종류 (자유 문자열)';
        `)

    await queryRunner.query(`
          ALTER TABLE \`user\` DROP COLUMN \`isSuperUser\`
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM \`permission\`
        `)

    await queryRunner.query(`
            ALTER TABLE \`permission\` MODIFY COLUMN \`permissionType\` int NOT NULL COMMENT '부여된 권한 종류 (숫자 Enum index)';
        `)

    await queryRunner.query(`
          ALTER TABLE \`user\` ADD COLUMN \`isSuperUser\` tinyint NOT NULL DEFAULT 0 COMMENT '슈퍼유저 여부';
        `)
  }
}
