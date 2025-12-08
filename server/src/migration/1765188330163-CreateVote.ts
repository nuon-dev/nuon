import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVote1765188330163 implements MigrationInterface {


    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`vote\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`voteUserId\` varchar(36) NOT NULL,
                \`firstCommunityId\` int NOT NULL,
                \`secondCommunityId\` int NOT NULL,
                \`thirdCommunityId\` int NOT NULL,
                \`term\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                KEY \`FK_vote_user\` (\`voteUserId\`),
                KEY \`FK_vote_first_community\` (\`firstCommunityId\`),
                KEY \`FK_vote_second_community\` (\`secondCommunityId\`),
                KEY \`FK_vote_third_community\` (\`thirdCommunityId\`),
                CONSTRAINT \`FK_vote_user\` FOREIGN KEY (\`voteUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_vote_first_community\` FOREIGN KEY (\`firstCommunityId\`) REFERENCES \`community\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_vote_second_community\` FOREIGN KEY (\`secondCommunityId\`) REFERENCES \`community\`(\`id\`) ON DELETE CASCADE,
                CONSTRAINT \`FK_vote_third_community\` FOREIGN KEY (\`thirdCommunityId\`) REFERENCES \`community\`(\`id\`) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `vote`;');
    }

}
