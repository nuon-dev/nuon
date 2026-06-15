import { MigrationInterface, QueryRunner } from "typeorm"

export class ResetCommunityTablesCli1778997293189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`reaction\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`comment\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`qna_post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board\``)

    // Create boards
    await queryRunner.query(`
            CREATE TABLE \`board\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '게시판 이름',
                \`slug\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '게시판 고유 식별용 slug',
                \`description\` text COLLATE utf8mb4_general_ci NULL COMMENT '게시판 설명',
                \`visibility\` enum ('public','members','private') NOT NULL DEFAULT 'public' COMMENT '게시판 공개 범위',
                \`createdById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`type\` enum ('free','qna') NOT NULL DEFAULT 'free' COMMENT '게시판 유형',
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL COMMENT '소프트 삭제 시각',
                PRIMARY KEY (\`id\`),
                UNIQUE INDEX \`IDX_board_slug\` (\`slug\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // Single-table inheritance for posts (base table contains child columns)
    await queryRunner.query(`
            CREATE TABLE \`post\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` varchar(50) NOT NULL DEFAULT 'free' COMMENT '게시글 타입',
                \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`boardId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`title\` varchar(255) COLLATE utf8mb4_general_ci NULL COMMENT '게시글 제목',
                \`content\` text COLLATE utf8mb4_general_ci NULL COMMENT '게시글 본문',
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL,
                PRIMARY KEY (\`id\`),
                INDEX \`IDX_post_board_createdAt\` (\`boardId\`, \`createdAt\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // Join table for qna post
    await queryRunner.query(`
            CREATE TABLE \`qna_post\` (
                \`id\` varchar(36) NOT NULL,
                \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`answer\` text COLLATE utf8mb4_general_ci NULL COMMENT '관리자 답변',
                \`answeredById\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`answeredAt\` timestamp NULL COMMENT '답변 완료 시각',
                \`answerPublic\` tinyint(1) NOT NULL DEFAULT 0 COMMENT '답변 공개 여부',
                 PRIMARY KEY (\`id\`),
                 UNIQUE INDEX \`IDX_qna_post_postId\` (\`postId\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)

    // comments
    await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` varchar(36) NOT NULL,
                \`postId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`parentId\` varchar(36) COLLATE utf8mb4_general_ci NULL,
                \`authorId\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
                \`content\` text COLLATE utf8mb4_general_ci NOT NULL COMMENT '댓글 내용',
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`deletedAt\` timestamp NULL COMMENT '소프트 삭제 시각',
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
                \`type\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT '반응 타입',
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
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` ADD CONSTRAINT \`FK_post_board\` FOREIGN KEY (\`boardId\`) REFERENCES \`board\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`qna_post\` ADD CONSTRAINT \`FK_qna_post_postId\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`qna_post\` ADD CONSTRAINT \`FK_qna_post_answeredBy\` FOREIGN KEY (\`answeredById\`) REFERENCES \`user\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )

    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_post\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_parent\` FOREIGN KEY (\`parentId\`) REFERENCES \`comment\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE \`comment\` ADD CONSTRAINT \`FK_comment_author\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE \`qna_post\` DROP FOREIGN KEY \`FK_qna_post_answeredBy\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`qna_post\` DROP FOREIGN KEY \`FK_qna_post_postId\``,
    )

    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_board\``,
    )
    await queryRunner.query(
      `ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_post_author\``,
    )

    await queryRunner.query(
      `ALTER TABLE \`board\` DROP FOREIGN KEY \`FK_board_createdBy\``,
    )

    await queryRunner.query(`DROP TABLE IF EXISTS \`reaction\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`comment\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`qna_post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`post\``)
    await queryRunner.query(`DROP TABLE IF EXISTS \`board\``)
  }
}
