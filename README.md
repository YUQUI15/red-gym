# GIMNASIO RED GYM - Sistema Integral de Gestión, Acceso QR y Entrenador Digital (Chivay)

Ecosistema tecnológico integral para **GIMNASIO RED GYM** (Chivay, Valle del Colca, Arequipa). Incluye control de accesos por código QR blindado (físico en PVC y digital rotativo en PWA), punto de venta (POS), arqueo de turnos de caja, 135 ejercicios anatómicos en español, 21 rutinas profesionales, tienda de suplementos/boxeo, y sincronización persistente en la nube mediante Cloud Vault (Upstash Redis).

---

## 🏢 Datos Oficiales del Local
* **Nombre:** GIMNASIO RED GYM
* **Ubicación:** Calle Piérola con Garcilaso de la Vega, Chivay, Arequipa
* **Horario de Atención:** Lunes a Sábado de 5:30 am a 10:00 pm
* **Contacto / Yape:** WhatsApp `954 196 867`
* **Slogan:** Fuerza · Pasión · Resultados

---

## 💳 Tarifas Oficiales
* **1 Mes:** S/ 80.00
* **2 Meses:** S/ 140.00 (Ahorro S/ 20)
* **3 Meses:** S/ 180.00 (Ahorro S/ 60)
* **6 Meses:** S/ 350.00 (Ahorro S/ 130)
* **1 Año VIP:** S/ 600.00 (Ahorro S/ 360)
* **Pase Diario Musculación:** S/ 6.00
* **Pase Diario Boxeo & Baile:** S/ 8.00

---

## 🚀 Despliegue en la Nube (Render.com / Railway)

### Configuración en Render.com:
1. Inicia sesión en [Render.com](https://render.com) con tu cuenta de GitHub (**YUQUI15**).
2. Haz clic en **New +** y selecciona **Web Service**.
3. Conecta el repositorio: `YUQUI15/red-gym`.
4. Completa la configuración:
   - **Name:** `red-gym`
   - **Language:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`
   - **Plan:** `Free ($0/month)`
5. En **Environment Variables** agrega:
   - `ADMIN_PASSWORD` = `Red-Admin-2026`
   - `PORT` = `3000`
   - `UPSTASH_REDIS_REST_URL` = `https://wise-pipefish-172734.upstash.io`
   - `UPSTASH_REDIS_REST_TOKEN` = `gQAAAAAAAqK-AAIgcDI0M2ZkNzhlYmRmMTI0NGVmYWZjNDk2MDc4ZWI2NDdlMA`
6. Haz clic en **Create Web Service**.

> **Nota sobre Persistencia:** Gracias a la integración con Cloud Vault (Upstash Redis), el sistema guarda una copia completa cifrada de la base de datos bajo la clave `red_gym_vault`. Cada vez que el servidor se reinicia o se actualiza en Render, restaura automáticamente todos los socios, pagos y rutinas sin perder un solo dato.

---

## 💻 Ejecución Local en Recepción (Chivay)
```bash
npm install
node server/server.js
```
* **Panel Administrativo:** `http://localhost:3001/admin/`
* **App del Socio (PWA):** `http://localhost:3001/`
* **Pantalla TV / Recepción:** `http://localhost:3001/display.html`
* **Emisión de Carnets PVC:** `http://localhost:3001/admin/cards.html`
* **Propuesta Comercial:** `http://localhost:3001/propuesta.html`
