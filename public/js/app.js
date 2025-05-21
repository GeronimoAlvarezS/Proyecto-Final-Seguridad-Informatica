const API_URL = "http://localhost:3000";

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const dashboard = document.getElementById("dashboard");
const authForms = document.getElementById("auth-forms");
const addUserForm = document.getElementById("addUserForm");
const userList = document.getElementById("userList");

function toggleForms() {
  registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
}

// Registro
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const documentId = document.getElementById("document").value;
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (password !== confirm) {
    alert("Las contraseñas no coinciden");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, document: documentId, password })
    });

    const data = await res.json();
    alert(data.message || "Registro completado");
  } catch (error) {
    alert("Error de conexión con el servidor (registro)");
    console.error(error);
  }
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const documentId = document.getElementById("loginDocument").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ document: documentId, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      showDashboard();
    } else {
      alert(data.message || "Credenciales inválidas");
    }
  } catch (error) {
    alert("Error de conexión con el servidor (login)");
    console.error(error);
  }
});

function showDashboard() {
  authForms.style.display = "none";
  dashboard.style.display = "block";
  fetchUsers();
}

function logout() {
  localStorage.removeItem("token");
  dashboard.style.display = "none";
  authForms.style.display = "block";
}

// Agregar usuario
addUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("newUserName").value;

  try {
    await fetch(`${API_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ name })
    });

    await fetchUsers();
  } catch (error) {
    alert("Error al agregar usuario");
    console.error(error);
  }
});

// Obtener usuarios
async function fetchUsers() {
  try {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    const users = await res.json();
    userList.innerHTML = "";
    users.forEach(user => {
      const li = document.createElement("li");
      li.textContent = user.Name; // ← corregido
      const btn = document.createElement("button");
      btn.textContent = "Eliminar";
      btn.onclick = () => deleteUser(user.Id); // ← corregido
      li.appendChild(btn);
      userList.appendChild(li);
    });
  } catch (error) {
    alert("Error al obtener usuarios");
    console.error(error);
  }
}

// Eliminar usuario
async function deleteUser(id) {
  try {
    await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("token")
      }
    });

    await fetchUsers();
  } catch (error) {
    alert("Error al eliminar usuario");
    console.error(error);
  }
}
