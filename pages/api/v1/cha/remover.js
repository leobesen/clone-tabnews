import chaRevelacao from "models/chaRevelacao.js";

async function remover(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  if (!chaRevelacao.tokenAdminValido(request.body?.token)) {
    return response.status(401).json({ error: "Token inválido." });
  }
  const removido = await chaRevelacao.removerPalpiteDoCha(request.body.nome);
  return response.status(removido ? 200 : 404).json({});
}

export default remover;
