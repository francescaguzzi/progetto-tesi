
// forcing the client to use webtransport
const TRANSPORT_NAME = "websocket";


/* DISPLAYING CONNECTION STATUS */

const $status = document.getElementById("status");
const $transport = document.getElementById("transport");
const $numberPlayers = document.getElementById("numberPlayers");

/* ----------------- */

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const socket = io({
    transports: [TRANSPORT_NAME],
    transportOptions: {
        webtransport: {
        hostname: "127.0.0.1"
        }
    }
});

let playerId;
const players = {};

socket.on("connect", () => {
    console.log(`connected with transport ${socket.io.engine.transport.name}`);

    $status.innerText = "Connected";
    $transport.innerText = socket.io.engine.transport.name;

    socket.io.engine.on("upgrade", (transport) => {
        console.log(`transport upgraded to ${transport.name}`);

        $transport.innerText = transport.name;
    });
});

socket.on('updatePlayers', (serverPlayers) => {

    for (const id in serverPlayers) {
        const serverPlayer = serverPlayers[id];

        if (!players[id]) {

            players[id] = new Player({
                x: serverPlayer.x,
                y: serverPlayer.y,
                radius: 5,
                color: "black",
                username: id
            });
        } 
    }

    for (const id in players) {
        if (!serverPlayers[id]) {
            delete players[id];
        }
    }

    console.log(players);
});

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const player = players[id];
        player.draw(ctx);
    }
}

animate();


socket.on("numPlayers", (number) => {
    $numberPlayers.innerText = number.toString();
});






/* ----------------- */

// connection error handling

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", (reason) => {
    console.log(`Disconnect due to ${reason}`);

    $status.innerText = "Disconnected";
    $transport.innerText = "N/A";
});

/* ----------------- */