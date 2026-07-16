// Publicidad por WhatsApp — envía una promoción a todos los clientes registrados.
//
// Uso:
//   node src/broadcast.js "🔥 Hoy 2x1 en pepitos hasta las 9pm. ¡Naguará!"
//   node src/broadcast.js --file promo.txt
//
// El bot (src/bot.js) debe haberse ejecutado al menos una vez para tener sesión
// autenticada. Este script reutiliza esa misma sesión (.wwebjs_auth).
//
// IMPORTANTE (evitar bloqueos de WhatsApp):
//  - Solo se envía a clientes que YA te escribieron (no números comprados).
//  - Se respeta la baja (opt-out): quien escribió "baja" no recibe nada.
//  - Se envía despacio, con pausas aleatorias entre mensajes.
//  - No abuses: 1–2 campañas por semana como máximo.

require("dotenv").config();
const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const orders = require("./orders");
const config = require("./config");

// --- Leer el mensaje ---
const args = process.argv.slice(2);
let mensaje = "";
const fileIdx = args.indexOf("--file");
if (fileIdx !== -1 && args[fileIdx + 1]) {
  mensaje = fs.readFileSync(args[fileIdx + 1], "utf8").trim();
} else {
  mensaje = args.filter((a) => !a.startsWith("--")).join(" ").trim();
}

const soloTest = args.includes("--test"); // solo envía a los admins

if (!mensaje) {
  console.error(
    '❌ Falta el mensaje.\n' +
    'Ejemplo: node src/broadcast.js "🔥 Hoy 2x1 en pepitos hasta las 9pm"\n' +
    "O:        node src/broadcast.js --file promo.txt"
  );
  process.exit(1);
}

const pie = `\n\n_Responde *baja* para no recibir promociones._`;

function pausa(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: { headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] },
});

client.on("qr", (qr) => {
  console.log("📱 Escanea el QR (misma sesión del bot):");
  qrcode.generate(qr, { small: true });
});

client.on("ready", async () => {
  const clientes = soloTest
    ? config.admins.map((chatId) => ({ chatId, nombre: "admin" }))
    : orders.listarClientes({ soloActivos: true });

  if (!clientes.length) {
    console.log("No hay clientes registrados todavía. Corre el bot y recibe algún mensaje primero.");
    process.exit(0);
  }

  console.log(`\n📣 Campaña de ${config.negocio.nombre}`);
  console.log(`   Destinatarios: ${clientes.length}${soloTest ? " (MODO TEST)" : ""}`);
  console.log(`   Mensaje:\n   ${mensaje.replace(/\n/g, "\n   ")}\n`);

  let ok = 0;
  let fail = 0;
  for (const c of clientes) {
    try {
      const saludo = c.nombre ? `Hola ${c.nombre.split(" ")[0]} 👋\n\n` : "";
      await client.sendMessage(c.chatId, saludo + mensaje + pie);
      ok++;
      console.log(`✅ ${c.chatId.replace("@c.us", "")}`);
    } catch (e) {
      fail++;
      console.log(`❌ ${c.chatId.replace("@c.us", "")} — ${e.message}`);
    }
    // Pausa 4–9s entre envíos para lucir humano y no ser bloqueado
    await pausa(4000 + Math.floor((ok + fail) % 5) * 1200 + 1000);
  }

  console.log(`\n🏁 Listo. Enviados: ${ok} · Fallidos: ${fail}`);
  process.exit(0);
});

client.initialize();
