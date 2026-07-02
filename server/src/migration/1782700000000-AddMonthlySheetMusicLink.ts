import { MigrationInterface, QueryRunner } from "typeorm"

const monthlySheetMusicLinkId = "6f02cba7-3f74-4c4b-9ce7-9f51149d49d2"

export class AddMonthlySheetMusicLink1782700000000
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
        '${monthlySheetMusicLinkId}',
        '월기 악보',
        'link',
        'https://m.site.naver.com/14Nhc',
        linkOrder.nextDisplayOrder,
        true
      FROM (
        SELECT COALESCE(MAX(\`displayOrder\`), 0) + 1 AS nextDisplayOrder
        FROM \`link\`
      ) AS linkOrder
      WHERE NOT EXISTS (
        SELECT 1
        FROM \`link\`
        WHERE \`id\` = '${monthlySheetMusicLinkId}'
          OR \`title\` = '월기 악보'
          OR \`url\` = 'https://m.site.naver.com/14Nhc'
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM \`link\`
      WHERE \`id\` = '${monthlySheetMusicLinkId}'
    `)
  }
}
