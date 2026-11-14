import chaRevelacao from "models/chaRevelacao.js";

async function resultado(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!chaRevelacao.tokenAdminValido(request.body?.token)) {
    return response.status(401).json({ error: "Token inválido." });
  }
  try {
    const { contagem, sexo } = request.body;
    if (contagem) await chaRevelacao.iniciarContagemDoCha();
    else await chaRevelacao.definirResultadoDoCha(sexo);
    return response.status(200).json({});
  } catch (error) {
    if (!(error instanceof chaRevelacao.EntradaInvalidaDoCha)) throw error;
    return response.status(400).json({ error: error.message });
  }
}

export default resultado;
