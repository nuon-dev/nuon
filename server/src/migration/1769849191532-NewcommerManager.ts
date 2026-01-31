import { MigrationInterface, QueryRunner } from "typeorm"

export class NewcommerManager1769849191532 implements MigrationInterface {
  name = "NewcommerManager1769849191532"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`newcomer_manager\` (\`id\` uuid NOT NULL, \`userId\` uuid NULL, UNIQUE INDEX \`REL_b7d878973e0b2a9b64a7214b03\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    )
    await queryRunner.query(
      `ALTER TABLE \`newcomer_manager\` ADD CONSTRAINT \`FK_b7d878973e0b2a9b64a7214b036\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`newcomer_manager\` DROP FOREIGN KEY \`FK_b7d878973e0b2a9b64a7214b036\``,
    )
    await queryRunner.query(
      `DROP INDEX \`REL_b7d878973e0b2a9b64a7214b03\` ON \`newcomer_manager\``,
    )
    await queryRunner.query(`DROP TABLE \`newcomer_manager\``)
  }
}
