import chaRevelacao from "models/chaRevelacao.js";

async function cha(request, response) {
  if (request.method === "GET") {
    return response.status(200).json(await chaRevelacao.buscarEstadoDoCha());
  }
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  try {
    const gravado = await chaRevelacao.registrarPalpiteDoCha(request.body);
    if (!gravado) {
      return response.status(409).json({ error: "Palpites encerrados." });
    }
    return response.status(201).json({});
  } catch (error) {
    if (!(error instanceof chaRevelacao.EntradaInvalidaDoCha)) throw error;
    return response.status(400).json({ error: error.message });
  }
}

export default cha;
