
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
        } else {
            clientPlayers[id].updatePosition(serverPlayer.x, serverPlayer.y);
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

// player movement

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

const SPEED = 5;

setInterval(() => {

    if (keys.w.pressed) {
        clientPlayers[socket.id].y -= SPEED;
        socket.emit("move", { direction: "up" });
    }
    if (keys.a.pressed) {
        clientPlayers[socket.id].x -= SPEED;
        socket.emit("move", { direction: "left" });
    }
    if (keys.s.pressed) {
        clientPlayers[socket.id].y += SPEED;
        socket.emit("move", { direction: "down" });
    }
    if (keys.d.pressed) {
        clientPlayers[socket.id].x += SPEED;
        socket.emit("move", { direction: "right" });
    }

}, 15);



window.addEventListener("keydown", (e) => {

    if (!clientPlayers[socket.id]) return;
    
    // WASD movement
    switch(e.key) {
        case "w":
            keys.w.pressed = true;
            break;
        case "a":
            keys.a.pressed = true;
            break;
        case "s":
            keys.s.pressed = true;
            break;
        case "d":
            keys.d.pressed = true;
            break;
    }
});

window.addEventListener("keyup", (e) => {

    if (!clientPlayers[socket.id]) return;

    switch(e.key) {
        case "w":
            keys.w.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "s":
            keys.s.pressed = false;
            break;
        case "d":
            keys.d.pressed = false;
            break;
    }
});


/* ----------------- */

// connection error handling and disconnection

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", (reason) => {
    console.log(`Disconnect due to ${reason}`);

    $status.innerText = "Disconnected";
    $transport.innerText = "N/A";
});

/* ----------------- */