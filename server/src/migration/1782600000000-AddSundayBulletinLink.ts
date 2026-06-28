import { MigrationInterface, QueryRunner } from "typeorm"

const sundayBulletinLinkId = "bf5531d7-f217-4d98-9cc7-f6eb6fd48a78"

export class AddSundayBulletinLink1782600000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO \`link\` (
        \`id\`,
        \`title\`,
        \`type\`,
        \`url\`,
        \`displayOrder\`,
        \`isActive\`
      )
      SELECT
        '${sundayBulletinLinkId}',
        '주일 주보',
        'link',
        '/bulletin/',
        linkOrder.nextDisplayOrder,
        true
      FROM (
        SELECT COALESCE(MAX(\`displayOrder\`), 0) + 1 AS nextDisplayOrder
        FROM \`link\`
      ) AS linkOrder
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`link\`
        WHERE \`id\` = '${sundayBulletinLinkId}'
          OR \`title\` = '주일 주보'
          OR \`url\` = '/bulletin/'
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`link\`
      WHERE \`id\` = '${sundayBulletinLinkId}'
    `)
  }
}
