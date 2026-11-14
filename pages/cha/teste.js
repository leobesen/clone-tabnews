import Head from "next/head";
import { useState } from "react";
import estilosDoCha from "components/cha/estilos.js";
import { TIMES, TelaDoCha } from "pages/cha.js";

// Ensaio da brincadeira: mesmo visual de /cha, mas tudo fica na memória desta aba.
// Nenhum voto ou revelação daqui chega ao banco nem aos celulares dos convidados.
const SUSPENSE_MS = 10000;
const EU_DE_TESTE = {
  id: 1,
  nome: "Você (teste)",
  palpite: "menino",
  segredo: "",
};
const PALPITES_DE_TESTE = [
  { id: 1, nome: "Você (teste)", palpite: "menino" },
  { id: 2, nome: "Vó Ana", palpite: "menina" },
  { id: 3, nome: "Vô Carlos", palpite: "menino" },
  { id: 4, nome: "Tia Bia", palpite: "menina" },
  { id: 5, nome: "Dindo Rafa", palpite: "menino" },
];
const ESTADO_INICIAL = {
  palpites: PALPITES_DE_TESTE,
  resultado: null,
  revelaEm: 0,
};

function comPalpite(palpites, { nome, palpite }) {
  const existente = palpites.find((p) => p.nome === nome);
  const id = existente?.id ?? Math.max(0, ...palpites.map((p) => p.id)) + 1;
  const outros = palpites.filter((p) => p.id !== id);
  return [...outros, { id, nome, palpite }];
}

function BarraDeTeste({ resultado, aoRevelar }) {
  return (
    <aside className="cha-painel">
      {Object.keys(TIMES).map((sexo) => (
        <button
          key={sexo}
          className={`cha-${sexo}`}
          onClick={() => aoRevelar(sexo)}
        >
          {TIMES[sexo].grito}
        </button>
      ))}
      {resultado && <button onClick={() => aoRevelar(null)}>Desfazer</button>}
      <small>
        PÁGINA DE TESTE: nada aqui é gravado nem aparece para os convidados.
      </small>
    </aside>
  );
}

function ChaDeTeste() {
  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [eu, setEu] = useState(EU_DE_TESTE);
  async function simularPalpite(corpo) {
    const palpites = comPalpite(estado.palpites, corpo);
    setEstado({ ...estado, palpites });
    const { id } = palpites[palpites.length - 1];
    return { ok: true, json: async () => ({ id }) };
  }
  function revelar(resultado) {
    const revelaEm = resultado ? Date.now() + SUSPENSE_MS : 0;
    setEstado({ ...estado, resultado, revelaEm });
  }
  return (
    <div className="cha">
      <Head>
        <title>TESTE · Mathias ou Serena?</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,700;1,9..144,400&display=swap"
        />
      </Head>
      <TelaDoCha
        estado={estado}
        eu={eu}
        salvarEu={setEu}
        recarregar={async () => {}}
        enviarPalpite={simularPalpite}
      />
      <BarraDeTeste resultado={estado.resultado} aoRevelar={revelar} />
      <style dangerouslySetInnerHTML={{ __html: estilosDoCha }} />
    </div>
  );
}

export default ChaDeTeste;
