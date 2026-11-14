const estilosDoCha = `
body { margin: 0; }
.cha {
  --azul: #1d3f8f; --rosa: #c8376a; --creme: #fdf6ec; --tinta: #2a2233; --sol: #ffd166;
  min-height: 100vh; min-height: 100dvh; background: var(--creme); color: var(--tinta);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.5;
}
.cha *, .cha *::before { box-sizing: border-box; }
.cha h1, .cha h2, .cha strong, .cha-sobrenome { font-family: "Fraunces", Georgia, serif; }
.cha :focus-visible { outline: 3px solid var(--sol); outline-offset: 2px; }
.cha button { font: inherit; cursor: pointer; }
.cha-menino { background: var(--azul); }
.cha-menina { background: var(--rosa); }
.cha-azul { color: var(--azul); }
.cha-rosa { color: var(--rosa); }
.cha-sobre { text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.8rem; font-weight: 700; margin: 0; }

.cha-entrada { max-width: 30rem; margin: 0 auto; padding: 3.5rem 1.25rem 7rem; }
.cha-entrada h1 { font-size: clamp(2.8rem, 13vw, 4.5rem); line-height: 1; margin: 0.6rem 0 1.2rem; }
.cha-entrada h1 em { font-weight: 400; font-size: 0.6em; }
.cha-entrada form { display: grid; gap: 0.4rem; margin-top: 1.5rem; }
.cha-entrada label { font-weight: 700; font-size: 0.9rem; margin-top: 0.6rem; }
.cha-entrada input {
  font: inherit; font-size: 1rem; padding: 0.8rem; width: 100%;
  border: 2px solid var(--tinta); border-radius: 12px; background: #fff; color: var(--tinta);
}
.cha-entrada form button {
  margin-top: 1rem; padding: 1rem; border: 0; border-radius: 999px;
  background: var(--tinta); color: var(--creme); font-weight: 700;
}
.cha-passos { margin: 1rem 0 0; padding: 0.7rem 1rem; border-radius: 12px; background: #f3e6d2; }
.cha-dica { margin: 0; font-size: 0.9rem; }
.cha-entrada input::placeholder { color: #8a8490; }
.cha-aviso { color: #8f2a00; font-size: 0.9rem; margin: 0; }
.cha-erro { background: var(--sol); text-align: center; padding: 0.5rem; }

.cha-disputa { display: flex; flex-direction: column; min-height: 100vh; min-height: 100dvh; }
.cha-faixa { margin: 0; padding: 0.9rem 1rem; text-align: center; background: var(--tinta); color: var(--creme); }
.cha-faixa button { background: none; border: 0; color: inherit; text-decoration: underline; margin-left: 0.5rem; padding: 0.3rem; }
.cha-metade {
  flex: 1 1 0; min-height: 30dvh; padding: 1.5rem 1rem; border: 0; color: var(--creme);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem;
  text-align: center; transition: flex-grow 0.8s ease;
}
.cha-metade strong { font-size: clamp(3rem, 15vw, 6rem); line-height: 1; }
.cha-metade small { margin-top: 0.8rem; padding: 0.3rem 0.9rem; border: 1px solid currentColor; border-radius: 999px; font-size: 0.85rem; }
button.cha-metade:hover strong, button.cha-metade:active strong { transform: scale(1.06); }
.cha-metade strong { transition: transform 0.2s ease; }
.cha-nomes { list-style: none; margin: 0.8rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; }
.cha-nomes li { padding: 0.25rem 0.75rem; border-radius: 999px; background: rgba(255, 255, 255, 0.18); }
.cha-nomes .cha-eu { background: var(--creme); color: var(--tinta); font-weight: 700; }
@media (min-width: 720px) {
  .cha-disputa { flex-direction: row; flex-wrap: wrap; }
  .cha-faixa { flex-basis: 100%; }
  .cha-metade { min-height: calc(100vh - 3.4rem); min-height: calc(100dvh - 3.4rem); }
}

.cha-suspense {
  position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--creme); animation: cha-pisca 0.7s ease-in-out infinite alternate;
}
.cha-suspense p { font-size: 2rem; margin: 0; }
.cha-suspense strong { font-size: 45vmin; line-height: 1; animation: cha-surge 0.9s ease-out; }
@keyframes cha-pisca { from { background: var(--azul); } to { background: var(--rosa); } }
@keyframes cha-surge { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.cha-revelacao { position: relative; overflow: hidden; min-height: 100vh; min-height: 100dvh; padding: 3.5rem 1.25rem 7rem; text-align: center; color: var(--creme); }
.cha-revelacao h1 { font-size: clamp(4rem, 23vw, 10rem); line-height: 1; margin: 0.5rem 0 0; animation: cha-surge 1.2s cubic-bezier(0.2, 1.4, 0.4, 1); }
.cha-sobrenome { font-style: italic; font-size: clamp(1.6rem, 8vw, 3rem); margin: 0; }
.cha-frase { font-size: 1.25rem; font-weight: 700; margin: 2rem 0; }
.cha-revelacao h2 { font-size: 1.3rem; margin: 2.5rem 0 0; }
.cha-confete { position: absolute; inset: 0; pointer-events: none; }
.cha-confete i { position: absolute; top: -2rem; width: 0.6rem; height: 1rem; background: var(--creme); animation: cha-cair linear infinite; }
.cha-confete i:nth-child(3n) { background: var(--sol); }
.cha-confete i:nth-child(3n + 1) { border-radius: 50%; height: 0.6rem; }
@keyframes cha-cair { to { transform: translateY(110vh) rotate(720deg); } }

.cha-painel { position: fixed; z-index: 10; left: 0; right: 0; bottom: 0; display: flex; gap: 0.5rem; padding: 0.6rem; background: var(--tinta); }
.cha-painel button { flex: 1; padding: 0.8rem 0.4rem; border: 2px solid var(--creme); border-radius: 10px; color: var(--creme); font-weight: 700; }
.cha-painel button:not([class]) { background: #55505c; }

@media (prefers-reduced-motion: reduce) {
  .cha *, .cha { animation: none !important; transition: none !important; }
  .cha-suspense { background: var(--tinta); }
}
`;

export default estilosDoCha;
