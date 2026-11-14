import { useEffect, useRef, useState } from "react";

// Sons sintetizados com Web Audio: sem arquivos de áudio para baixar ou licenciar.
function tocarNota(audio, nota) {
  const { freq, inicio = 0, duracao = 0.2, tipo = "sine", volume = 0.2 } = nota;
  const oscilador = audio.createOscillator();
  const ganho = audio.createGain();
  const comeco = audio.currentTime + inicio;
  oscilador.type = tipo;
  oscilador.frequency.value = freq;
  ganho.gain.setValueAtTime(volume, comeco);
  ganho.gain.exponentialRampToValueAtTime(0.001, comeco + duracao);
  oscilador.connect(ganho).connect(audio.destination);
  oscilador.start(comeco);
  oscilador.stop(comeco + duracao);
}

// Um "coração" grave por segundo e um bipe que sobe de tom conforme o zero chega.
function tocarBatida(audio, segundosRestantes) {
  const bipe = 500 + (10 - segundosRestantes) * 60;
  tocarNota(audio, { freq: 62, duracao: 0.16, volume: 0.6 });
  tocarNota(audio, { freq: 62, inicio: 0.2, duracao: 0.16, volume: 0.45 });
  tocarNota(audio, { freq: bipe, duracao: 0.12, tipo: "triangle" });
  if (segundosRestantes > 3) return;
  tocarNota(audio, {
    freq: bipe,
    inicio: 0.5,
    duracao: 0.12,
    tipo: "triangle",
  });
}

// Acorde que sobe e não resolve: a caixa ainda está fechada.
function tocarSuspense(audio) {
  [392, 494, 587, 740].forEach((freq, i) =>
    tocarNota(audio, {
      freq,
      inicio: i * 0.09,
      duracao: 1.4,
      tipo: "triangle",
    }),
  );
}

function tocarFanfarra(audio) {
  const notas = [523, 659, 784, 1047];
  notas.forEach((freq, i) =>
    tocarNota(audio, {
      freq,
      inicio: i * 0.12,
      duracao: 0.4,
      tipo: "triangle",
    }),
  );
  notas.forEach((freq) =>
    tocarNota(audio, { freq, inicio: 0.55, duracao: 1.6, tipo: "triangle" }),
  );
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
    tocarNota(audio.current, { freq: 880, duracao: 0.15 });
    setLigado(true);
  }
  useEffect(() => {
    if (ligado && contagem > 0) tocarBatida(audio.current, contagem);
  }, [ligado, contagem]);
  useEffect(() => {
    if (ligado && fase === "caixa") tocarSuspense(audio.current);
    if (ligado && fase === "revelado") tocarFanfarra(audio.current);
  }, [ligado, fase]);
  return [ligado, alternarSom];
}
