import {
  ESPECTADOR,
  PaginaDoCha,
  SeloDeTeste,
  TelaDoCha,
  useEstadoDoCha,
} from "pages/cha.js";
import { useSomAoPrimeiroToque } from "components/cha/som.js";

// Consulta o servidor a cada segundo para a TV virar junto com o toque do Leo.
const RITMO_DA_TV_MS = 1000;

/**
 * Tela para a televisão: só acompanha a sala (placar, contagem, caixa e
 * revelação), sem cadastro, voto, links ou botões de convidado.
 * Ex.: <TelaDaTv sala="teste" />
 */
export function TelaDaTv({ sala = "festa" }) {
  const [estado, recarregar] = useEstadoDoCha(RITMO_DA_TV_MS, sala);
  useSomAoPrimeiroToque(true);
  return (
    <PaginaDoCha titulo="TV · Mathias ou Serena?" classe="cha-tv">
      <SeloDeTeste sala={sala} />
      <TelaDoCha
        estado={estado}
        eu={ESPECTADOR}
        salvarEu={() => {}}
        recarregar={recarregar}
        sala={sala}
        somenteAssistir
      />
    </PaginaDoCha>
  );
}

function ChaNaTv() {
  return <TelaDaTv />;
}

export default ChaNaTv;
