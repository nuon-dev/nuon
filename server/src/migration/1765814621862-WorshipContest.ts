import { MigrationInterface, QueryRunner } from "typeorm"

export class WorshipContest1765814621862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`worship_contest\` (
                \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                \`voteUserId\` CHAR(36),
                \`firstCommunity\` VARCHAR(255) NOT NULL,
                \`secondCommunity\` VARCHAR(255) NOT NULL,
                \`thirdCommunity\` VARCHAR(255) NOT NULL,
                \`term\` INT NOT NULL,
                \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT \`FK_voteUser\` FOREIGN KEY (\`voteUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
            )
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE \`worship_contest\`
        `)
  }
}
