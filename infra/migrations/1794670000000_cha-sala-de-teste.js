/* eslint-disable camelcase */

exports.shorthands = undefined;

// Cópias das tabelas do chá para a sala de teste: o ensaio completo (TV, admin e
// celulares) grava aqui e nunca nos palpites reais.
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE cha_teste_palpites (
      id serial PRIMARY KEY,
      nome varchar(40) NOT NULL,
      nome_normalizado varchar(40) NOT NULL UNIQUE,
      palpite varchar(6) NOT NULL CHECK (palpite IN ('menino', 'menina')),
      segredo varchar(64) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE TABLE cha_teste_resultado (
      unica_linha boolean PRIMARY KEY DEFAULT true CHECK (unica_linha),
      sexo varchar(6) CHECK (sexo IN ('menino', 'menina')),
      revelado_em timestamptz NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql("DROP TABLE cha_teste_resultado; DROP TABLE cha_teste_palpites;");
};
