import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1642122351602 implements MigrationInterface {
    name = 'migration1642122351602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" DROP COLUMN "playerTurn"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "board" ADD "playerTurn" integer NOT NULL`);
    }

}
