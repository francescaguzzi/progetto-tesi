import { readFile } from "node:fs/promises";
import { createServer } from "node:https";
import { Server as SocketIOServer } from "socket.io";
import { Http3Server } from "@fails-components/webtransport";

import express from "express";
import fs from "fs";


/* SERVER SETUP */

// using express to serve static files
// and HTTP/3 server to handle WebTransport sessions with Socket.IO

const app = express();
app.use(express.static('client'));

// required for HTTP/3
const key = fs.readFileSync('./key.pem', 'utf8');
const cert = fs.readFileSync('./cert.pem', 'utf8');

app.get('/', async (req, res) => {
  try {
      const content = await readFile("./client/index.html", "utf8");
      res.send(content);
  } catch (error) {
      res.status(500).send('Error reading index.html');
  }
});

const httpsServer = createServer( {key, cert}, app);

const port = process.env.PORT || 3000;
httpsServer.listen(port, () => {
    console.log('HTTPS server listening on port 3000');
});

const h3Server = new Http3Server({
    port,
    host: "0.0.0.0",
    secret: "changeit",
    cert,
    privKey: key,
  });
  
h3Server.startServer();
  
(async () => {
  
  try {
    const stream = await h3Server.sessionStream("/socket.io/");
    const sessionReader = stream.getReader();

    while (true) {
        const { done, value } = await sessionReader.read();
        if (done) {
            break;
        }
        io.engine.onWebTransportSession(value);
    }
  } catch (error) {
      console.error("Error in WebTransport session stream:", error);
  }

})();

const io = new SocketIOServer(httpsServer, {
    transports: ["polling", "webtransport", "websocket"],
    // pingInterval: 5000, // 5 seconds
    // pingTimeout: 5000, // timeout for inactive users
});

/* ----------------- */

const serverPlayers = {};
let numPlayers = 0;

io.on("connection", (socket) => {

    numPlayers++;

    serverPlayers[socket.id] = {
        x: 500 * Math.random(),
        y: 500 * Math.random(),
        color: Math.floor(Math.random() * 4) + 1
    };

    console.log("user " + socket.id + " connected with transport " + socket.conn.transport.name);

    io.emit("updatePlayers", serverPlayers);
    io.emit("numPlayers", numPlayers);

    /* ----------------- */

    // handle transport upgrades (e.g., from polling to websocket)
    socket.conn.on("upgrade", (transport) => {
        console.log("transport upgraded to " + transport.name);
    });

    /* ----------------- */

    // player movement handler -> given to ticker function

    const SPEED = 5;

    socket.on("move", (data) => {

        switch (data.direction) {
            case "left":
                serverPlayers[socket.id].x -= SPEED;
                break;
            case "up":
                serverPlayers[socket.id].y -= SPEED;
                break;
            case "right":
                serverPlayers[socket.id].x += SPEED;
                break;
            case "down":
                serverPlayers[socket.id].y += SPEED;
                break;
        }
    });


    /* ----------------- */

    socket.on("disconnect", (reason) => {

      console.log("user " + socket.id + " disconnected due to " + reason);
      
      delete serverPlayers[socket.id];
        
      io.emit("updatePlayers", serverPlayers);

      numPlayers--;
      io.emit("numPlayers", numPlayers);
    });

});

/* ----------------- */

// ticker function to update player positions
// and emit the updated player positions to all clients
// this prevents clogging the network with too many messages

setInterval(() => {
    io.emit("updatePlayers", serverPlayers);
}, 15); // 15ms is recommended for 60fps
        // increasing this -> delay in player movement
 

/* ----------------- */

// handle webtransport session errors
io.engine.on('webtransport-error', (error) => {
  console.error("WebTransport Error:", error);
});

/* ----------------- */





