
const $status = document.getElementById("status");
const $transport = document.getElementById("transport");
const $numberPlayers = document.getElementById("numberPlayers");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const socket = io({
    transports: ["webtransport"],
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

socket.on("init", (data) => {

    playerId = data.id;
    data.sockets.forEach( player => {
        players[player.id] = { x: player.x, y: player.y };
    });

    draw();
});

socket.on("update", (data) => {

    if (players[data.id]) {
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        draw();
    } else {
        players[data.id] = { x: data.x, y: data.y };
        draw();
    }
});

socket.on("remove", (id) => {
    delete players[id];
    draw();
});

socket.on("numPlayers", (number) => {
    $numberPlayers.innerText = number.toString();
});

socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});

socket.on("disconnect", (reason) => {
    console.log(`disconnect due to ${reason}`);

    $status.innerText = "Disconnected";
    $transport.innerText = "N/A";
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = "black";
        ctx.fillRect(player.x, player.y, 5, 5);
    }
}

window.addEventListener("keydown", (event) => {

    switch (event.key) {
        case "ArrowUp":
        socket.emit("move", { direction: "up" });
        break;
        case "ArrowDown":
        socket.emit("move", { direction: "down" });
        break;
        case "ArrowLeft":
        socket.emit("move", { direction: "left" });
        break;
        case "ArrowRight":
        socket.emit("move", { direction: "right" });
        break;
    }
});
