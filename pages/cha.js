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
const EU_VAZIO = { nome: "", palpite: null, recado: "" };

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
      if (salvo?.nome) setEu({ ...EU_VAZIO, ...salvo });
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

function Entrada({ palpites, aoEntrar }) {
  const [nome, setNome] = useState("");
  const [recado, setRecado] = useState("");
  const limpo = nome.trim().replace(/\s+/g, " ");
  const repetido = palpites.some(
    (p) =>
      p.nome.toLocaleLowerCase("pt-BR") === limpo.toLocaleLowerCase("pt-BR"),
  );
  function enviar(evento) {
    evento.preventDefault();
    if (limpo && !repetido) aoEntrar({ nome: limpo, recado: recado.trim() });
  }
  return (
    <main className="cha-entrada">
      <p className="cha-sobre">Chá revelação · Leo &amp; Duda</p>
      <h1>
        <span className="cha-azul">Mathias</span> <em>ou</em>{" "}
        <span className="cha-rosa">Serena</span>?
      </h1>
      <p>
        Vamos ser papais! Antes de a gente descobrir, entre na brincadeira e
        deixe o seu palpite.
      </p>
      <form onSubmit={enviar}>
        <label htmlFor="cha-nome">Seu nome</label>
        <input
          id="cha-nome"
          value={nome}
          maxLength={40}
          autoComplete="name"
          onChange={(e) => setNome(e.target.value)}
          required
        />
        {repetido && (
          <p className="cha-aviso" role="alert">
            Já tem alguém com esse nome na brincadeira. Coloque um sobrenome ou
            apelido.
          </p>
        )}
        <label htmlFor="cha-recado">Um recado para o bebê (opcional)</label>
        <textarea
          id="cha-recado"
          value={recado}
          maxLength={140}
          rows={2}
          onChange={(e) => setRecado(e.target.value)}
        />
        <button type="submit">Entrar na brincadeira</button>
      </form>
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
function Disputa({ palpites, eu, aoEscolher, aoTrocar }) {
  const votando = !eu.palpite;
  return (
    <main className="cha-disputa">
      <p className="cha-faixa" aria-live="polite">
        {votando
          ? `${eu.nome}, o que você acha que vem aí?`
          : `Palpite anotado, ${eu.nome}! Aguardando a revelação…`}
        {!votando && <button onClick={aoTrocar}>trocar palpite</button>}
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
  const recados = palpites.filter((p) => p.recado);
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
      {recados.length > 0 && <h2>Recados para {nome}</h2>}
      {recados.map((p) => (
        <blockquote key={p.nome}>
          {p.recado}
          <cite>{p.nome}</cite>
        </blockquote>
      ))}
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
    if (resposta?.ok) salvarEu({ ...eu, palpite });
    setErro(
      resposta?.ok || resposta?.status === 409
        ? ""
        : "Não consegui salvar. Tente de novo.",
    );
    recarregar();
  }
  if (!estado) return <main className="cha-entrada">Carregando…</main>;
  if (contagem > 0) return <Suspense contagem={contagem} />;
  if (estado.resultado) return <Revelacao {...estado} eu={eu} />;
  if (!eu.nome) {
    return (
      <Entrada
        palpites={estado.palpites}
        aoEntrar={(dados) => salvarEu({ ...EU_VAZIO, ...dados })}
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
