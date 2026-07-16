# 🍔 Agente de WhatsApp — Naguará Burger Gourmet

Bot de WhatsApp para **gestionar pedidos** y **hacer publicidad** desde el mismo número del negocio.

- 📋 Muestra el menú y arma el pedido conversando con el cliente
- 🧾 Calcula subtotal, impuesto y total automáticamente
- 🔔 Te avisa a ti (cocina/admin) cada pedido nuevo por WhatsApp
- 👨‍🍳 Cambias el estado del pedido (preparando / listo / entregado) y el cliente recibe aviso
- 📍 Responde ubicación, horario y si está abierto/cerrado
- 📣 Envía promociones a tus clientes (los que ya te escribieron)
- 💾 Guarda pedidos y clientes en archivos simples (`data/`)

No requiere pagar nada: usa tu número actual escaneando un QR, como WhatsApp Web.

---

## 🚀 Instalación (una sola vez)

Necesitas **Node.js 18 o superior**. Descárgalo en https://nodejs.org

```bash
cd whatsapp-agent
npm install
cp .env.example .env      # y edita tu número de admin dentro de .env
```

## ▶️ Encender el agente

```bash
npm start
```

La primera vez aparece un **código QR** en la terminal.
En el teléfono del negocio: **WhatsApp → Ajustes → Dispositivos vinculados → Vincular un dispositivo** y escanea el QR.

Al terminar verás: `🍔 Agente de Naguará Burger Gourmet EN LÍNEA.`
¡Listo! El bot ya responde a los clientes. Déjalo corriendo.

> La sesión queda guardada en `.wwebjs_auth/`, así que no tendrás que escanear el QR cada vez.

---

## 💬 Cómo lo usa el cliente

El cliente le escribe al WhatsApp del negocio y el bot responde solo:

| El cliente escribe | Pasa esto |
|---|---|
| `hola` / `menu` | Saludo + menú con códigos |
| `B1` o `2 P3` | Agrega productos (2 pepitos mixtos) |
| `carrito` | Ve su pedido y el total |
| `quitar B1` | Quita un producto |
| `listo` | Confirma; el bot pide retiro/nota y registra el pedido |
| `ubicacion` / `horario` | Info del food truck |
| `baja` | Deja de recibir promociones |

## 👨‍🍳 Cómo lo usas tú (admin/cocina)

Cuando entra un pedido, te llega un WhatsApp: `🆕 PEDIDO #12 ...`.
Responde para cambiar el estado (el cliente recibe el aviso automático):

```
#12 preparando     → avisa al cliente "está en la plancha"
#12 listo          → avisa "tu pedido está listo"
#12 entregado      → agradece al cliente
```

Ver los pedidos en la terminal:

```bash
npm run pedidos            # pedidos de hoy + total de ventas
node src/report.js --nuevos
node src/report.js --todos
```

---

## 📣 Publicidad / promociones

Envía una promo a todos tus clientes registrados (los que ya te escribieron):

```bash
# Probar primero contigo (solo admins):
node src/broadcast.js --test "🔥 Hoy 2x1 en pepitos hasta las 9pm. ¡Naguará!"

# Enviar a todos:
npm run publicidad -- "🔥 Hoy 2x1 en pepitos hasta las 9pm. ¡Naguará!"

# O desde un archivo de texto:
node src/broadcast.js --file promo.txt
```

El script envía despacio (pausas entre mensajes) y respeta a quienes pidieron *baja*.

> ⚠️ **Para no ser bloqueado por WhatsApp:** envía solo a clientes reales que ya te
> escribieron, nunca a números comprados, y no más de 1–2 campañas por semana.
> Para volúmenes grandes o campañas masivas, lo correcto es la **API oficial de
> WhatsApp Cloud (Meta)** — pídemelo y lo montamos.

---

## ✏️ Personalizar

| Qué | Dónde |
|---|---|
| Menú y precios | `src/menu.js` |
| Nombre, dirección, horario, teléfono | `src/config.js` |
| Número(s) de admin e impuesto | archivo `.env` |
| Textos del bot (bienvenida, ayuda) | `src/bot.js` |

---

## 📁 Estructura

```
whatsapp-agent/
├── src/
│   ├── bot.js         ← agente principal (pedidos + respuestas)
│   ├── broadcast.js   ← enviar publicidad
│   ├── report.js      ← ver pedidos en terminal
│   ├── menu.js        ← menú y precios
│   ├── config.js      ← datos del negocio
│   ├── horario.js     ← lógica abierto/cerrado
│   └── orders.js      ← guardar pedidos y clientes
├── data/              ← pedidos.json y clientes.json (privados, no se suben)
├── .env.example
└── package.json
```

## ❓ Notas

- **No cierres la terminal** mientras quieras que el bot responda. Para dejarlo
  siempre encendido en una PC/servidor puedes usar `pm2` (`npm i -g pm2 && pm2 start src/bot.js`).
- La carpeta `.wwebjs_auth/` y los datos de `data/` **no se suben a GitHub** (están en `.gitignore`)
  porque contienen tu sesión de WhatsApp y datos de clientes.
- Este proyecto usa [whatsapp-web.js](https://wwebjs.dev), que automatiza WhatsApp Web.
  Es no oficial; úsalo de forma responsable.
```
