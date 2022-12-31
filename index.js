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


async function handleRequest(request, response) {
  if (request.method === "POST") {
    if (request.url === "/api/data") {
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
    } else if (request.url === "/api/signup") {
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
    } else if (request.url === '/api/signin') {
      try {
        const body = await getBody(request);
        const user = JSON.parse(body)
        const checkUser = users.find(
          user => user.name === user.name
            && user.password === user.password
        )
        if (checkUser) {
          const token = jwt.sign({ user }, secret)
          response.setHeader("Set-Cookie", `token=${token}; Max-Age=${maxAge}`);
          response.end("OK\n");
        }
        else {
          response.statusCode = 401;
          response.end("Unauthorized\n");
        }
      } catch {
        console.error(error);
        response.statusCode = 500;
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    }
  } else if (request.method === "GET") {
    if (request.url === "/api/data") {
      let data;
      try {
        data = fs.readFileSync("db.json");
      } catch (error) {
        data = '""';
      }
      response.statusCode = 200;
      response.end(data);
    } else {
      if (request.url === "/") {
        const html = fs.readFileSync("index.html");
        response.end(html);
        return;
      }
      try {
        if (blacklist.includes(request.url)) throw null;
        const file = fs.readFileSync(request.url.slice(1));
        response.end(file);
      } catch (error) {
        response.statusCode = 404; // Not found
        response.end(
          `<div>Error, ${request.url.slice(
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
