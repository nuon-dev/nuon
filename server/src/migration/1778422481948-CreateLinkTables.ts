import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateLinkTables1778422481948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`link\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`type\` enum ('link', 'text') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'link',
                \`url\` varchar(2048) COLLATE utf8mb4_general_ci NULL,
                \`body\` text COLLATE utf8mb4_general_ci NULL,
                \`displayOrder\` int NOT NULL DEFAULT 0,
                \`isActive\` boolean NOT NULL DEFAULT true,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)
    await queryRunner.query(`
            CREATE TABLE \`link_click\` (
                \`id\` varchar(36) NOT NULL,
                \`linkId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`userAgent\` varchar(500) COLLATE utf8mb4_general_ci NULL,
                \`ipAddress\` varchar(45) COLLATE utf8mb4_general_ci NULL,
                \`clickedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_link_click_linkId\` (\`linkId\`),
                CONSTRAINT \`FK_link_click_link\` FOREIGN KEY (\`linkId\`) REFERENCES \`link\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`link_click\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`link\``)
  }
}
