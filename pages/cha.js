import Head from "next/head";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import estilosDoCha from "components/cha/estilos.js";

const TIMES = {
  menino: {
    nome: "Mathias",
    significado: "presente de Deus",
    grito: "É menino!",
  },
  menina: {
    nome: "Serena",
    significado: "calma, tranquila",
    grito: "É menina!",
  },
};
const SEXOS = Object.keys(TIMES);
const CHAVE_LOCAL = "cha-revelacao-eu";
const EU_VAZIO = { nome: "", palpite: null, segredo: "" };
// Quem já votou neste aparelho e só quer acompanhar o placar.
const ESPECTADOR = { ...EU_VAZIO, espectador: true };

function postarJson(url, corpo) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

function useEstadoDoCha() {
  const [estado, setEstado] = useState(null);
  const recarregar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/v1/cha");
      if (!resposta.ok) return;
      const corpo = await resposta.json();
      const revelaEm =
        corpo.restante_ms > 0 ? Date.now() + corpo.restante_ms : 0;
      setEstado({ ...corpo, revelaEm });
    } catch {
      // Wi-Fi de festa oscila: mantém o último estado e tenta no próximo ciclo.
    }
  }, []);
  useEffect(() => {
    recarregar();
    const intervalo = setInterval(recarregar, 3000);
    return () => clearInterval(intervalo);
  }, [recarregar]);
  return [estado, recarregar];
}

function useEuSalvo() {
  const [eu, setEu] = useState(EU_VAZIO);
  useEffect(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_LOCAL));
      if (salvo) setEu({ ...EU_VAZIO, ...salvo });
    } catch {
      // Sem localStorage (aba anônima): o convidado só digita o nome de novo.
    }
  }, []);
  const salvarEu = useCallback((novo) => {
    setEu(novo);
    try {
      localStorage.setItem(CHAVE_LOCAL, JSON.stringify(novo));
    } catch {
      // Idem acima.
    }
  }, []);
  return [eu, salvarEu];
}

function useContagem(revelaEm) {
  const [, tique] = useState(0);
  useEffect(() => {
    if (!revelaEm || revelaEm <= Date.now()) return;
    const intervalo = setInterval(() => tique((n) => n + 1), 250);
    return () => clearInterval(intervalo);
  }, [revelaEm]);
  if (!revelaEm) return 0;
  return Math.max(0, Math.ceil((revelaEm - Date.now()) / 1000));
}

function Entrada({ palpites, aoEntrar, aoVoltar }) {
  const [nome, setNome] = useState("");
  const limpo = nome.trim().replace(/\s+/g, " ");
  const repetido = palpites.some(
    (p) =>
      p.nome.toLocaleLowerCase("pt-BR") === limpo.toLocaleLowerCase("pt-BR"),
  );
  // Convidados digitavam o nome do bebê aqui, achando que já era o palpite.
  const nomeDoBebe = Object.values(TIMES).some(
    (time) => time.nome.toLowerCase() === limpo.toLowerCase(),
  );
  function enviar(evento) {
    evento.preventDefault();
    if (limpo && !repetido && !nomeDoBebe) aoEntrar({ nome: limpo });
  }
  return (
    <main className="cha-entrada">
      <p className="cha-sobre">Chá revelação · Leo &amp; Duda</p>
      <h1>
        <span className="cha-azul">Mathias</span> <em>ou</em>{" "}
        <span className="cha-rosa">Serena</span>?
      </h1>
      <p>Vamos ser papais! Antes de a gente descobrir, entre na brincadeira.</p>
      <p className="cha-passos">
        <strong>1.</strong> Diga quem é você · <strong>2.</strong> Dê o seu
        palpite
      </p>
      <form onSubmit={enviar}>
        <label htmlFor="cha-nome">Quem é você? Escreva o SEU nome</label>
        <p className="cha-dica" id="cha-dica">
          Não é o nome do bebê: o palpite vem na próxima tela.
        </p>
        <input
          id="cha-nome"
          value={nome}
          maxLength={40}
          autoComplete="name"
          placeholder="Ex.: Tia Bia"
          aria-describedby="cha-dica"
          onChange={(e) => setNome(e.target.value)}
          required
        />
        {repetido && (
          <p className="cha-aviso" role="alert">
            Já tem alguém com esse nome na brincadeira. Coloque um sobrenome ou
            apelido.
          </p>
        )}
        {nomeDoBebe && (
          <p className="cha-aviso" role="alert">
            Esse é o nome do bebê! Aqui vai o seu nome. O palpite é na próxima
            tela.
          </p>
        )}
        <button type="submit">Continuar para o palpite</button>
      </form>
      <button type="button" className="cha-voltar" onClick={aoVoltar}>
        Já votei: voltar ao placar
      </button>
    </main>
  );
}

