import chaRevelacao from "models/chaRevelacao.js";

async function responderAoCha(request, response) {
  const sala = chaRevelacao.validarSalaDoCha(request.query.sala);
  if (request.method === "GET") {
    const estado = await chaRevelacao.buscarEstadoDoCha(sala);
    return response.status(200).json(estado);
  }
  const id = await chaRevelacao.registrarPalpiteDoCha(request.body, sala);
  if (id === null) {
    return response
      .status(409)
      .json({ error: "Palpites encerrados ou nome já usado." });
  }
  return response.status(201).json({ id });
}

async function cha(request, response) {
  if (!["GET", "POST"].includes(request.method)) {
    return response.status(405).json({ error: "Method not allowed" });
  }
  try {
    return await responderAoCha(request, response);
  } catch (error) {
    if (!(error instanceof chaRevelacao.EntradaInvalidaDoCha)) throw error;
    return response.status(400).json({ error: error.message });
  }
}

export default cha;
