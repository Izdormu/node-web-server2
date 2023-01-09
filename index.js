const http = require("http");
const fs = require("fs");
const blacklist = require("./blacklist");
const ws = require('ws')

const port = 3000;
const server = http.createServer(handleRequest);
const wsServer = new ws.Server({ port: 4000 })
//create data for connecting clients
const wsClients = []

// Parse the JSON data from the 'db.json' and 'users.json' files
const db = JSON.parse(fs.readFileSync("./db.json", "utf8"));
const users = JSON.parse(fs.readFileSync("./users.json", "utf8"));

// The maximum age of the token cookie in milliseconds
const maxAge = 60000;

server.listen(port, () => {
  console.log(`server is listening on http://localhost:${port}`);
});
//if we are have connection with client
wsServer.on('connection', (client) => {
  //add this client to ws data
  wsClients.push(client)

//if client closed,delete from ws data
  client.on('close', () => {
    const i = wsClients.indexOf(client)
    wsClients.splice(i, 1)
  })
})

//add function to folders where we want to check changes
fs.watch('public/components', handleWatch)
fs.watch('public/styles', handleWatch)
fs.watch('public/img', handleWatch)
fs.watch('public', handleWatch)

//if we have changes ,send 'reload' to client
function handleWatch(eventType) {
  if (eventType === 'change') {
    for (const client of wsClients) {
      client.send('reload')
    }
  }
}

// Generate a unique ID for a new user
function generateId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  return `${timestamp}-${randomNumber}`;
}


async function handleRequest(request, response) {
  // Destructure the request method and URL
  const { method, url } = request;

  // Handle POST requests
  if (method === "POST") {
    if (url === "/api/data") {
      try {
        // Get the request body
        const body = await getBody(request);

        // Parse the JSON data in the request body
        const newMessage = JSON.parse(body);

        // Add the new message to the 'db.json' file
        db.push(newMessage);
        fs.writeFileSync("db.json", JSON.stringify(db));

        // Send a response to the client
        response.end("OK\n");
      } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    } else if (url === "/api/signup") {
      try {
        // Get the request body
        const body = await getBody(request);

        // Parse the JSON data in the request body
        const newUser = JSON.parse(body);

        // Generate an ID for the new user
        newUser.id = generateId();

        // Add the new user to the 'users.json' file
        users.push(newUser);
        fs.writeFileSync("users.json", JSON.stringify(users));

        // Send a response to the client
        response.end("OK\n");
      } catch (error) {
        console.error(error);
        response.statusCode = 500;
        response.end("Internal Server Error\n");
      }
    } else if (url === "/api/signin") {
      try {
        // Get the request body
        const body = await getBody(request);

        // Parse the JSON data in the request body
        const checkedUser = JSON.parse(body);

        // Find the user in the 'users.json' file
        const foundUser = users.find(
          (user) =>
            user.name === checkedUser.name &&
            user.password === checkedUser.password
        );

        if (foundUser) {
          // If the user is found
          // Generate a token for the user
          const token = generateId()
          foundUser.token = token
          fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
          console.log(foundUser)

          // Set thhe token cookie in the response header
          response.setHeader(
            "Set-Cookie",
            `token=${token}; Max-Age=${maxAge}; Path=/ `
          );

          // Send an "OK" response to the client
          response.end("OK\n");
        } else {
          // If the user is not found, send a "Unauthorized" response
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
  // Handle GET requests
  else if (method === "GET") {
    if (url === "/api/data") {
      // Read the 'db.json' file and send its contents to the client
      let data;
      try {
        data = fs.readFileSync("db.json");
      } catch (error) {
        data = '""';
      }
      response.statusCode = 200;
      response.end(data);
    } else if (url === "/api/token") {
      // Get the token from the request header
      const token = getToken(request);

      // Find the user with a matching ID in the 'users.json' file
      const foundUser = users.find((user) => user.token === token);

      if (foundUser) {
        // If the user is found, send an "OK" response
        response.end("OK\n");
      } else {
        // If the user is not found, send a "Unauthorized" response
        response.statusCode = 401;
        response.end("Unauthorized\n");
      }
    } else if(url === '/api/user'){
      // Get the token from the request header
      const token = getToken(request);

      // Find the user with a matching token in the 'users.json' file
      const foundUser = users.find((user) => user.token === token);

      if (foundUser) {
        console.log(foundUser)
        // If the user is found, send an "OK" response
        response.end(foundUser.id);
      } else {
        // If the user is not found, send a "Unauthorized" response
        response.statusCode = 401;
        response.end("Cant find user\n");
      }

    }else {
      // Handle requests for static files
      if (url === "/") {
        // Read the 'index.html' file and send its contents to the client
        const html = fs.readFileSync("public/index.html");
        response.end(html);
        return;
      }
      try {
        // If the requested file is blacklisted, throw an error
        if (blacklist.includes(url)) throw null;

        // Read the requested file and send its contents to the client
        const file = fs.readFileSync('public/' + url.slice(1));
        response.end(file);
      } catch (error) {
        // If the file is not found, send a "404 Not found" response
        response.statusCode = 404;
        response.end(
          `<div>Error, ${url.slice(
            1
          )} does not exist<div><br><a href="http://localhost:3000/">Try this<a>`
        );
      }
    }
  }
}

// Get the request body as a string
async function getBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request
      .on("data", (chunk) => {
        body += chunk.toString();
      })
      .on("end", () => {
        resolve(body);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

// Get the 'token' cookie from the request header
function getToken(request) {
  const cookie = request.headers.cookie;
  if (!cookie) return null;
  const tokenMatch = cookie.match(/token=([^;]+)/);
  if (!tokenMatch) return null;
  return tokenMatch[1];
}



