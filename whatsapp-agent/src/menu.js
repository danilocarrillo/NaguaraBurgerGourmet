// Menú de Naguará Burger Gourmet
// Cada producto: { id, nombre, precio, nota }
// El `id` es el código que el cliente escribe para pedir (ej. "B1").

const categorias = [
  {
    id: "burgers",
    titulo: "🍔 Hamburguesas",
    subtitulo: "Gourmet, hechas como se deben.",
    items: [
      { id: "B1", nombre: "La Naguará (single)", precio: 11, nota: "firma" },
      { id: "B1D", nombre: "La Naguará (doble)", precio: 14, nota: "firma · doble" },
      { id: "B2", nombre: "La Caraqueña", precio: 12, nota: "smash" },
      { id: "B3", nombre: "La Maracucha", precio: 13, nota: "tropical" },
      { id: "B4", nombre: "La Llanera", precio: 13.5, nota: "ahumada" },
      { id: "B5", nombre: "La Gocha (XL)", precio: 17, nota: "picante opcional" },
      { id: "B6", nombre: "La Verdecita", precio: 12, nota: "vegetariana" },
    ],
  },
  {
    id: "pepitos",
    titulo: "🥖 Pepitos",
    subtitulo: "El ícono de la calle venezolana.",
    items: [
      { id: "P1", nombre: "Pepito de Carne", precio: 13, nota: "clásico" },
      { id: "P2", nombre: "Pepito de Pollo", precio: 12, nota: "" },
      { id: "P3", nombre: "Pepito Mixto", precio: 15, nota: "recomendado" },
      { id: "P4", nombre: "Pepito Naguará", precio: 17, nota: "firma · cargado" },
    ],
  },
  {
    id: "criolla",
    titulo: "🫓 Cocina criolla",
    subtitulo: "Sin atajos.",
    items: [
      { id: "C1", nombre: "Arepa Reina Pepiada", precio: 9, nota: "la más pedida" },
      { id: "C2", nombre: "Arepa Pelúa", precio: 9, nota: "" },
      { id: "C3", nombre: "Patacón Zuliano", precio: 14, nota: "abundante" },
      { id: "C4", nombre: "Empanadas (x2)", precio: 7, nota: "" },
      { id: "C5", nombre: "Tequeños (x6)", precio: 8, nota: "" },
      { id: "C6", nombre: "Cachapa con queso", precio: 11, nota: "vegetariana" },
    ],
  },
  {
    id: "extras",
    titulo: "🍮 Postres, bebidas & extras",
    subtitulo: "Lo dulce, lo frío, lo que acompaña.",
    items: [
      { id: "D1", nombre: "Quesillo", precio: 6, nota: "postre" },
      { id: "D2", nombre: "Tres leches", precio: 6, nota: "postre" },
      { id: "D3", nombre: "Chicha criolla", precio: 5, nota: "bebida" },
      { id: "D4", nombre: "Papelón con limón", precio: 4, nota: "bebida" },
      { id: "E1", nombre: "Papas de la casa", precio: 5, nota: "extra" },
      { id: "E2", nombre: "Yuca frita", precio: 5, nota: "extra" },
    ],
  },
];

// Índice rápido por id (en mayúsculas) para buscar productos
const porId = {};
for (const cat of categorias) {
  for (const item of cat.items) {
    porId[item.id.toUpperCase()] = item;
  }
}

function buscarItem(codigo) {
  if (!codigo) return null;
  return porId[String(codigo).trim().toUpperCase()] || null;
}

// Texto del menú completo listo para enviar por WhatsApp
function menuTexto(moneda = "$") {
  let out = "";
  for (const cat of categorias) {
    out += `\n*${cat.titulo}*\n_${cat.subtitulo}_\n`;
    for (const item of cat.items) {
      const nota = item.nota ? `  _(${item.nota})_` : "";
      out += `\`${item.id}\` · ${item.nombre} — *${moneda}${item.precio}*${nota}\n`;
    }
  }
  return out.trim();
}

module.exports = { categorias, buscarItem, menuTexto, porId };
