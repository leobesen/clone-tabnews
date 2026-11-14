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

// A sala "teste" usa tabelas próprias (cha_teste_*): o ensaio com TV, admin e
// celulares passa pelo servidor sem tocar nos palpites reais da festa.
const SALA_DA_FESTA = "festa";
const SALA_DE_TESTE = "teste";

/**
 * Valida o parâmetro ?sala= das rotas; ausente significa a festa real.
 * Ex.: const sala = validarSalaDoCha(request.query.sala);
 */
function validarSalaDoCha(sala = SALA_DA_FESTA) {
  if ([SALA_DA_FESTA, SALA_DE_TESTE].includes(sala)) return sala;
  throw new EntradaInvalidaDoCha(
    `Sala inválida: ${JSON.stringify(sala)}. Esperado "festa" ou "teste".`,
  );
}

function consultarNaSala(sala, consulta) {
  const texto = typeof consulta === "string" ? consulta : consulta.text;
  const text =
    sala === SALA_DE_TESTE
      ? texto.replace(/cha_(palpites|resultado)/g, "cha_teste_$1")
      : texto;
  return database.query({ text, values: consulta.values ?? [] });
}

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
  };
}

/**
 * Estado completo da brincadeira, consultado por todos os celulares.
 * contagem_iniciada: a contagem foi disparada e a caixa ainda não foi revelada;
 * restante_ms: quanto falta da contagem (0 depois que ela termina).
 * Ex.: const { palpites, resultado, restante_ms } = await buscarEstadoDoCha();
 */
async function buscarEstadoDoCha(sala = SALA_DA_FESTA) {
  const palpites = await consultarNaSala(
    sala,
    "SELECT id, nome, palpite FROM cha_palpites ORDER BY created_at, id;",
  );
  const resultado = await consultarNaSala(sala, {
    text: `SELECT sexo, CASE WHEN sexo IS NULL
             THEN GREATEST(0, $1 - EXTRACT(EPOCH FROM (now() - revelado_em)) * 1000)::int
             ELSE 0 END AS restante_ms
           FROM cha_resultado;`,
    values: [SUSPENSE_MS],
  });
  return {
    palpites: palpites.rows,
    resultado: resultado.rows[0]?.sexo ?? null,
    contagem_iniciada: resultado.rows.length > 0 && !resultado.rows[0].sexo,
    restante_ms: resultado.rows[0]?.restante_ms ?? 0,
  };
}

/**
 * Grava (ou troca) o palpite de um convidado. Devolve o id do palpite, ou null se a
 * votação já encerrou ou se o nome pertence a outro aparelho (segredo diferente).
 * Ex.: await registrarPalpiteDoCha({ nome: "Vó Ana", palpite: "menina", segredo });
 */
async function registrarPalpiteDoCha(corpo, sala = SALA_DA_FESTA) {
  const { nome, palpite, segredo } = validarPalpite(corpo);
  const gravado = await consultarNaSala(sala, {
    text: `INSERT INTO cha_palpites (nome, nome_normalizado, palpite, segredo)
           SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar
           WHERE NOT EXISTS (SELECT 1 FROM cha_resultado)
             AND ((SELECT count(*) FROM cha_palpites) < $5
               OR EXISTS (SELECT 1 FROM cha_palpites WHERE nome_normalizado = $2::varchar))
           ON CONFLICT (nome_normalizado)
           DO UPDATE SET palpite = EXCLUDED.palpite
           WHERE cha_palpites.segredo = EXCLUDED.segredo
           RETURNING id;`,
    values: [
      nome,
      nome.toLocaleLowerCase("pt-BR"),
      palpite,
      segredo,
      LIMITE_PALPITES,
    ],
  });
  return gravado.rows[0]?.id ?? null;
}

function tokenAdminValido(token) {
  if (typeof token !== "string") return false;
  const hash = createHash("sha256").update(token).digest();
  return timingSafeEqual(hash, Buffer.from(HASH_TOKEN_ADMIN, "hex"));
}

