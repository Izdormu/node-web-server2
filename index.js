const http = require("http")
const fs = require('fs')
const blacklist = require('./blacklist')
const port = 3000
const server = http.createServer(handleRequest)
server.listen(port, () => {
  console.log(`server is on http://localhost:${port}`)
})

function generateId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  return `${timestamp}-${randomNumber}`;
}



const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'))
const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'))
const maxAge = 60000


async function handleRequest(request, response) {
  const {method, url} = request

  if (method === "POST") {
    if (url === "/api/data") {
      try {
        const body = await getBody(request);
        const newMessage = JSON.parse(body);
        db.push(newMessage);
        fs.writeFileSync("db.json", JSON.stringify(db));
        response.end("OK\n");
      } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    } else if (url === "/api/signup") {
      try {
        const body = await getBody(request);
        const newUser = JSON.parse(body);
        newUser.id = generateId()
        users.push(newUser);
        fs.writeFileSync("users.json", JSON.stringify(users));
        response.end("OK\n");
      } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    } else if (url === '/api/signin') {
      try {
        const body = await getBody(request);
        const checkedUser = JSON.parse(body)
        const foundUser = users.find(
          user => user.name === checkedUser.name
          && user.password === checkedUser.password
        )
        if (foundUser) {
          const token = foundUser.id
          response.setHeader("Set-Cookie", `token=${token}; Max-Age=${maxAge}; Path=/ ` );
          response.end("OK\n");
        }
        else {
          response.statusCode = 401;
          response.end("Unauthorized\n");
        }
      } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    }
  } 
  else if (method === "GET") {
    if (url === "/api/data") {
      let data;
      try {
        data = fs.readFileSync("db.json");
      } catch (error) {
        data = '""';
      }
      response.statusCode = 200;
      response.end(data);
    }
    else if(url === '/api/token'){
      const token = getToken(request)
      const found = 

    }
    else {
      if (url === "/") {
        const html = fs.readFileSync("index.html");
        response.end(html);
        return;
      }
      try {
        if (blacklist.includes(url)) throw null;
        const file = fs.readFileSync(url.slice(1));
        response.end(file);
      } catch (error) {
        response.statusCode = 404; // Not found
        response.end(
          `<div>Error, ${url.slice(
            1
          )} does not exist<div><br><a href="http://localhost:3000/">Try this<a>`
        );
      }
    }
  }
}

//save data in server from client
function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on('data', chunk => {
      body += chunk.toString()
    })
    req.on('end', () => {
      resolve(body)
    })
    req.on('error', error => {
      reject(error)
    })
  })
}

function getToken(request){
  const cookie = request.document.cookie;
  const regex = /(?:^| )token=([^;]+)/;
  const match = cookie.match(regex);
  return match
}
