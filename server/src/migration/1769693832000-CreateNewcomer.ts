import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateNewcomer1769693832000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Newcomer 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`newcomer\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`yearOfBirth\` int NULL,
        \`gender\` varchar(10) NULL,
        \`phone\` varchar(255) NULL COMMENT '연락처',
        \`guiderId\` varchar(36) NULL COMMENT '인도자',
        \`status\` enum ('NORMAL', 'PROMOTED', 'DELETED', 'PENDING') NOT NULL DEFAULT 'NORMAL',
        \`promotionDate\` varchar(255) NULL COMMENT '등반일',
        \`assignment\` varchar(255) NULL COMMENT '배정',
        \`deletionDate\` varchar(255) NULL COMMENT '삭제일',
        \`pendingDate\` varchar(255) NULL COMMENT '보류일',
        \`managerId\` varchar(36) NULL,
        \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_newcomer_guider\` FOREIGN KEY (\`guiderId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT \`FK_newcomer_manager\` FOREIGN KEY (\`managerId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)

    // NewcomerEducation 테이블 생성
    await queryRunner.query(`
      CREATE TABLE \`newcomer_education\` (
        \`id\` varchar(36) NOT NULL,
        \`newcomerId\` varchar(36) NULL,
        \`worshipScheduleId\` varchar(36) NULL,
        \`lectureType\` enum ('OT', 'L1', 'L2', 'L3', 'L4', 'L5') NOT NULL,
        \`memo\` text NULL,
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_newcomer_education_newcomer\` FOREIGN KEY (\`newcomerId\`) REFERENCES \`newcomer\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_newcomer_education_worship\` FOREIGN KEY (\`worshipScheduleId\`) REFERENCES \`worship_schedule\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`newcomer_education\``)
    await queryRunner.query(`DROP TABLE \`newcomer\``)
  }
}
