// Agente de WhatsApp — Naguará Burger Gourmet
// Toma pedidos de forma conversacional, notifica a la cocina/admin,
// responde horario y ubicación, y registra clientes para publicidad.

require("dotenv").config();
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const config = require("./config");
const { buscarItem, menuTexto } = require("./menu");
const { estaAbierto, estadoTexto } = require("./horario");
const orders = require("./orders");

const M = config.negocio.moneda;

// ---- Estado de conversaciones en memoria ----
// sesiones[chatId] = { paso, carrito:[{item, cant}], nombre, fecha }
const sesiones = new Map();

function nuevaSesion() {
  return { paso: "inicio", carrito: [], nombre: null, entrega: null, ts: Date.now() };
}

function getSesion(chatId) {
  let s = sesiones.get(chatId);
  const expira = config.timeoutMinutos * 60 * 1000;
  if (s && Date.now() - s.ts > expira) {
    sesiones.delete(chatId);
    s = null;
  }
  if (!s) {
    s = nuevaSesion();
    sesiones.set(chatId, s);
  }
  s.ts = Date.now();
  return s;
}

function totalCarrito(carrito) {
  return carrito.reduce((sum, l) => sum + l.item.precio * l.cant, 0);
}

function resumenCarrito(carrito) {
  if (!carrito.length) return "_Tu pedido está vacío._";
  let out = "";
  for (const l of carrito) {
    out += `• ${l.cant}× ${l.item.nombre} — *${M}${(l.item.precio * l.cant).toFixed(2)}*\n`;
  }
  const sub = totalCarrito(carrito);
  const tax = sub * config.impuesto;
  out += `\nSubtotal: ${M}${sub.toFixed(2)}`;
  if (config.impuesto > 0) {
    out += `\nImpuesto (${(config.impuesto * 100).toFixed(0)}%): ${M}${tax.toFixed(2)}`;
    out += `\n*Total: ${M}${(sub + tax).toFixed(2)}*`;
  } else {
    out += `\n*Total: ${M}${sub.toFixed(2)}*`;
  }
  return out;
}

// ---- Mensajes reutilizables ----
const BIENVENIDA = () =>
  `¡Naguará! 🔥 Bienvenido a *${config.negocio.nombre}*.\n${config.negocio.lema}\n\n${estadoTexto()}\n\n` +
  `Escribe una opción:\n` +
  `1️⃣ *Menú* / hacer un pedido\n` +
  `2️⃣ *Ubicación*\n` +
  `3️⃣ *Horario*\n\n` +
  `En cualquier momento: *menu*, *carrito*, *cancelar* o *ayuda*.`;

const UBICACION = () =>
  `📍 *${config.negocio.nombre}*\n${config.negocio.direccion}\n_${config.negocio.referencia}_\n\n` +
  `🗺️ Google Maps: https://maps.google.com/?q=${encodeURIComponent(config.negocio.direccion)}\n\n${estadoTexto()}`;

const HORARIO = () => `🕕 *Horario*\n${config.negocio.horarioTexto}\n\n${estadoTexto()}`;

const AYUDA =
  `🤖 *Comandos*\n` +
  `• *menu* — ver el menú\n` +
  `• Escribe códigos para pedir, ej: \`B1\` o \`2 P3\` (2 pepitos mixtos)\n` +
  `• *carrito* — ver tu pedido\n` +
  `• *listo* — finalizar y confirmar\n` +
  `• *quitar B1* — quitar un producto\n` +
  `• *cancelar* — empezar de cero\n` +
  `• *ubicacion* / *horario*\n` +
  `• *baja* — no recibir promociones`;

// ---- Parseo de líneas de pedido tipo "2 B1" o "B1" o "b1 x3" ----
function parsearPedido(texto) {
  const encontrados = [];
  // Divide por comas o saltos para permitir "B1, 2 P3"
  const partes = texto.split(/[,\n]+/);
  for (const parte of partes) {
    const t = parte.trim();
    if (!t) continue;
    // formatos: "2 B1", "B1 x2", "B1"
    let cant = 1;
    let codigo = null;
    let m;
    if ((m = t.match(/^(\d+)\s*[x×]?\s*([a-zA-Z]\d+[a-zA-Z]?)$/))) {
      cant = parseInt(m[1], 10);
      codigo = m[2];
    } else if ((m = t.match(/^([a-zA-Z]\d+[a-zA-Z]?)\s*[x×]\s*(\d+)$/))) {
      codigo = m[1];
      cant = parseInt(m[2], 10);
    } else if ((m = t.match(/^([a-zA-Z]\d+[a-zA-Z]?)$/))) {
      codigo = m[1];
    }
    if (codigo) {
      const item = buscarItem(codigo);
      if (item) encontrados.push({ item, cant: Math.min(Math.max(cant, 1), 50) });
    }
  }
  return encontrados;
}

