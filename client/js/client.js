
// forcing the client to use webtransport
const TRANSPORT_NAME = "websocket";


/* DISPLAYING CONNECTION STATUS */

const $status = document.getElementById("status");
const $transport = document.getElementById("transport");
const $numberPlayers = document.getElementById("numberPlayers");

/* ----------------- */

const devicePixelRatio = window.devicePixelRatio || 1;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth * devicePixelRatio;
canvas.height = window.innerHeight * devicePixelRatio;

const x = canvas.width / 2;
const y = canvas.height / 2;

/* ----------------- */

const socket = io({
    transports: [TRANSPORT_NAME],
    transportOptions: {
        webtransport: {
        hostname: "127.0.0.1"
        }
    }
});

/* ----------------- */

let playerId;
const clientPlayers = {};

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

        if (!clientPlayers[id]) {

            clientPlayers[id] = new Player({
                x: serverPlayer.x,
                y: serverPlayer.y,
                color: serverPlayer.color,
                username: id,
                ctx: ctx
            });
        } 
    }

    for (const id in clientPlayers) {
        if (!serverPlayers[id]) {
            delete clientPlayers[id];
        }
    }

    console.log(clientPlayers);
});

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in clientPlayers) {
        const player = clientPlayers[id];
        player.draw();
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