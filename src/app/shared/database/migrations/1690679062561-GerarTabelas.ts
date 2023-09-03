import { MigrationInterface, QueryRunner } from 'typeorm';

export class GerarTabelas1690679062561 implements MigrationInterface {
  name = 'GerarTabelas1690679062561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "taskvault"."users" ("id" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "taskvault"."tasks" ("id" character varying NOT NULL, "detail" character varying NOT NULL, "description" character varying NOT NULL, "data_criacao" TIMESTAMP NOT NULL DEFAULT now(), "data_atualizacao" TIMESTAMP NOT NULL DEFAULT now(), "id_usuario" character varying NOT NULL, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "taskvault"."tasks" ADD CONSTRAINT "FK_f97999d191adb637e1bc556866c" FOREIGN KEY ("id_usuario") REFERENCES "taskvault"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "taskvault"."tasks" DROP CONSTRAINT "FK_f97999d191adb637e1bc556866c"`);
    await queryRunner.query(`DROP TABLE "taskvault"."tasks"`);
    await queryRunner.query(`DROP TABLE "taskvault"."users"`);
  }
}
