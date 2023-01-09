const signUpBtn = document.querySelector("#registration");
const signUpForm = document.querySelector(".signup-form");
const signInForm = document.querySelector(".signin-form");
const cancelBtn = document.querySelector("#cancel");
const saveUserBtn = document.querySelector("#saveUser");



signUpBtn.addEventListener("click", toggleFormMode);
cancelBtn.addEventListener("click", toggleFormMode);
signUpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = signUpForm.password.value;
  const name = signUpForm.name.value;
  try {
    // Send a POST request to the server with the user data
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        password,
      }),
    });
  } catch (error) {
    console.log(error);
  }
  toggleFormMode();
});
signInForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = signInForm.name.value;
  const password = signInForm.password.value;
  try {
    // Send a POST request to the server with the user data
    const response = await fetch("/api/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        password,
      }),
    });
    if (response.ok) {
      // If the response is successful, redirect
      // Redirect to the home page
      location.href = "/index.html";
    }
  } catch (error) {
    console.log(error);
  }
});

// Toggle between the sign up and sign in forms
function toggleFormMode() {
  signUpForm.hidden = !signUpForm.hidden;
  signInForm.hidden = !signInForm.hidden;
}

// Check if the user is logged in
async function isLoggedIn() {
  // Check if the 'token' cookie is present in the request header
  const token = getToken();
  if (!token) return; // Return if the cookie is not present
  // Send a GET request to the server to check for a valid token cookie
  const response = await fetch("/api/token");
  if (response.status !== 200) {
    // If the token is invalid, redirect to the login page
    location.href = "/login.html";
  }
  if (response.ok) {
    // If the token is valid, redirect to the home page
    location.href = "/index.html";
  }
}
function getToken() {
  const cookie = document.cookie;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  return tokenMatch[1];
}

isLoggedIn();

