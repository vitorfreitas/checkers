import { MigrationInterface, QueryRunner } from 'typeorm';

export class migration1641949355462 implements MigrationInterface {
  name = 'migration1641949355462';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "game" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "accessToken" character varying NOT NULL, "playerTurn" integer NOT NULL, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "player" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "playerOrder" integer NOT NULL, "gameId" integer, CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "piece" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "row" integer NOT NULL, "column" integer NOT NULL, "boardId" integer, "playerId" integer, CONSTRAINT "PK_c14fb7d64989cd50598e9ac9480" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "board" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "playerTurn" integer NOT NULL, "gameId" integer, CONSTRAINT "REL_260aabf0e671fccc99b4e79ff9" UNIQUE ("gameId"), CONSTRAINT "PK_865a0f2e22c140d261b1df80eb1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "piece" ADD CONSTRAINT "FK_f23b5ec8966b98eccb156ccbdce" FOREIGN KEY ("boardId") REFERENCES "board"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "piece" ADD CONSTRAINT "FK_a1ce9a907a0f13a3a945e400154" FOREIGN KEY ("playerId") REFERENCES "player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "board" ADD CONSTRAINT "FK_260aabf0e671fccc99b4e79ff97" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board" DROP CONSTRAINT "FK_260aabf0e671fccc99b4e79ff97"`,
    );
    await queryRunner.query(
      `ALTER TABLE "piece" DROP CONSTRAINT "FK_a1ce9a907a0f13a3a945e400154"`,
    );
    await queryRunner.query(
      `ALTER TABLE "piece" DROP CONSTRAINT "FK_f23b5ec8966b98eccb156ccbdce"`,
    );
    await queryRunner.query(
      `ALTER TABLE "player" DROP CONSTRAINT "FK_7dfdd31fcd2b5aa3b08ed15fe8a"`,
    );
    await queryRunner.query(`DROP TABLE "board"`);
    await queryRunner.query(`DROP TABLE "piece"`);
    await queryRunner.query(`DROP TABLE "player"`);
    await queryRunner.query(`DROP TABLE "game"`);
  }
}
