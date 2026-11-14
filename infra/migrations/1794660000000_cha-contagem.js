/* eslint-disable camelcase */

exports.shorthands = undefined;

// Linha em cha_resultado com sexo NULL = contagem regressiva iniciada, caixa ainda
// fechada. O sexo só é preenchido depois que a família vê a cor dos balões.
exports.up = (pgm) => {
  pgm.sql("ALTER TABLE cha_resultado ALTER COLUMN sexo DROP NOT NULL;");
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM cha_resultado WHERE sexo IS NULL;
    ALTER TABLE cha_resultado ALTER COLUMN sexo SET NOT NULL;
  `);
};
