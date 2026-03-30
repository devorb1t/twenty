import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusToAgentMessage1774776000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "agentMessage_status_enum" AS ENUM ('queued', 'sent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "agentMessage" ADD COLUMN "status" "agentMessage_status_enum" NOT NULL DEFAULT 'sent'`,
    );
    await queryRunner.query(
      `ALTER TABLE "agentMessage" ALTER COLUMN "turnId" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "agentMessage" WHERE "turnId" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "agentMessage" ALTER COLUMN "turnId" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "agentMessage" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "agentMessage_status_enum"`);
  }
}
