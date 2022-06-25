import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1656191676443 implements MigrationInterface {
    name = 'migration1656191676443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "base_piece" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "row" integer NOT NULL, "column" integer NOT NULL, "isKing" boolean, "type" character varying NOT NULL, "boardId" integer, "playerId" integer, CONSTRAINT "PK_81ef565978f265b26895eb24f87" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4c5ca51f5e5c59e0e919f2c5e2" ON "base_piece" ("type") `);
        await queryRunner.query(`ALTER TABLE "base_piece" ADD CONSTRAINT "FK_0fc3b16055b6a021cb2a596ea54" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "base_piece" ADD CONSTRAINT "FK_51f1e8ad631dd5e862ce7d14013" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "base_piece" DROP CONSTRAINT "FK_51f1e8ad631dd5e862ce7d14013"`);
        await queryRunner.query(`ALTER TABLE "base_piece" DROP CONSTRAINT "FK_0fc3b16055b6a021cb2a596ea54"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c5ca51f5e5c59e0e919f2c5e2"`);
        await queryRunner.query(`DROP TABLE "base_piece"`);
    }

}
