import { MigrationInterface, QueryRunner } from "typeorm"

export class AddCommunityBoards1780568400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Board table
    await queryRunner.query(`
      CREATE TABLE \`board\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
        \`slug\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
        \`description\` text COLLATE utf8mb4_general_ci NULL,
        \`visibility\` enum ('public', 'members', 'private') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'public',
        \`settings\` json NULL,
        \`createdById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_board_createdById\` (\`createdById\`),
        CONSTRAINT \`FK_board_createdBy\` FOREIGN KEY (\`createdById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create board_moderators join table
    await queryRunner.query(`
      CREATE TABLE \`board_moderators\` (
        \`boardId\` varchar(36) NOT NULL,
        \`userId\` varchar(36) NOT NULL,
        PRIMARY KEY (\`boardId\`, \`userId\`),
        INDEX \`IDX_board_moderators_userId\` (\`userId\`),
        CONSTRAINT \`FK_board_moderators_boardId\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_board_moderators_userId\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create Post table with Table Inheritance
    await queryRunner.query(`
      CREATE TABLE \`post\` (
        \`id\` varchar(36) NOT NULL,
        \`type\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'free',
        \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`title\` varchar(255) COLLATE utf8mb4_general_ci NULL,
        \`content\` text COLLATE utf8mb4_general_ci NULL,
        \`isAnonymous\` boolean NOT NULL DEFAULT false,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`deletedAt\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_post_type\` (\`type\`),
        INDEX \`IDX_post_authorId\` (\`authorId\`),
        INDEX \`IDX_post_deletedAt\` (\`deletedAt\`),
        CONSTRAINT \`FK_post_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create free_post table
    await queryRunner.query(`
      CREATE TABLE \`free_post\` (
        \`id\` varchar(36) NOT NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_free_post_id\` FOREIGN KEY (\`id\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create qna_post table
    await queryRunner.query(`
      CREATE TABLE \`qna_post\` (
        \`id\` varchar(36) NOT NULL,
        \`answer\` text COLLATE utf8mb4_general_ci NULL,
        \`answeredById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`answerPublic\` boolean NOT NULL DEFAULT false,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_qna_post_answeredById\` (\`answeredById\`),
        CONSTRAINT \`FK_qna_post_id\` FOREIGN KEY (\`id\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_qna_post_answeredBy\` FOREIGN KEY (\`answeredById\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create Comment table (shared by both FreePost and QnaPost)
    await queryRunner.query(`
      CREATE TABLE \`comment\` (
        \`id\` varchar(36) NOT NULL,
        \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
        \`parentId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
        \`content\` text COLLATE utf8mb4_general_ci NOT NULL,
        \`isAnonymous\` boolean NOT NULL DEFAULT false,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`deletedAt\` timestamp NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_comment_postId\` (\`postId\`),
        INDEX \`IDX_comment_parentId\` (\`parentId\`),
        INDEX \`IDX_comment_authorId\` (\`authorId\`),
        INDEX \`IDX_comment_deletedAt\` (\`deletedAt\`),
        CONSTRAINT \`FK_comment_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_comment_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_comment_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // Create Reaction table (shared by both FreePost and QnaPost)
    await queryRunner.query(`
      CREATE TABLE \`reaction\` (
        \`id\` varchar(36) NOT NULL,
        \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
        \`userId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
        \`type\` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_reaction_post_user_type\` (\`postId\`, \`userId\`, \`type\`),
        INDEX \`IDX_reaction_userId\` (\`userId\`),
        CONSTRAINT \`FK_reaction_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_reaction_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`reaction\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`comment\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`qna_post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`free_post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board_moderators\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board\``)
  }
}
