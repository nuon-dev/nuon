import { MigrationInterface, QueryRunner } from "typeorm"

export class AddNewcomerBirthdayAndRegistrationDate1775000000000 implements MigrationInterface {
  name = "AddNewcomerBirthdayAndRegistrationDate1775000000000"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `birthday` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `registrationDate` varchar(255) NULL",
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `newcomer` DROP COLUMN `registrationDate`",
    )
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `birthday`")
  }
}
