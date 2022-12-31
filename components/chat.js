

if (isLoggedIn()){
  location.href = '/login.html'
}

const messInput = document.getElementById('messInput');
const messSubmit = document.getElementById('messSubmit');
const messList = document.getElementById('messList');


const data = [];

function addMessage(e) {
  e.preventDefault();
  const message = messInput.value;
  const newMess = document.createElement('li');
  newMess.classList.add('message-container');
  newMess.innerText = message
  messInput.value = '';
  data.push(message);
  console.log(`data on client after we are add message  ${data}`);
  // Create a delete button for each message
  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    // Remove the message from the list when the delete button is clicked
    newMess.remove();
    // Remove the message from the data array
    const index = data.indexOf(message);
    if (index > -1) {
      data.splice(index, 1);
    }
  })
  newMess.innerText = message
  newMess.appendChild(deleteButton);
  messList.appendChild(newMess);
  sendData(message)
}
messSubmit.addEventListener('click', addMessage);

//send data to server async await
async function sendData(str) {
  const response = await fetch('/api/data', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    // Send the message as a string
    body: JSON.stringify(str)
  })

  if (response.ok) {
    console.log("confirmation success");
  } else {
    console.error("Error sending data to server");
  }
}

async function getData() {
  try {
    const response = await fetch('/api/data')
    if (response.ok) {
      const dataFromDB = await response.json();
      console.log(`dataDB what we are load  ${dataFromDB}`);
      data.push(...dataFromDB)
      console.log(`data after load  ${data}`);
    } else {
      console.error("Error getting data from server");
    }
  } catch (error) {
    console.error(error);
  }
  writeMessage(data)
}
getData();

//write all data in messList
function writeMessage(messages) {
  messages.forEach(message => {
    const newMess = document.createElement('li');
    newMess.classList.add('message-container');
    // Create a delete button for each message
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    deleteButton.addEventListener("click", () => {
      // Remove the message from the list when the delete button is clicked
      newMess.remove();
      // Remove the message from the data array
      const index = data.indexOf(message);
      if (index > -1) {
        data.splice(index, 1);
      }
      sendData(data);
    });
    newMess.innerText = message
    newMess.appendChild(deleteButton);
    messList.appendChild(newMess);
  })

}
console.log(`data before load  ${data}`);

function isLoggedIn() {
  return true
}







