import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddFileRelationToFrontComponent1770742116157
  implements MigrationInterface
{
  name = 'AddFileRelationToFrontComponent1770742116157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD "fileId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD CONSTRAINT "UQ_fd86790edb444e6f6e36e021b64" UNIQUE ("fileId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" ADD CONSTRAINT "FK_fd86790edb444e6f6e36e021b64" FOREIGN KEY ("fileId") REFERENCES "core"."file"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP CONSTRAINT "FK_fd86790edb444e6f6e36e021b64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP CONSTRAINT "UQ_fd86790edb444e6f6e36e021b64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."frontComponent" DROP COLUMN "fileId"`,
    );
  }
}
