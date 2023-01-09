//connect client to ws on sever
const ws = new WebSocket('ws://localhost:4000')

//if message 'reload' came to client from server
ws.onmessage = (message) => {
  if (message.data === "reload"){
    location.reload()
  }
}