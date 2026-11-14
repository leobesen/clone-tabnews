import { useState } from "react";
import { ESPECTADOR, PaginaDoCha, TIMES, TelaDoCha } from "pages/cha.js";
import { useSomAoPrimeiroToque } from "components/cha/som.js";

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
  contagem_iniciada: false,
  revelaEm: 0,
};

function comPalpite(palpites, { nome, palpite }) {
  const existente = palpites.find((p) => p.nome === nome);
  const id = existente?.id ?? Math.max(0, ...palpites.map((p) => p.id)) + 1;
  const outros = palpites.filter((p) => p.id !== id);
  return [...outros, { id, nome, palpite }];
}

const AVISO_DE_TESTE =
  "PÁGINA DE TESTE: nada aqui é gravado nem aparece para os convidados.";

// Mesma sequência do painel real: iniciar contagem, depois revelar ou desfazer.
function BarraDeTeste({ estado, aoIniciar, aoRevelar }) {
  if (!estado.contagem_iniciada && !estado.resultado) {
    return (
      <aside className="cha-painel">
        <button onClick={aoIniciar}>Iniciar contagem regressiva</button>
        <small>{AVISO_DE_TESTE}</small>
      </aside>
    );
  }
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
      <button onClick={() => aoRevelar(null)}>Desfazer</button>
      <small>{AVISO_DE_TESTE}</small>
    </aside>
  );
}

// modoTv: mesma simulação com a aparência de /cha/tv (usado por /cha/tv/teste).
export function ChaDeTeste({ modoTv = false }) {
  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [eu, setEu] = useState(modoTv ? ESPECTADOR : EU_DE_TESTE);
  useSomAoPrimeiroToque(modoTv);
  async function simularPalpite(corpo) {
    const palpites = comPalpite(estado.palpites, corpo);
    setEstado({ ...estado, palpites });
    const { id } = palpites[palpites.length - 1];
    return { ok: true, json: async () => ({ id }) };
  }
  function iniciarContagem() {
    const revelaEm = Date.now() + SUSPENSE_MS;
    setEstado({ ...estado, contagem_iniciada: true, revelaEm });
  }
  // resultado null = desfazer: volta para a votação.
  function revelar(resultado) {
    setEstado({ ...estado, resultado, contagem_iniciada: false, revelaEm: 0 });
  }
  return (
    <PaginaDoCha
      titulo="TESTE · Mathias ou Serena?"
      classe={modoTv ? "cha-tv" : ""}
    >
      <TelaDoCha
        estado={estado}
        eu={eu}
        salvarEu={setEu}
        recarregar={async () => {}}
        enviarPalpite={simularPalpite}
        somenteAssistir={modoTv}
      />
      <BarraDeTeste
        estado={estado}
        aoIniciar={iniciarContagem}
        aoRevelar={revelar}
      />
    </PaginaDoCha>
  );
}

export default ChaDeTeste;