/**
 * Dispara a contagem regressiva em todas as telas e encerra a votação, sem
 * revelar nada: o sexo só entra depois que a caixa de balões é aberta.
 * Ex.: await iniciarContagemDoCha();
 */
async function iniciarContagemDoCha(sala = SALA_DA_FESTA) {
  return consultarNaSala(
    sala,
    `INSERT INTO cha_resultado (sexo) VALUES (NULL)
     ON CONFLICT (unica_linha) DO UPDATE SET sexo = NULL, revelado_em = now();`,
  );
}

/**
 * Revela o sexo (ou desfaz, com sexo null, em caso de toque errado).
 * Ex.: await definirResultadoDoCha("menina");
 */
async function definirResultadoDoCha(sexo, sala = SALA_DA_FESTA) {
  if (sexo === null) return consultarNaSala(sala, "DELETE FROM cha_resultado;");
  return consultarNaSala(sala, {
    text: `INSERT INTO cha_resultado (sexo) VALUES ($1)
           ON CONFLICT (unica_linha)
           DO UPDATE SET sexo = EXCLUDED.sexo, revelado_em = now();`,
    values: [validarSexo(sexo)],
  });
}

/**
 * Remove o palpite de um nome (ex.: quem digitou o nome do bebê); devolve false se não existir.
 * Ex.: await removerPalpiteDoCha("Mathias");
 */
async function removerPalpiteDoCha(nome, sala = SALA_DA_FESTA) {
  const removido = await consultarNaSala(sala, {
    text: "DELETE FROM cha_palpites WHERE nome_normalizado = $1;",
    values: [limparTexto(nome, 40).toLocaleLowerCase("pt-BR")],
  });
  return removido.rowCount > 0;
}

/**
 * Corrige o nome de quem votou (ex.: digitou o nome do bebê). Devolve false se o
 * nome atual não existir; lança EntradaInvalidaDoCha se o novo for vazio ou repetido.
 * Ex.: await renomearPalpiteDoCha("Mathias", "Tio Beto");
 */
async function renomearPalpiteDoCha(nomeAtual, nomeNovo, sala = SALA_DA_FESTA) {
  const novo = limparTexto(nomeNovo, 40);
  if (!novo) {
    throw new EntradaInvalidaDoCha(
      `Nome novo inválido: ${JSON.stringify(nomeNovo)}. Esperado texto de 1 a 40 caracteres.`,
    );
  }
  const atual = limparTexto(nomeAtual, 40).toLocaleLowerCase("pt-BR");
  try {
    const renomeado = await consultarNaSala(sala, {
      text: "UPDATE cha_palpites SET nome = $1, nome_normalizado = $2 WHERE nome_normalizado = $3;",
      values: [novo, novo.toLocaleLowerCase("pt-BR"), atual],
    });
    return renomeado.rowCount > 0;
  } catch (error) {
    // 23505 = unique_violation: já existe outro palpite com o nome novo.
    if (error.code !== "23505") throw error;
    throw new EntradaInvalidaDoCha(`Nome já usado: ${JSON.stringify(novo)}.`);
  }
}

/**
 * Apaga palpites e resultado da sala de teste, para recomeçar o ensaio.
 * Só existe para a sala de teste: a festa real não tem "zerar".
 * Ex.: await zerarSalaDeTesteDoCha();
 */
async function zerarSalaDeTesteDoCha() {
  await database.query("DELETE FROM cha_teste_palpites;");
  await database.query("DELETE FROM cha_teste_resultado;");
}

export default {
  SALA_DE_TESTE,
  validarSalaDoCha,
  zerarSalaDeTesteDoCha,
  iniciarContagemDoCha,
  renomearPalpiteDoCha,
  removerPalpiteDoCha,
  EntradaInvalidaDoCha,
  buscarEstadoDoCha,
  registrarPalpiteDoCha,
  tokenAdminValido,
  definirResultadoDoCha,
};
