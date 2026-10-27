import { MigrationInterface, QueryRunner } from "typeorm"

export class AddJumoaIdInUser1793084308820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\`
       ADD COLUMN 
       \`jumoaId\` INT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE 
      \`user\` DROP COLUMN \`jumoaId\``)
  }
}
