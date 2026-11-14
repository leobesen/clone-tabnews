import { createHash, timingSafeEqual } from "node:crypto";
import database from "infra/database.js";

const SEXOS_VALIDOS = ["menino", "menina"];
const LIMITE_PALPITES = 300;
// Tempo entre o toque do Leo e a revelação, para todos os celulares virarem juntos.
const SUSPENSE_MS = 10000;
// Só o hash vai para o repositório; o token fica no link privado do Leo.
const HASH_TOKEN_ADMIN =
  "89075c7dec192c149502eaeed605a523fdfa706450562d0bb1f0b9b65e99711a";

class EntradaInvalidaDoCha extends Error {}

function limparTexto(valor, limite) {
  if (typeof valor !== "string") return "";
  return valor.trim().replace(/\s+/g, " ").slice(0, limite);
}

function validarSexo(sexo) {
  if (SEXOS_VALIDOS.includes(sexo)) return sexo;
  throw new EntradaInvalidaDoCha(
    `Valor inválido: ${JSON.stringify(sexo)}. Esperado "menino" ou "menina".`,
  );
}

function validarPalpite(corpo) {
  const nome = limparTexto(corpo?.nome, 40);
  if (!nome) {
    throw new EntradaInvalidaDoCha(
      `Nome inválido: ${JSON.stringify(corpo?.nome)}. Esperado texto de 1 a 40 caracteres.`,
    );
  }
  const segredo = limparTexto(corpo?.segredo, 64);
  if (segredo.length < 16) {
    throw new EntradaInvalidaDoCha(
      `Segredo inválido (${segredo.length} caracteres). Esperado texto de 16 a 64 caracteres.`,
    );
  }
  return {
    nome,
    segredo,
    palpite: validarSexo(corpo?.palpite),
    recado: limparTexto(corpo?.recado, 140),
  };
}

/**
 * Estado completo da brincadeira, consultado por todos os celulares.
 * Ex.: const { palpites, resultado, restante_ms } = await buscarEstadoDoCha();
 */
async function buscarEstadoDoCha() {
  const palpites = await database.query(
    "SELECT nome, palpite, recado FROM cha_palpites ORDER BY created_at, id;",
  );
  const resultado = await database.query({
    text: `SELECT sexo, GREATEST(0, $1 - EXTRACT(EPOCH FROM (now() - revelado_em)) * 1000)::int AS restante_ms
           FROM cha_resultado;`,
    values: [SUSPENSE_MS],
  });
  return {
    palpites: palpites.rows,
    resultado: resultado.rows[0]?.sexo ?? null,
    restante_ms: resultado.rows[0]?.restante_ms ?? 0,
  };
}

/**
 * Grava (ou troca) o palpite de um convidado. Devolve false se a votação já
 * encerrou ou se o nome pertence a outro aparelho (segredo diferente).
 * Ex.: await registrarPalpiteDoCha({ nome: "Vó Ana", palpite: "menina", segredo });
 */
async function registrarPalpiteDoCha(corpo) {
  const { nome, palpite, recado, segredo } = validarPalpite(corpo);
  const gravado = await database.query({
    text: `INSERT INTO cha_palpites (nome, nome_normalizado, palpite, recado, segredo)
           SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar, $6::varchar
           WHERE NOT EXISTS (SELECT 1 FROM cha_resultado)
             AND ((SELECT count(*) FROM cha_palpites) < $5
               OR EXISTS (SELECT 1 FROM cha_palpites WHERE nome_normalizado = $2::varchar))
           ON CONFLICT (nome_normalizado)
           DO UPDATE SET palpite = EXCLUDED.palpite, recado = EXCLUDED.recado
           WHERE cha_palpites.segredo = EXCLUDED.segredo
           RETURNING id;`,
    values: [
      nome,
      nome.toLocaleLowerCase("pt-BR"),
      palpite,
      recado,
      LIMITE_PALPITES,
      segredo,
    ],
  });
  return gravado.rowCount > 0;
}

function tokenAdminValido(token) {
  if (typeof token !== "string") return false;
  const hash = createHash("sha256").update(token).digest();
  return timingSafeEqual(hash, Buffer.from(HASH_TOKEN_ADMIN, "hex"));
}

/**
 * Revela o sexo (ou desfaz, com sexo null, em caso de toque errado).
 * Ex.: await definirResultadoDoCha("menina");
 */
async function definirResultadoDoCha(sexo) {
  if (sexo === null) return database.query("DELETE FROM cha_resultado;");
  return database.query({
    text: `INSERT INTO cha_resultado (sexo) VALUES ($1)
           ON CONFLICT (unica_linha)
           DO UPDATE SET sexo = EXCLUDED.sexo, revelado_em = now();`,
    values: [validarSexo(sexo)],
  });
}

export default {
  EntradaInvalidaDoCha,
  buscarEstadoDoCha,
  registrarPalpiteDoCha,
  tokenAdminValido,
  definirResultadoDoCha,
};
