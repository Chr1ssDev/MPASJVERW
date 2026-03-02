import {
  loginWithEmail,
  logout,
  subscribeAuth,
  getUserRole,
} from "./auth.js";

const APP_VERSION = "auth-domain-check-2026-02-28";

const $ = (id) => document.getElementById(id);

const emailEl = $("email");
const passwordEl = $("password");
const statusEl = $("status");
const roleEl = $("role");
const adminPanelEl = $("adminPanel");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");

console.log("MPA app version:", APP_VERSION);

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