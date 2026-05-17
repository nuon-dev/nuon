import { MigrationInterface, QueryRunner } from "typeorm"

export class ResetCommunityTablesCli1778997293189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing community-related tables if any (order matters due to FKs)
    await queryRunner.query(`DROP TABLE IF EXISTS \`reaction\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`comment\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board_moderators\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board\``)

    // Create boards
    await queryRunner.query(`
            CREATE TABLE \`board\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`slug\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`description\` text COLLATE utf8mb4_general_ci NULL,
                \`visibility\` enum ('public','members','private') NOT NULL DEFAULT 'public',
                \`settings\` json NULL,
                \`createdById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL,
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_board_slug\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // board moderators join table
    await queryRunner.query(`
            CREATE TABLE \`board_moderators\` (
                \`board_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                INDEX \`IDX_board_moderators_board\` (\`board_id\`),
                INDEX \`IDX_board_moderators_user\` (\`user_id\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // Single-table inheritance for posts (base table contains child columns)
    await queryRunner.query(`
            CREATE TABLE \`post\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` varchar(50) NOT NULL DEFAULT 'free',
                \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`boardId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`title\` varchar(255) COLLATE utf8mb4_general_ci NULL,
                \`content\` text COLLATE utf8mb4_general_ci NULL,
                \`isAnonymous\` tinyint NOT NULL DEFAULT 0,
                -- QnA specific fields
                \`answer\` text COLLATE utf8mb4_general_ci NULL,
                \`answeredById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`answeredAt\` timestamp NULL,
                \`answerPublic\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_post_board_createdAt\` (\`boardId\`, \`createdAt\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // comments
    await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` varchar(36) NOT NULL,
                \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`parentId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`content\` text COLLATE utf8mb4_general_ci NOT NULL,
                \`isAnonymous\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_comment_post_createdAt\` (\`postId\`, \`createdAt\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // reactions
    await queryRunner.query(`
            CREATE TABLE \`reaction\` (
                \`id\` varchar(36) NOT NULL,
                \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`userId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`type\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_reaction_unique\` (\`postId\`, \`userId\`, \`type\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // Foreign keys
    await queryRunner.query(
      `ALTER TABLE \`board\` ADD CONSTRAINT \`FK_board_createdBy\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`board_moderators\` ADD CONSTRAINT \`FK_board_mod_board\` FOREIGN KEY (\`board_id\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`board_moderators\` ADD CONSTRAINT \`FK_board_mod_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )

    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_board\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_answeredBy\` FOREIGN KEY (\`answeredById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )

    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )

    await queryRunner.query(
      `ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_reaction_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`reaction\` ADD CONSTRAINT \`FK_reaction_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_reaction_user\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`reaction\` DROP FOREIGN KEY \`FK_reaction_post\``,
    )

    await queryRunner.query(
      `ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_comment_author\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_comment_parent\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_comment_post\``,
    )

    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_answeredBy\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_board\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_author\``,
    )

    await queryRunner.query(
      `ALTER TABLE \`board_moderators\` DROP FOREIGN KEY \`FK_board_mod_user\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`board_moderators\` DROP FOREIGN KEY \`FK_board_mod_board\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`board\` DROP FOREIGN KEY \`FK_board_createdBy\``,
    )

    await queryRunner.query(`DROP TABLE IF EXISTS \`reaction\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`comment\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board_moderators\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board\``)
  }
}