function agregarAlCarrito(carrito, item, cant) {
  const linea = carrito.find((l) => l.item.id === item.id);
  if (linea) linea.cant += cant;
  else carrito.push({ item, cant });
}

// ---- Cliente WhatsApp ----
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./.wwebjs_auth" }),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("\n📱 Escanea este QR con WhatsApp del negocio (Dispositivos vinculados):\n");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => console.log("✅ Autenticado."));
client.on("ready", () => {
  console.log(`\n🍔 Agente de ${config.negocio.nombre} EN LÍNEA.`);
  console.log(`   Admins: ${config.admins.join(", ")}`);
});
client.on("disconnected", (r) => console.log("⚠️  Desconectado:", r));

function esAdmin(chatId) {
  return config.admins.includes(chatId);
}

async function notificarAdmins(registro) {
  const texto =
    `🆕 *PEDIDO #${registro.numero}*\n` +
    `👤 ${registro.nombre || "Cliente"} (${registro.chatId.replace("@c.us", "")})\n` +
    `🕕 ${new Date(registro.fecha).toLocaleString("es-VE")}\n` +
    `🧾 ${registro.entrega || "—"}\n\n` +
    registro.detalle +
    `\n\nResponde: *#${registro.numero} preparando* / *listo* / *entregado*`;
  for (const admin of config.admins) {
    try {
      await client.sendMessage(admin, texto);
    } catch (e) {
      console.error("No se pudo notificar a", admin, e.message);
    }
  }
}

