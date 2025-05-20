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

  const res = await fetch("/api/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, document: documentId, password })
  });

  const data = await res.json();
  alert(data.message || "Registro completado");
});

// Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const documentId = document.getElementById("loginDocument").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch("/api/users/login", {
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

  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ name })
  });

  await fetchUsers();
});

// Obtener usuarios
async function fetchUsers() {
  const res = await fetch("/api/users", {
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  const users = await res.json();
  userList.innerHTML = "";
  users.forEach(user => {
    const li = document.createElement("li");
    li.textContent = user.name;
    const btn = document.createElement("button");
    btn.textContent = "Eliminar";
    btn.onclick = () => deleteUser(user.id);
    li.appendChild(btn);
    userList.appendChild(li);
  });
}

// Eliminar usuario
async function deleteUser(id) {
  await fetch(`/api/users/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": "Bearer " + localStorage.getItem("token")
    }
  });

  await fetchUsers();
}
