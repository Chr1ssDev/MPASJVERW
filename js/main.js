import {
  registerWithEmail,
  loginWithEmail,
  logout,
  subscribeAuth,
  getUserRole,
} from "./auth.js";

const $ = (id) => document.getElementById(id);

const emailEl = $("email");
const passwordEl = $("password");
const statusEl = $("status");
const roleEl = $("role");
const adminPanelEl = $("adminPanel");
const btnRegister = $("btnRegister");
const btnLogin = $("btnLogin");
const btnLogout = $("btnLogout");

btnRegister?.addEventListener("click", async () => {
  try {
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