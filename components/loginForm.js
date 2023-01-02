if (isLoggedIn()) {
  location.href = '/login.html'
}

const signUpBtn = document.querySelector("#registration")
const signUpForm = document.querySelector(".signup-form")
const signInForm = document.querySelector('.signin-form')
const cancelBtn = document.querySelector("#cancel")
const saveUserBtn = document.querySelector('#saveUser')

signUpBtn.addEventListener('click', toggleFormMode)
cancelBtn.addEventListener('click', toggleFormMode)
signUpForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const password = signUpForm.password.value
  const name = signUpForm.name.value
  async function sendUser() {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          password
        })
      })
    }
    catch (error) {
      console.log(error)
    }
  }
  sendUser()
  toggleFormMode()

})
signInForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const name = signInForm.name.value
  const password = signInForm.password.value
  async function sendUser() {
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          password
        })
      });
      if (response.ok) {
        //  location.href = '/index.html'
      }
    }
    catch (error) {
      console.log(error)
    }
  }
  sendUser()
})

function toggleFormMode() {
  signUpForm.hidden = !signUpForm.hidden
  signInForm.hidden = !signInForm.hidden
}

async function isLoggedIn() {
  const cookie = document.cookie;
  const regex = /(?:^| )token=([^;]+)/;
  const match = cookie.match(regex);

  const response = await fetch("/api/token")




}




