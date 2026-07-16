// Configuración del negocio — Naguará Burger Gourmet
// Edita aquí los datos de tu negocio. No hace falta tocar el resto del código.

module.exports = {
  negocio: {
    nombre: "Naguará Burger Gourmet",
    lema: "Sabor venezolano · Handmade · Gourmet",
    telefono: "+1 (786) 626-6849",
    direccion: "4385 Griffin Rd, Fort Lauderdale, FL 33314",
    referencia: "Al lado de Brigitt Flowers (food truck)",
    // Horario por día de la semana (0 = domingo ... 6 = sábado)
    // apertura/cierre en formato 24h. Cruce de medianoche soportado (ej. cierra a la 1am).
    horario: {
      0: { abre: "18:00", cierra: "23:00" }, // Domingo
      1: { abre: "18:00", cierra: "23:00" }, // Lunes
      2: { abre: "18:00", cierra: "23:00" }, // Martes
      3: { abre: "18:00", cierra: "23:00" }, // Miércoles
      4: { abre: "18:00", cierra: "23:00" }, // Jueves
      5: { abre: "18:00", cierra: "01:00" }, // Viernes (cierra 1am)
      6: { abre: "18:00", cierra: "01:00" }, // Sábado (cierra 1am)
    },
    horarioTexto: "Dom–Jue · 6:00pm – 11:00pm\nVie–Sáb · 6:00pm – 1:00am",
    moneda: "$",
  },

  // Número(s) del/los administrador(es) en formato internacional SIN símbolos, con sufijo @c.us
  // Ejemplo: "17866266849@c.us". Reciben aviso de cada pedido nuevo y pueden usar comandos admin.
  admins: (process.env.ADMIN_NUMBERS || "17866266849")
    .split(",")
    .map((n) => n.trim().replace(/\D/g, ""))
    .filter(Boolean)
    .map((n) => `${n}@c.us`),

  // Impuesto sobre ventas (Florida ~7%). Pon 0 si no quieres cobrarlo en el resumen.
  impuesto: parseFloat(process.env.TAX_RATE || "0.07"),

  // Minutos de inactividad antes de reiniciar una conversación de pedido
  timeoutMinutos: 20,
};