function ListaDeNomes({ palpites, meuNome }) {
  return (
    <ul className="cha-nomes">
      {palpites.map((p) => (
        <li key={p.nome} className={p.nome === meuNome ? "cha-eu" : undefined}>
          {p.nome}
        </li>
      ))}
    </ul>
  );
}

function MetadeDoTime({ sexo, time, aoEscolher, meuNome }) {
  const { nome, significado } = TIMES[sexo];
  if (aoEscolher) {
    return (
      <button
        className={`cha-metade cha-${sexo}`}
        onClick={() => aoEscolher(sexo)}
      >
        <strong>{nome}</strong>
        <span>“{significado}”</span>
        <small>toque para apostar</small>
      </button>
    );
  }
  return (
    <section
      className={`cha-metade cha-${sexo}`}
      style={{ flexGrow: time.length + 1 }}
    >
      <strong>{nome}</strong>
      <span>
        {time.length} {time.length === 1 ? "palpite" : "palpites"}
      </span>
      <ListaDeNomes palpites={time} meuNome={meuNome} />
    </section>
  );
}

// O placar só aparece depois do voto, para ninguém ir na onda da maioria.
function fraseDaFaixa(eu, votando) {
  if (votando) return `${eu.nome}, o que você acha que vem aí?`;
  if (eu.espectador) return "Aguardando a revelação…";
  return `Palpite anotado, ${eu.nome}! Aguardando a revelação…`;
}

function Disputa({
  palpites,
  eu,
  aoEscolher,
  aoTrocar,
  aoOutraPessoa,
  aoVoltar,
}) {
  const votando = !eu.palpite && !eu.espectador;
  return (
    <main className="cha-disputa">
      <p className="cha-faixa" aria-live="polite">
        {fraseDaFaixa(eu, votando)}
        {votando && aoVoltar && <button onClick={aoVoltar}>cancelar</button>}
        {eu.palpite && <button onClick={aoTrocar}>trocar palpite</button>}
        {/* Crianças e quem está sem celular votam pelo aparelho de outra pessoa. */}
        {!votando && (
          <button onClick={aoOutraPessoa}>votar por outra pessoa</button>
        )}
      </p>
      {SEXOS.map((sexo) => (
        <MetadeDoTime
          key={sexo}
          sexo={sexo}
          time={palpites.filter((p) => p.palpite === sexo)}
          aoEscolher={votando ? aoEscolher : null}
          meuNome={eu.nome}
        />
      ))}
    </main>
  );
}

function Suspense({ contagem }) {
  return (
    <main className="cha-suspense" aria-live="assertive">
      <p>É…</p>
      <strong key={contagem}>{contagem}</strong>
    </main>
  );
}