// ---- Manejo de comandos de admin (estado de pedidos) ----
async function manejarAdmin(msg, texto) {
  const m = texto.match(/^#?(\d+)\s+(preparando|listo|entregado|en_preparacion)/i);
  if (!m) return false;
  const numero = Number(m[1]);
  const mapa = { preparando: "en_preparacion", en_preparacion: "en_preparacion", listo: "listo", entregado: "entregado" };
  const estado = mapa[m[2].toLowerCase()];
  const p = orders.actualizarEstado(numero, estado);
  if (!p) {
    await msg.reply(`No encontré el pedido #${numero}.`);
    return true;
  }
  await msg.reply(`✅ Pedido #${numero} → *${estado}*`);
  // Avisar al cliente
  const avisos = {
    en_preparacion: "👨‍🍳 ¡Tu pedido ya está en la plancha!",
    listo: "🎉 ¡Tu pedido está *listo*! Te esperamos para retirarlo.",
    entregado: "🙏 ¡Gracias por tu pedido! Buen provecho. Naguará 🔥",
  };
  try {
    if (p.chatId && avisos[estado]) {
      await client.sendMessage(p.chatId, `${avisos[estado]}\n_Pedido #${numero} · ${config.negocio.nombre}_`);
    }
  } catch (_) {}
  return true;
}

// ---- Lógica principal de mensajes ----
client.on("message", async (msg) => {
  try {
    if (msg.from.endsWith("@g.us")) return; // ignorar grupos
    if (msg.isStatus) return;

    const chatId = msg.from;
    const texto = (msg.body || "").trim();
    const low = texto.toLowerCase();

    // Comandos de admin primero
    if (esAdmin(chatId)) {
      if (await manejarAdmin(msg, texto)) return;
    }

    const contacto = await msg.getContact().catch(() => null);
    const nombreWa = contacto ? contacto.pushname || contacto.name : "";
    orders.registrarCliente(chatId, nombreWa);

    const s = getSesion(chatId);

    // Comandos globales
    if (["hola", "buenas", "hey", "hi", "start", "inicio", "menú", "menu"].includes(low)) {
      if (low === "menu" || low === "menú") {
        s.paso = "pidiendo";
        await msg.reply(`🍔 *MENÚ · ${config.negocio.nombre}*\n${menuTexto(M)}\n\n` +
          `Para pedir escribe el código, ej: \`B1\` o \`2 P3\`.\nCuando termines escribe *listo*.`);
        return;
      }
      await msg.reply(BIENVENIDA());
      return;
    }
    if (["2", "ubicacion", "ubicación", "direccion", "dirección", "donde", "dónde"].includes(low)) {
      await msg.reply(UBICACION());
      return;
    }
    if (["3", "horario", "horarios", "abierto", "cerrado"].includes(low)) {
      await msg.reply(HORARIO());
      return;
    }
    if (["ayuda", "help", "comandos"].includes(low)) {
      await msg.reply(AYUDA);
      return;
    }
    if (["cancelar", "reset"].includes(low)) {
      sesiones.delete(chatId);
      await msg.reply("🗑️ Pedido cancelado. Escribe *menu* para empezar de nuevo.");
      return;
    }
    if (["baja", "stop", "no promociones", "unsubscribe"].includes(low)) {
      orders.setOptOut(chatId, true);
      await msg.reply("✅ Listo, no recibirás más promociones. Escribe *alta* para volver a activarlas.");
      return;
    }
    if (low === "alta") {
      orders.setOptOut(chatId, false);
      await msg.reply("🎉 ¡Genial! Volverás a recibir nuestras promociones.");
      return;
    }
    if (["carrito", "pedido", "cart"].includes(low)) {
      await msg.reply(`🧺 *Tu pedido*\n${resumenCarrito(s.carrito)}\n\nEscribe *listo* para confirmar o sigue agregando.`);
      return;
    }
    if (low === "1") {
      s.paso = "pidiendo";
      await msg.reply(`🍔 *MENÚ · ${config.negocio.nombre}*\n${menuTexto(M)}\n\n` +
        `Para pedir escribe el código, ej: \`B1\` o \`2 P3\`.\nCuando termines escribe *listo*.`);
      return;
    }

    // Quitar item: "quitar B1"
    const mq = low.match(/^quitar\s+([a-z]\d+[a-z]?)/i);
    if (mq) {
      const item = buscarItem(mq[1]);
      if (item) {
        const antes = s.carrito.length;
        s.carrito = s.carrito.filter((l) => l.item.id !== item.id);
        await msg.reply(antes !== s.carrito.length
          ? `🗑️ Quité *${item.nombre}*.\n\n${resumenCarrito(s.carrito)}`
          : `No tenías *${item.nombre}* en el pedido.`);
      } else {
        await msg.reply("No reconocí ese código. Escribe *carrito* para ver tu pedido.");
      }
      return;
    }

    // Finalizar pedido
    if (["listo", "confirmar", "finalizar", "pagar"].includes(low)) {
      if (!s.carrito.length) {
        await msg.reply("Tu pedido está vacío. Escribe *menu* para ver las opciones. 🍔");
        return;
      }
      s.paso = "entrega";
      await msg.reply(
        `📝 *Confirmemos tu pedido*\n${resumenCarrito(s.carrito)}\n\n` +
        `¿Cómo lo quieres?\nEscribe *1* para *retiro en el food truck* o *2* para indicar otra nota (ej. nombre para el pedido).`
      );
      return;
    }

    // Paso: definir entrega / nota
    if (s.paso === "entrega") {
      if (low === "1" || low.includes("retiro") || low.includes("pickup")) {
        s.entrega = "Retiro en el food truck";
      } else {
        s.entrega = texto; // nota libre (nombre, hora, etc.)
      }
      // Guardar pedido
      const detalle = resumenCarrito(s.carrito);
      const registro = orders.guardarPedido({
        chatId,
        nombre: nombreWa,
        entrega: s.entrega,
        detalle,
        total: totalCarrito(s.carrito),
      });
      orders.sumarPedidoCliente(chatId);
      await notificarAdmins(registro);

      const cerrado = !estaAbierto()
        ? "\n\n_Estamos cerrados ahora; tomamos tu pedido y te confirmamos al abrir._"
        : "";
      await msg.reply(
        `✅ *¡Pedido #${registro.numero} recibido!*\n\n${detalle}\n\n🧾 ${s.entrega}\n📍 ${config.negocio.direccion}` +
        `\n\nTe avisaremos cuando esté listo. ¡Gracias! 🔥${cerrado}`
      );
      sesiones.delete(chatId);
      return;
    }

    // Intentar interpretar como productos (ej. "B1", "2 P3, C5")
    const items = parsearPedido(texto);
    if (items.length) {
      for (const it of items) agregarAlCarrito(s.carrito, it.item, it.cant);
      s.paso = "pidiendo";
      const agregados = items.map((i) => `${i.cant}× ${i.item.nombre}`).join(", ");
      await msg.reply(
        `➕ Agregué: ${agregados}.\n\n${resumenCarrito(s.carrito)}\n\n` +
        `Sigue agregando o escribe *listo* para confirmar.`
      );
      return;
    }

    // No entendido
    await msg.reply(
      `🤔 No te entendí.\n\n${BIENVENIDA()}`
    );
  } catch (err) {
    console.error("Error procesando mensaje:", err);
  }
});

client.initialize();
