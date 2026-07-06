import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateBulletinImage1782521200000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`bulletin_image\` (
                \`slot\` int NOT NULL,
                \`filename\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`originalName\` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`slot\`),
                UNIQUE INDEX \`UQ_bulletin_image_filename\` (\`filename\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`bulletin_image\``)
  }
}
