import { MigrationInterface, QueryRunner } from "typeorm";

export class DevGen1733567774568 implements MigrationInterface {
    name = 'DevGen1733567774568'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_chatting\` (\`id\` int NOT NULL AUTO_INCREMENT, \`is_active\` tinyint NOT NULL DEFAULT 1, \`joined_at\` datetime NULL, \`unreadMessageCount\` int NOT NULL DEFAULT '0', \`chatting_id\` int NOT NULL, \`user_id\` int NOT NULL, UNIQUE INDEX \`IDX_a4dbad0e709dc98b3ee9bf73d0\` (\`user_id\`, \`chatting_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_chatting\` ADD CONSTRAINT \`FK_9f7cd0af72b17daeb8bf80f9e42\` FOREIGN KEY (\`chatting_id\`) REFERENCES \`chatting\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_chatting\` ADD CONSTRAINT \`FK_7bc2ef9641c57a2a6c7e7ad9c4b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_chatting\` DROP FOREIGN KEY \`FK_7bc2ef9641c57a2a6c7e7ad9c4b\``);
        await queryRunner.query(`ALTER TABLE \`user_chatting\` DROP FOREIGN KEY \`FK_9f7cd0af72b17daeb8bf80f9e42\``);
        await queryRunner.query(`DROP INDEX \`IDX_a4dbad0e709dc98b3ee9bf73d0\` ON \`user_chatting\``);
        await queryRunner.query(`DROP TABLE \`user_chatting\``);
    }

}
