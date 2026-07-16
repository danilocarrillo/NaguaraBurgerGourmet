// Almacenamiento simple de pedidos y clientes en archivos JSON (data/).
// Sin base de datos: fácil de leer, respaldar y editar a mano.

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const ORDERS_FILE = path.join(DATA_DIR, "pedidos.json");
const CUSTOMERS_FILE = path.join(DATA_DIR, "clientes.json");

function asegurarData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
  if (!fs.existsSync(CUSTOMERS_FILE)) fs.writeFileSync(CUSTOMERS_FILE, "[]");
}

function leer(file) {
  asegurarData();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8") || "[]");
  } catch {
    return [];
  }
}

function escribir(file, data) {
  asegurarData();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// --- Pedidos ---

function guardarPedido(pedido) {
  const pedidos = leer(ORDERS_FILE);
  const numero = pedidos.length + 1;
  const registro = {
    numero,
    estado: "nuevo", // nuevo -> en_preparacion -> listo -> entregado
    fecha: new Date().toISOString(),
    ...pedido,
  };
  pedidos.push(registro);
  escribir(ORDERS_FILE, pedidos);
  return registro;
}

function listarPedidos(filtro = {}) {
  let pedidos = leer(ORDERS_FILE);
  if (filtro.estado) pedidos = pedidos.filter((p) => p.estado === filtro.estado);
  if (filtro.hoy) {
    const hoy = new Date().toDateString();
    pedidos = pedidos.filter((p) => new Date(p.fecha).toDateString() === hoy);
  }
  return pedidos;
}

function actualizarEstado(numero, estado) {
  const pedidos = leer(ORDERS_FILE);
  const p = pedidos.find((x) => x.numero === Number(numero));
  if (!p) return null;
  p.estado = estado;
  escribir(ORDERS_FILE, pedidos);
  return p;
}

// --- Clientes (para publicidad / difusión) ---

function registrarCliente(chatId, nombre) {
  const clientes = leer(CUSTOMERS_FILE);
  let c = clientes.find((x) => x.chatId === chatId);
  if (!c) {
    c = { chatId, nombre: nombre || "", pedidos: 0, optOut: false, alta: new Date().toISOString() };
    clientes.push(c);
  }
  if (nombre) c.nombre = nombre;
  c.ultimoContacto = new Date().toISOString();
  escribir(CUSTOMERS_FILE, clientes);
  return c;
}

function sumarPedidoCliente(chatId) {
  const clientes = leer(CUSTOMERS_FILE);
  const c = clientes.find((x) => x.chatId === chatId);
  if (c) {
    c.pedidos = (c.pedidos || 0) + 1;
    escribir(CUSTOMERS_FILE, clientes);
  }
}

function setOptOut(chatId, valor) {
  const clientes = leer(CUSTOMERS_FILE);
  const c = clientes.find((x) => x.chatId === chatId);
  if (c) {
    c.optOut = valor;
    escribir(CUSTOMERS_FILE, clientes);
  }
  return c;
}

function listarClientes({ soloActivos = true } = {}) {
  const clientes = leer(CUSTOMERS_FILE);
  return soloActivos ? clientes.filter((c) => !c.optOut) : clientes;
}

module.exports = {
  guardarPedido,
  listarPedidos,
  actualizarEstado,
  registrarCliente,
  sumarPedidoCliente,
  setOptOut,
  listarClientes,
  DATA_DIR,
  ORDERS_FILE,
  CUSTOMERS_FILE,
};
