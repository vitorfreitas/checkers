import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1641986836554 implements MigrationInterface {
    name = 'migration1641986836554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "piece" ADD "isKing" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "piece" DROP COLUMN "isKing"`);
    }

}
