import { useEffect, useRef, useState } from "react";

// Sons sintetizados com Web Audio: sem arquivos de áudio para baixar ou licenciar.
// O ataque curto evita o estalo de uma nota que começa no volume cheio.
function tocarNota(audio, nota) {
  const { freq, inicio = 0, duracao = 0.2, tipo = "sine", volume = 0.2 } = nota;
  const oscilador = audio.createOscillator();
  const ganho = audio.createGain();
  const comeco = audio.currentTime + inicio;
  oscilador.type = tipo;
  oscilador.frequency.value = freq;
  ganho.gain.setValueAtTime(0.0001, comeco);
  ganho.gain.exponentialRampToValueAtTime(volume, comeco + 0.015);
  ganho.gain.exponentialRampToValueAtTime(0.001, comeco + duracao);
  oscilador.connect(ganho).connect(audio.destination);
  oscilador.start(comeco);
  oscilador.stop(comeco + duracao);
}

function tocarAcorde(audio, freqs, nota) {
  const { passo = 0, inicio = 0, ...resto } = nota;
  freqs.forEach((freq, i) =>
    tocarNota(audio, { ...resto, freq, inicio: inicio + i * passo }),
  );
}

const DO_MAIOR = [523, 659, 784, 1047];

// "suave" (padrão): um sino por segundo subindo uma escala pentatônica.
const SINOS = [523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];
const somSuave = {
  batida(audio, segundos) {
    const freq = SINOS[SINOS.length - segundos] ?? SINOS[0];
    tocarNota(audio, { freq, duracao: 0.9, volume: 0.18 });
    tocarNota(audio, { freq: freq / 2, duracao: 0.9, volume: 0.07 });
  },
  caixa(audio) {
    const sus = [262, 349, 392, 523];
    tocarAcorde(audio, sus, { passo: 0.15, duracao: 3, volume: 0.1 });
  },
  revelado(audio) {
    const arpejo = [...DO_MAIOR, 1319];
    tocarAcorde(audio, arpejo, { passo: 0.18, duracao: 1.2, volume: 0.16 });
    tocarAcorde(audio, DO_MAIOR, { inicio: 1, duracao: 2.5, volume: 0.09 });
  },
};

// "caixinha": Canção de Ninar de Brahms (1868, domínio público), duas notas por
// segundo, com timbre de caixinha de música. 0 = pausa.
const NINAR = [
  659, 659, 784, 0, 659, 659, 784, 0, 659, 784, 1047, 988, 880, 880, 784, 0,
  587, 659, 698, 587,
];
function tocarCaixinha(audio, freq, inicio = 0) {
  if (!freq) return;
  tocarNota(audio, { freq, inicio, duracao: 0.8, volume: 0.16 });
  tocarNota(audio, { freq: freq * 2, inicio, duracao: 0.3, volume: 0.05 });
}
const somDeCaixinha = {
  batida(audio, segundos) {
    const posicao = (10 - segundos) * 2;
    tocarCaixinha(audio, NINAR[posicao]);
    tocarCaixinha(audio, NINAR[posicao + 1], 0.5);
  },
  caixa(audio) {
    [784, 1047].forEach((freq, i) => tocarCaixinha(audio, freq, i * 0.4));
  },
  revelado(audio) {
    const final = [1047, 1319, 1568, 2093];
    final.forEach((freq, i) => tocarCaixinha(audio, freq, i * 0.2));
  },
};

// "coracao": batida grave dupla e bipe que sobe de tom; o mais tenso dos três.
const somDeCoracao = {
  batida(audio, segundos) {
    const bipe = { freq: 500 + (10 - segundos) * 60, tipo: "triangle" };
    tocarNota(audio, { freq: 62, duracao: 0.16, volume: 0.6 });
    tocarNota(audio, { freq: 62, inicio: 0.2, duracao: 0.16, volume: 0.45 });
    tocarNota(audio, { ...bipe, duracao: 0.12 });
    if (segundos <= 3)
      tocarNota(audio, { ...bipe, inicio: 0.5, duracao: 0.12 });
  },
  caixa(audio) {
    const tenso = [392, 494, 587, 740];
    tocarAcorde(audio, tenso, { passo: 0.09, duracao: 1.4, tipo: "triangle" });
  },
  revelado(audio) {
    const nota = { tipo: "triangle" };
    tocarAcorde(audio, DO_MAIOR, { ...nota, passo: 0.12, duracao: 0.4 });
    tocarAcorde(audio, DO_MAIOR, { ...nota, inicio: 0.55, duracao: 1.6 });
  },
};

const ESTILOS_DE_SOM = {
  suave: somSuave,
  caixinha: somDeCaixinha,
  coracao: somDeCoracao,
};

// O estilo vem do endereço (?som=caixinha), para a TV escolher sem botões na tela.
function estiloDoSom() {
  const pedido = new URLSearchParams(window.location.search).get("som");
  return ESTILOS_DE_SOM[pedido] ?? somSuave;
}

/**
 * Na TV não há onde "tocar" com facilidade: qualquer tecla do controle (ou clique
 * fora do botão) liga o som. O próprio botão fica de fora para não alternar duas vezes.
 * Ex.: useSomAoPrimeiroToque(true);
 */
export function useSomAoPrimeiroToque(ativo) {
  useEffect(() => {
    if (!ativo) return;
    function ligar(evento) {
      if (evento.target.closest?.(".cha-som")) return;
      document.querySelector('.cha-som[aria-pressed="false"]')?.click();
    }
    const eventos = ["keydown", "pointerdown"];
    eventos.forEach((nome) => window.addEventListener(nome, ligar));
    return () =>
      eventos.forEach((nome) => window.removeEventListener(nome, ligar));
  }, [ativo]);
}

/**
 * Som da contagem e da revelação. Começa desligado: navegadores só liberam áudio
 * depois de um toque, então alternarSom precisa ser chamado num clique.
 * Ex.: const [somLigado, alternarSom] = useSomDoCha(contagem, "contagem");
 */
export function useSomDoCha(contagem, fase) {
  const audio = useRef(null);
  const [ligado, setLigado] = useState(false);
  function alternarSom() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (ligado || !Audio) return setLigado(false);
    audio.current ??= new Audio();
    audio.current.resume();
    tocarNota(audio.current, { freq: 880, duracao: 0.4, volume: 0.15 });
    setLigado(true);
  }
  useEffect(() => {
    if (ligado && contagem > 0) estiloDoSom().batida(audio.current, contagem);
  }, [ligado, contagem]);
  useEffect(() => {
    if (!ligado || !["caixa", "revelado"].includes(fase)) return;
    estiloDoSom()[fase](audio.current);
  }, [ligado, fase]);
  return [ligado, alternarSom];
}
