import { MigrationInterface, QueryRunner } from "typeorm"

export class AddNewcomerField1774077398756 implements MigrationInterface {
  name = "AddNewcomerField1774077398756"

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `address` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `occupation` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `visitPath` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `registrationMotivation` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `faithLevel` enum ('초신자', '세례', '입교', '학습') NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `previousChurch` varchar(255) NULL",
    )
    await queryRunner.query(
      "ALTER TABLE `newcomer` ADD `carNumber` varchar(255) NULL",
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `carNumber`")
    await queryRunner.query(
      "ALTER TABLE `newcomer` DROP COLUMN `previousChurch`",
    )
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `faithLevel`")
    await queryRunner.query(
      "ALTER TABLE `newcomer` DROP COLUMN `registrationMotivation`",
    )
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `visitPath`")
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `occupation`")
    await queryRunner.query("ALTER TABLE `newcomer` DROP COLUMN `address`")
  }
}
