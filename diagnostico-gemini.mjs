#!/usr/bin/env node
// Diagnóstico de cuota / enrutamiento de Gemini.
// Uso:  GEMINI_API_KEY="tu_clave" node diagnostico-gemini.mjs
//
// NO escribe la clave en ningún archivo ni la imprime: la lee solo de la
// variable de entorno GEMINI_API_KEY. Prueba combinaciones de modelo y de
// forma de autenticación, e imprime status HTTP + cuerpo crudo de cada una,
// más una tabla resumen al final. Busca alguna combinación que devuelva 200.

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("\n[ERROR] Falta la variable de entorno GEMINI_API_KEY.");
  console.error('Ejecuta:  GEMINI_API_KEY="tu_clave" node diagnostico-gemini.mjs\n');
  process.exit(1);
}

// --- Configuración de pruebas -------------------------------------------------

// Modelos a probar contra generativelanguage.googleapis.com (Gemini Developer API)
const MODELOS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-flash-latest",
  "gemini-1.5-flash",
  "gemini-2.0-flash-001",
];

const API_VERSION = "v1beta"; // v1beta soporta todos estos modelos
const BASE = `https://generativelanguage.googleapis.com/${API_VERSION}`;

// Cuerpo mínimo de generación
const BODY = JSON.stringify({
  contents: [{ role: "user", parts: [{ text: "Responde solo con: OK" }] }],
  generationConfig: { maxOutputTokens: 16 },
});

// Acumulador de resultados para la tabla final
const resultados = [];

function recorta(texto, n = 600) {
  if (!texto) return "";
  return texto.length > n ? texto.slice(0, n) + "…(recortado)" : texto;
}

async function probar(etiqueta, url, opciones) {
  let status = "ERR", cuerpo = "";
  try {
    const r = await fetch(url, opciones);
    status = r.status;
    cuerpo = await r.text();
  } catch (e) {
    cuerpo = "fetch falló: " + (e?.message || String(e));
  }
  const ok = status === 200;
  resultados.push({ etiqueta, status, ok, cuerpo });

  console.log("\n" + "=".repeat(78));
  console.log(`PRUEBA: ${etiqueta}`);
  console.log("URL:    " + url.replace(API_KEY, "***KEY***"));
  console.log("STATUS: " + status + (ok ? "   <<< 200 OK >>>" : ""));
  console.log("CUERPO: " + recorta(cuerpo));
  return ok;
}

async function main() {
  console.log("Iniciando diagnóstico de Gemini. La clave NO se imprime.\n");

  // (a) generativelanguage + clave por ?key=  , uno por modelo
  for (const modelo of MODELOS) {
    const url = `${BASE}/models/${modelo}:generateContent?key=${API_KEY}`;
    await probar(`(a) ?key=  · ${modelo}`, url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: BODY,
    });
  }

  // (b) generativelanguage + clave por header x-goog-api-key (por si cambia el
  //     enrutamiento de cuota). Probamos sobre los mismos modelos.
  for (const modelo of MODELOS) {
    const url = `${BASE}/models/${modelo}:generateContent`;
    await probar(`(b) header x-goog-api-key · ${modelo}`, url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY,
      },
      body: BODY,
    });
  }

  // (c) Vertex AI (aiplatform.googleapis.com).
  //     IMPORTANTE: Vertex NO acepta API keys de Google AI Studio. Requiere
  //     OAuth2 / token de cuenta de servicio (Authorization: Bearer <token>)
  //     y el ID de proyecto + región en la URL. Por eso un fetch directo desde
  //     el navegador con ?key= NO sirve aquí. Lo intentamos igual para
  //     documentar la respuesta (se espera 401/403 por falta de OAuth).
  const PROJECT = process.env.GCP_PROJECT_ID || "gen-lang-client-0215751684";
  const LOCATION = process.env.GCP_LOCATION || "us-central1";
  const vertexModel = "gemini-2.0-flash-001";
  const vertexUrl =
    `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}` +
    `/locations/${LOCATION}/publishers/google/models/${vertexModel}:generateContent`;
  await probar(`(c) Vertex AI (espera OAuth) · ${vertexModel}`, vertexUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY, // se prueba aunque Vertex normalmente ignora la API key
    },
    body: BODY,
  });

  // --- Tabla resumen ----------------------------------------------------------
  console.log("\n\n" + "#".repeat(78));
  console.log("TABLA RESUMEN");
  console.log("#".repeat(78));
  const filas = resultados.map((r) => {
    let nota = "";
    if (r.ok) nota = "OK";
    else if (String(r.status) === "429") nota = "cuota (429)";
    else if (String(r.status) === "401" || String(r.status) === "403") nota = "auth";
    else if (String(r.status) === "404") nota = "modelo/ruta no existe";
    else nota = "ver cuerpo";
    return { Prueba: r.etiqueta, Status: r.status, Resultado: nota };
  });
  console.table(filas);

  const algun200 = resultados.some((r) => r.ok);
  console.log(
    algun200
      ? "\n>>> Hay al menos UNA combinación con 200. Úsala en el HTML.\n"
      : "\n>>> NINGUNA combinación dio 200. Revisa el diagnóstico de plataforma.\n"
  );
}

main();
