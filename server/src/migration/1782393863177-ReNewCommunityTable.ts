import { MigrationInterface, QueryRunner } from "typeorm"

export class ReNewCommunityTable1782393863177 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`post\` DROP COLUMN \`type\`;
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`post\` 
            ADD COLUMN \`type\` varchar(50) NOT NULL DEFAULT 'free' COMMENT '게시글 타입' 
            AFTER \`id\`;
        `)
  }
}
