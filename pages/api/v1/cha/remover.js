import chaRevelacao from "models/chaRevelacao.js";

async function remover(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!chaRevelacao.tokenAdminValido(request.body?.token)) {
    return response.status(401).json({ error: "Token inválido." });
  }
  try {
    const sala = chaRevelacao.validarSalaDoCha(request.query.sala);
    const { nome } = request.body;
    const removido = await chaRevelacao.removerPalpiteDoCha(nome, sala);
    return response.status(removido ? 200 : 404).json({});
  } catch (error) {
    if (!(error instanceof chaRevelacao.EntradaInvalidaDoCha)) throw error;
    return response.status(400).json({ error: error.message });
  }
}

export default remover;