function Confete() {
  const pecas = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 4}s`,
        animationDuration: `${3 + Math.random() * 3}s`,
        opacity: 0.5 + (i % 3) * 0.25,
      })),
    [],
  );
  return (
    <div className="cha-confete" aria-hidden="true">
      {pecas.map((estilo, i) => (
        <i key={i} style={estilo} />
      ))}
    </div>
  );
}

function fraseParaMim(eu, resultado) {
  if (!eu.palpite) return "Bem-vindo(a) à família!";
  if (eu.palpite === resultado) return `${eu.nome}, você acertou!`;
  return `${eu.nome}, não foi dessa vez. Mas o amor é o mesmo!`;
}

function Revelacao({ palpites, resultado, eu }) {
  const { nome, significado, grito } = TIMES[resultado];
  const acertaram = palpites.filter((p) => p.palpite === resultado);
  return (
    <main className={`cha-revelacao cha-${resultado}`}>
      <Confete />
      <p className="cha-sobre">{grito}</p>
      <h1>{nome}</h1>
      <p className="cha-sobrenome">Kuhn Besen</p>
      <p>“{significado}”</p>
      <p className="cha-frase">{fraseParaMim(eu, resultado)}</p>
      <h2>
        Acertaram ({acertaram.length} de {palpites.length})
      </h2>
      <ListaDeNomes palpites={acertaram} meuNome={eu.nome} />
    </main>
  );
}

function PainelDoLeo({ token, resultado, aoMudar }) {
  async function definir(sexo, pergunta) {
    if (!window.confirm(pergunta)) return;
    const resposta = await postarJson("/api/v1/cha/resultado", { token, sexo });
    if (!resposta.ok) window.alert("Não deu certo: link de admin inválido.");
    aoMudar();
  }
  async function remover() {
    const nome = window.prompt("Nome a remover do placar:");
    if (!nome) return;
    const resposta = await postarJson("/api/v1/cha/remover", { token, nome });
    if (!resposta.ok) window.alert("Não encontrei esse nome no placar.");
    aoMudar();
  }
  return (
    <aside className="cha-painel">
      {SEXOS.map((sexo) => (
        <button
          key={sexo}
          className={`cha-${sexo}`}
          onClick={() =>
            definir(sexo, `Revelar para todos: ${TIMES[sexo].grito}`)
          }
        >
          {TIMES[sexo].grito}
        </button>
      ))}
      {!resultado && <button onClick={remover}>Remover nome</button>}
      {resultado && (
        <button onClick={() => definir(null, "Desfazer a revelação?")}>
          Desfazer
        </button>
      )}
    </aside>
  );
}

function TelaDoCha({ estado, eu, salvarEu, recarregar }) {
  const contagem = useContagem(estado?.revelaEm);
  const [erro, setErro] = useState("");
  async function apostar(palpite) {
    const resposta = await postarJson("/api/v1/cha", { ...eu, palpite }).catch(
      () => null,
    );
    await recarregar();
    if (resposta?.ok) salvarEu({ ...eu, palpite, anterior: undefined });
    const motivo =
      resposta?.status === 409
        ? "Esse nome já está em uso. Recarregue a página e use outro."
        : "Não consegui salvar. Tente de novo.";
    setErro(resposta?.ok ? "" : motivo);
    recarregar();
  }
  // Palpite removido pelo Leo (ex.: nome do bebê no lugar do nome): volta ao início.
  useEffect(() => {
    if (!estado || estado.resultado || !eu.palpite) return;
    const mesmoNome = (p) => p.nome.toLowerCase() === eu.nome.toLowerCase();
    if (!estado.palpites.some(mesmoNome)) salvarEu(EU_VAZIO);
  }, [estado, eu, salvarEu]);
  if (!estado) return <main className="cha-entrada">Carregando…</main>;
  if (contagem > 0) return <Suspense contagem={contagem} />;
  if (estado.resultado) return <Revelacao {...estado} eu={eu} />;
  const voltar = () => salvarEu(eu.anterior ?? ESPECTADOR);
  if (!eu.nome && !eu.espectador) {
    return (
      <Entrada
        palpites={estado.palpites}
        aoVoltar={voltar}
        aoEntrar={(dados) =>
          salvarEu({ ...eu, ...dados, segredo: crypto.randomUUID() })
        }
      />
    );
  }
  return (
    <>
      {erro && (
        <p className="cha-aviso cha-erro" role="alert">
          {erro}
        </p>
      )}
      <Disputa
        palpites={estado.palpites}
        eu={eu}
        aoEscolher={apostar}
        aoTrocar={() => salvarEu({ ...eu, palpite: null })}
        aoVoltar={eu.anterior ? voltar : null}
        aoOutraPessoa={() =>
          salvarEu({ ...EU_VAZIO, anterior: { ...eu, anterior: undefined } })
        }
      />
    </>
  );
}

function Cha() {
  const [estado, recarregar] = useEstadoDoCha();
  const [eu, salvarEu] = useEuSalvo();
  const token = useRouter().query.admin;
  return (
    <div className="cha">
      <Head>
        <title>Mathias ou Serena? · Chá revelação</title>
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
        salvarEu={salvarEu}
        recarregar={recarregar}
      />
      {token && estado && (
        <PainelDoLeo
          token={token}
          resultado={estado.resultado}
          aoMudar={recarregar}
        />
      )}
      <style dangerouslySetInnerHTML={{ __html: estilosDoCha }} />
    </div>
  );
}

export default Cha;
