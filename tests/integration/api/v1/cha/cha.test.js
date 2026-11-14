import database from "infra/database.js";

const URL_CHA = "http://localhost:3000/api/v1/cha";
const TOKEN_ADMIN = process.env.CHA_TOKEN_ADMIN;

beforeAll(async () => {
  await database.query("drop schema public cascade; create schema public;");
  await fetch("http://localhost:3000/api/v1/migrations", { method: "POST" });
});

const SEGREDO = "segredo-de-teste-0001";

function postar(url, corpo) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

async function buscarEstado() {
  const resposta = await fetch(URL_CHA);
  return resposta.json();
}

test("palpite válido é gravado e trocar de ideia não duplica", async () => {
  const primeiro = await postar(URL_CHA, {
    nome: "  Vó   Ana ",
    palpite: "menina",
    segredo: SEGREDO,
  });
  expect(primeiro.status).toBe(201);
  await postar(URL_CHA, {
    nome: "vó ana",
    palpite: "menino",
    segredo: SEGREDO,
  });

  const estado = await buscarEstado();
  expect(estado.resultado).toBeNull();
  expect(estado.palpites).toEqual([
    { id: expect.any(Number), nome: "Vó Ana", palpite: "menino" },
  ]);
  expect((await primeiro.json()).id).toBe(estado.palpites[0].id);
});

test("outro aparelho não troca o palpite de um nome já usado", async () => {
  const intruso = await postar(URL_CHA, {
    nome: "Vó Ana",
    palpite: "menina",
    segredo: "segredo-de-outro-aparelho",
  });
  expect(intruso.status).toBe(409);
  expect((await buscarEstado()).palpites[0].palpite).toBe("menino");
});

test("palpite inválido retorna 400", async () => {
  const validos = { nome: "Tio", palpite: "menino", segredo: SEGREDO };
  for (const errado of [
    { nome: "  " },
    { palpite: "gato" },
    { segredo: "x" },
  ]) {
    const resposta = await postar(URL_CHA, { ...validos, ...errado });
    expect(resposta.status).toBe(400);
  }
});

test("resultado exige token", async () => {
  const resposta = await postar(`${URL_CHA}/resultado`, {
    token: "errado",
    sexo: "menina",
  });
  expect(resposta.status).toBe(401);
  expect((await buscarEstado()).resultado).toBeNull();
});

// O token não é versionado: rode com CHA_TOKEN_ADMIN=<token> npm test.
const testeComToken = TOKEN_ADMIN ? test : test.skip;

testeComToken("remover exige token e apaga só o nome pedido", async () => {
  const semToken = await postar(`${URL_CHA}/remover`, { nome: "Vó Ana" });
  expect(semToken.status).toBe(401);
  const dados = { nome: "Mathias", palpite: "menino", segredo: SEGREDO };
  await postar(URL_CHA, dados);

  const remocao = { token: TOKEN_ADMIN, nome: " mathias " };
  expect((await postar(`${URL_CHA}/remover`, remocao)).status).toBe(200);
  expect((await postar(`${URL_CHA}/remover`, remocao)).status).toBe(404);
  const nomes = (await buscarEstado()).palpites.map((p) => p.nome);
  expect(nomes).toEqual(["Vó Ana"]);
});

testeComToken(
  "renomear corrige o nome sem perder o voto nem o dono",
  async () => {
    const URL_RENOMEAR = `${URL_CHA}/renomear`;
    const semToken = await postar(URL_RENOMEAR, {
      nome: "Vó Ana",
      novoNome: "X",
    });
    expect(semToken.status).toBe(401);
    await postar(URL_CHA, {
      nome: "Serena",
      palpite: "menina",
      segredo: SEGREDO,
    });
    const antes = (await buscarEstado()).palpites.find(
      (p) => p.nome === "Serena",
    );

    const pedido = { token: TOKEN_ADMIN, nome: "serena" };
    const repetido = await postar(URL_RENOMEAR, {
      ...pedido,
      novoNome: "vó ana",
    });
    expect(repetido.status).toBe(400);
    const vazio = await postar(URL_RENOMEAR, { ...pedido, novoNome: " " });
    expect(vazio.status).toBe(400);
    const certo = await postar(URL_RENOMEAR, {
      ...pedido,
      novoNome: "Tia Bia",
    });
    expect(certo.status).toBe(200);
    // O nome antigo deixou de existir depois da correção.
    const sumiu = await postar(URL_RENOMEAR, { ...pedido, novoNome: "Outro" });
    expect(sumiu.status).toBe(404);

    const troca = { nome: "Tia Bia", palpite: "menino", segredo: SEGREDO };
    expect((await postar(URL_CHA, troca)).status).toBe(201);
    const depois = (await buscarEstado()).palpites.find(
      (p) => p.id === antes.id,
    );
    expect(depois).toEqual({
      id: antes.id,
      nome: "Tia Bia",
      palpite: "menino",
    });
    await postar(`${URL_CHA}/remover`, { token: TOKEN_ADMIN, nome: "Tia Bia" });
  },
);

testeComToken("revelar encerra os palpites e desfazer reabre", async () => {
  const revelar = await postar(`${URL_CHA}/resultado`, {
    token: TOKEN_ADMIN,
    sexo: "menina",
  });
  expect(revelar.status).toBe(200);

  const estado = await buscarEstado();
  expect(estado.resultado).toBe("menina");
  expect(estado.restante_ms).toBeGreaterThan(0);
  const atrasado = await postar(URL_CHA, {
    nome: "Tio",
    palpite: "menina",
    segredo: SEGREDO,
  });
  expect(atrasado.status).toBe(409);

  await postar(`${URL_CHA}/resultado`, { token: TOKEN_ADMIN, sexo: null });
  expect((await buscarEstado()).resultado).toBeNull();
});
