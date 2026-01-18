import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateAiChat1768640534507 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`ai_chat_room\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`title\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_ai_chat_room_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)
    await queryRunner.query(`
      CREATE TABLE \`ai_chat\` (
        \`id\` varchar(36) NOT NULL,
        \`roomId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`type\` enum ('user', 'ai', 'system') NOT NULL,
        \`message\` text COLLATE utf8mb4_general_ci NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_ai_chat_roomId\` FOREIGN KEY (\`roomId\`) REFERENCES \`ai_chat_room\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`ai_chat\``)
    await queryRunner.query(`DROP TABLE \`ai_chat_room\``)
  }
}
