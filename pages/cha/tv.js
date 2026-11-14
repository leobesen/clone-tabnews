import {
  ESPECTADOR,
  PaginaDoCha,
  TelaDoCha,
  useEstadoDoCha,
} from "pages/cha.js";
import { useSomAoPrimeiroToque } from "components/cha/som.js";

// Consulta o servidor a cada segundo para a TV virar junto com o toque do Leo.
const RITMO_DA_TV_MS = 1000;

// Tela para a televisão da festa: só acompanha (placar, contagem, caixa e
// revelação), sem cadastro, voto ou botões de convidado.
function ChaNaTv() {
  const [estado, recarregar] = useEstadoDoCha(RITMO_DA_TV_MS);
  useSomAoPrimeiroToque(true);
  return (
    <PaginaDoCha titulo="TV · Mathias ou Serena?" classe="cha-tv">
      <TelaDoCha
        estado={estado}
        eu={ESPECTADOR}
        salvarEu={() => {}}
        recarregar={recarregar}
        somenteAssistir
      />
    </PaginaDoCha>
  );
}

export default ChaNaTv;
