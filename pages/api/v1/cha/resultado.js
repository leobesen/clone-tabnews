import chaRevelacao from "models/chaRevelacao.js";

async function aplicarAcaoDoAdmin({ contagem, zerar, sexo }, sala) {
  if (zerar && sala !== chaRevelacao.SALA_DE_TESTE) {
    throw new chaRevelacao.EntradaInvalidaDoCha(
      `Zerar só existe na sala de teste; recebido sala ${JSON.stringify(sala)}.`,
    );
  }
  if (zerar) return chaRevelacao.zerarSalaDeTesteDoCha();
  if (contagem) return chaRevelacao.iniciarContagemDoCha(sala);
  return chaRevelacao.definirResultadoDoCha(sexo, sala);
}

async function resultado(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!chaRevelacao.tokenAdminValido(request.body?.token)) {
    return response.status(401).json({ error: "Token inválido." });
  }
  try {
    const sala = chaRevelacao.validarSalaDoCha(request.query.sala);
    await aplicarAcaoDoAdmin(request.body, sala);
    return response.status(200).json({});
  } catch (error) {
    if (!(error instanceof chaRevelacao.EntradaInvalidaDoCha)) throw error;
    return response.status(400).json({ error: error.message });
  }
}

export default resultado;
