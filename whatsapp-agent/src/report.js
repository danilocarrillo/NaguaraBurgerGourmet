// Panel de pedidos por terminal — para que la cocina vea los pedidos.
//
// Uso:
//   node src/report.js            → pedidos de hoy
//   node src/report.js --todos    → todos los pedidos
//   node src/report.js --nuevos   → solo pedidos sin atender

const orders = require("./orders");
const config = require("./config");

const args = process.argv.slice(2);
const M = config.negocio.moneda;

let filtro = { hoy: true };
if (args.includes("--todos")) filtro = {};
if (args.includes("--nuevos")) filtro = { estado: "nuevo" };

const pedidos = orders.listarPedidos(filtro);

const iconos = { nuevo: "🆕", en_preparacion: "👨‍🍳", listo: "✅", entregado: "📦" };

console.log(`\n🍔 ${config.negocio.nombre} — Pedidos ${filtro.hoy ? "de hoy" : args.includes("--nuevos") ? "nuevos" : "(todos)"}\n`);

if (!pedidos.length) {
  console.log("   (sin pedidos)\n");
  process.exit(0);
}

let totalDia = 0;
for (const p of pedidos) {
  const hora = new Date(p.fecha).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
  console.log(`${iconos[p.estado] || "•"} #${p.numero}  ${hora}  ${p.nombre || "Cliente"}  [${p.estado}]`);
  console.log(`   ${p.entrega || ""}`);
  console.log(
    "   " +
      (p.detalle || "")
        .split("\n")
        .filter((l) => l.startsWith("•"))
        .join("\n   ")
  );
  console.log(`   💵 Total: ${M}${(p.total || 0).toFixed(2)}\n`);
  totalDia += p.total || 0;
}

console.log(`──────────────────────────────`);
console.log(`Pedidos: ${pedidos.length}   Ventas: ${M}${totalDia.toFixed(2)}\n`);
