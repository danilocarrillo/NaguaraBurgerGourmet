// Lógica de abierto/cerrado, soporta cierres pasada la medianoche.
const config = require("./config");

function aMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Devuelve true si el negocio está abierto ahora mismo.
function estaAbierto(ahora = new Date()) {
  const horario = config.negocio.horario;
  const dia = ahora.getDay();
  const min = ahora.getHours() * 60 + ahora.getMinutes();

  // Turno del día de hoy
  const hoy = horario[dia];
  if (hoy) {
    const abre = aMinutos(hoy.abre);
    let cierra = aMinutos(hoy.cierra);
    if (cierra > abre) {
      // Mismo día
      if (min >= abre && min < cierra) return true;
    } else {
      // Cruza medianoche: abierto desde `abre` hasta 24:00
      if (min >= abre) return true;
    }
  }

  // Turno de ayer que cruzó medianoche (ej. viernes cierra 1am → sábado 00:30)
  const ayer = horario[(dia + 6) % 7];
  if (ayer) {
    const abreA = aMinutos(ayer.abre);
    const cierraA = aMinutos(ayer.cierra);
    if (cierraA <= abreA && min < cierraA) return true;
  }

  return false;
}

function estadoTexto(ahora = new Date()) {
  return estaAbierto(ahora)
    ? "🟢 *Abierto ahora* — ¡estamos en la plancha!"
    : "🔴 *Cerrado ahora.* Puedes dejar tu pedido y te confirmamos al abrir.";
}

module.exports = { estaAbierto, estadoTexto };
