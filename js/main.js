import {
  registerWithEmail,
  loginWithEmail,
  logout,
  subscribeAuth,
  getUserRole,
} from "./auth.js";

const APP_VERSION = "auth-domain-check-2026-02-28";
const ADMIN_DOMAIN = "mpa.ver";
const MEMBER_DOMAIN = "mpa.sjv";

const $ = (id) => document.getElementById(id);

const emailEl = $("email");
const passwordEl = $("password");
const statusEl = $("status");
const roleEl = $("role");
const adminPanelEl = $("adminPanel");
const btnRegister = $("btnRegister");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");

console.log("MPA app version:", APP_VERSION);

function getDomain(email) {
  const clean = String(email || "").trim().toLowerCase();
  const parts = clean.split("@");
  return parts.length === 2 ? parts[1] : "";
}

btnRegister?.addEventListener("click", async () => {
  try {
    const domain = getDomain(emailEl?.value);

    if (domain === ADMIN_DOMAIN) {
      alert("Ese tipo de correo no está permitido para registrarse. Tal vez quisiste usar @mpa.sjv");
      return;
    }

    if (domain !== MEMBER_DOMAIN) {
      alert("Solo se permite registro con correos @mpa.sjv");
      return;
    }

    await registerWithEmail(emailEl.value, passwordEl.value);
    alert("Cuenta creada. Ya puedes iniciar sesión.");
  } catch (err) {
    alert(err.message);
  }
});

btnLogin?.addEventListener("click", async () => {
  try {
    await loginWithEmail(emailEl.value, passwordEl.value);
  } catch (err) {
    alert(err.message);
  }
});

btnLogout?.addEventListener("click", async () => {
  await logout();
});

subscribeAuth(async (user) => {
  if (!user) {
    if (statusEl) statusEl.textContent = "No autenticado";
    if (roleEl) roleEl.textContent = "Rol: -";
    if (adminPanelEl) adminPanelEl.style.display = "none";
    return;
  }

  if (statusEl) statusEl.textContent = `Autenticado: ${user.email}`;

  const role = await getUserRole(user.uid);
  if (roleEl) roleEl.textContent = `Rol: ${role}`;
  if (adminPanelEl) adminPanelEl.style.display = role === "admin" ? "block" : "none";
});