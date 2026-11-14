import { ChaDosConvidados } from "pages/cha.js";

// Ensaio completo: mesma página dos convidados, ligada à sala de teste do servidor
// (tabelas cha_teste_*). Nada daqui aparece na votação real.
function ChaDeTeste() {
  return <ChaDosConvidados sala="teste" />;
}

export default ChaDeTeste;
