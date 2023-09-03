import { MigrationInterface, QueryRunner } from "typeorm";

export class TestMigration1693691670945 implements MigrationInterface {
    name = 'TestMigration1693691670945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "testDB"."users" ("id" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "testDB"."tasks" ("id" character varying NOT NULL, "detail" character varying NOT NULL, "description" character varying NOT NULL, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), "id_usuario" character varying NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "testDB"."tasks" ADD CONSTRAINT "FK_f97999d191adb637e1bc556866c" FOREIGN KEY ("id_usuario") REFERENCES "testDB"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "testDB"."tasks" DROP CONSTRAINT "FK_f97999d191adb637e1bc556866c"`);
        await queryRunner.query(`DROP TABLE "testDB"."tasks"`);
        await queryRunner.query(`DROP TABLE "testDB"."users"`);
    }

}
