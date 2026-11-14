import database from "infra/database.js";

const URL_CHA = "http://localhost:3000/api/v1/cha";
const TOKEN_ADMIN = process.env.CHA_TOKEN_ADMIN;

beforeAll(async () => {
  await database.query("drop schema public cascade; create schema public;");
  await fetch("http://localhost:3000/api/v1/migrations", { method: "POST" });
});

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
    recado: "Te amo!",
  });
  expect(primeiro.status).toBe(201);
  await postar(URL_CHA, { nome: "vó ana", palpite: "menino" });

  const estado = await buscarEstado();
  expect(estado.resultado).toBeNull();
  expect(estado.palpites).toEqual([
    { nome: "Vó Ana", palpite: "menino", recado: "" },
  ]);
});

test("palpite inválido retorna 400", async () => {
  const semNome = await postar(URL_CHA, { nome: "  ", palpite: "menino" });
  expect(semNome.status).toBe(400);
  const sexoErrado = await postar(URL_CHA, { nome: "Tio", palpite: "gato" });
  expect(sexoErrado.status).toBe(400);
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

testeComToken("revelar encerra os palpites e desfazer reabre", async () => {
  const revelar = await postar(`${URL_CHA}/resultado`, {
    token: TOKEN_ADMIN,
    sexo: "menina",
  });
  expect(revelar.status).toBe(200);

  const estado = await buscarEstado();
  expect(estado.resultado).toBe("menina");
  expect(estado.restante_ms).toBeGreaterThan(0);
  const atrasado = await postar(URL_CHA, { nome: "Tio", palpite: "menina" });
  expect(atrasado.status).toBe(409);

  await postar(`${URL_CHA}/resultado`, { token: TOKEN_ADMIN, sexo: null });
  expect((await buscarEstado()).resultado).toBeNull();
});
