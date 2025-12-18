document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ admin.js loaded");

  const loginBtn = document.getElementById("login-btn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const logoutBtn = document.getElementById("logout-btn");

  // Simple hardcoded credentials
  const adminCredentials = {
    username: "admin",
    password: "batik2025"
  };

  // Login event
  loginBtn.addEventListener("click", () => {
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (user === adminCredentials.username && pass === adminCredentials.password) {
      console.log("✅ Login successful");
      loginScreen.style.display = "none";
      dashboard.style.display = "block";
      loginError.style.display = "none";
    } else {
      console.log("❌ Invalid login");
      loginError.style.display = "block";
    }
  });

  // Logout event
  logoutBtn.addEventListener("click", () => {
    dashboard.style.display = "none";
    loginScreen.style.display = "flex";
    usernameInput.value = "";
    passwordInput.value = "";
  });
});

