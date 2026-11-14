/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE cha_palpites (
      id serial PRIMARY KEY,
      nome varchar(40) NOT NULL,
      nome_normalizado varchar(40) NOT NULL UNIQUE,
      palpite varchar(6) NOT NULL CHECK (palpite IN ('menino', 'menina')),
      segredo varchar(64) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    -- unica_linha garante no máximo um resultado gravado.
    CREATE TABLE cha_resultado (
      unica_linha boolean PRIMARY KEY DEFAULT true CHECK (unica_linha),
      sexo varchar(6) NOT NULL CHECK (sexo IN ('menino', 'menina')),
      revelado_em timestamptz NOT NULL DEFAULT now()
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql("DROP TABLE cha_resultado; DROP TABLE cha_palpites;");
};
