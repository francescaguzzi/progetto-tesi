
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

//canvas.width = window.innerWidth * devicePixelRatio;
//canvas.height = window.innerHeight * devicePixelRatio;

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

/* PLAYERS CONNECTION AND RENDERING */


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

    // sending canvas size to the server
    socket.emit("initCanvas", { width: canvas.width, height: canvas.height });

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
        } else { // if a player already exists
            
            if ( id === socket.id ) {
                
                clientPlayers[id].updatePosition(serverPlayer.x, serverPlayer.y);
                
                // server reconciliation
                const lastServerInputIndex = playerInputs.findIndex(input => {
                    return serverPlayer.sequenceNumber === input.sequenceNumber;
                });

                if (lastServerInputIndex > -1) 
                    playerInputs.splice(0, lastServerInputIndex + 1);
                
                playerInputs.forEach(input => {
                    clientPlayers[id].x += input.dx;
                    clientPlayers[id].y += input.dy;
                });
            }
            else { // update position of other players
                
                // clientPlayers[id].updatePosition(serverPlayer.x, serverPlayer.y);
                
                // interpolation
                gsap.to(clientPlayers[id], { 
                    x: serverPlayer.x, 
                    y: serverPlayer.y, 
                    duration: 0.0015,
                    ease: "linear"
                });
            }
        }
    }

    for (const id in clientPlayers) {
        if (!serverPlayers[id]) {
            delete clientPlayers[id];
        }
    }

    // console.log(clientPlayers);
});

socket.on("numPlayers", (number) => {
    $numberPlayers.innerText = number.toString();
});


/* ----------------- */

/* BULLETS EMITTING */

const clientBullets = {};

socket.on("updateBullets", (serverBullets) => {


    for (const id in serverBullets) {
        const serverBullet = serverBullets[id];

        if (!clientBullets[id]) {

            clientBullets[id] = new Bullet({
                x: serverBullet.x,
                y: serverBullet.y,
                velocity: serverBullet.velocity,
                ctx: ctx
            });
        } else {
            clientBullets[id].x = serverBullet.x;
            clientBullets[id].y = serverBullet.y;
            clientBullets[id].velocity = serverBullet.velocity;
        }
    }

});



window.addEventListener("click", (e) => {

    const canvasRect = canvas.getBoundingClientRect();
    
    const clickPosition = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top
    };

    const playerPosition = {
        x: clientPlayers[socket.id].x,
        y: clientPlayers[socket.id].y
    };

    const angle = Math.atan2(clickPosition.y - playerPosition.y,
                            clickPosition.x - playerPosition.x);
    

    socket.emit('shoot', {
        x: playerPosition.x,
        y: playerPosition.y,
        angle
    });

    // console.log(clientBullets);
});  

/* ----------------- */

// ENEMY RENDERING

const clientEnemy = new Enemy({ x: 0, y: 0, ctx, health: 0, width: 0, height: 0 });

socket.on("createEnemy", (serverEnemy) => {

    clientEnemy.x = serverEnemy.x;
    clientEnemy.y = serverEnemy.y;
    clientEnemy.health = serverEnemy.health;
    clientEnemy.width = serverEnemy.width;
    clientEnemy.height = serverEnemy.height;

});

socket.on("updateEnemy", (serverEnemy) => {

    clientEnemy.health = serverEnemy.health;

});

socket.on("enemyDied", () => {

    clientEnemy.die();

});





/* ----------------- */

/* ANIMATION AND RENDERING */

let animationId;
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // player rendering
    for (const id in clientPlayers) {
        const player = clientPlayers[id];
        player.draw();
    }


    for (const id in clientBullets) {
        const bullet = clientBullets[id];
        bullet.draw();
    }

    clientEnemy.draw();

}
animate();


/* ----------------- */

// player movement

const keys = {
    w: { pressed: false },
    a: { pressed: false },
    s: { pressed: false },
    d: { pressed: false }
}

const SPEED = 5;

// variables for preventing lags in client/server communication
const playerInputs = [];
let sequenceNumber = 0;

// we need to splice out the events that have already been processed by the server
// while keeping the ones that haven't been processed yet

setInterval(() => {

    if (keys.w.pressed) {

        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: -SPEED });
        clientPlayers[socket.id].y -= SPEED;
        socket.emit("move", { direction: "up", sequenceNumber });

    }
    if (keys.a.pressed) {

        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: -SPEED, dy: 0 });
        clientPlayers[socket.id].x -= SPEED;
        socket.emit("move", { direction: "left", sequenceNumber });

    }
    if (keys.s.pressed) {

        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: 0, dy: SPEED });
        clientPlayers[socket.id].y += SPEED;
        socket.emit("move", { direction: "down", sequenceNumber });

    }
    if (keys.d.pressed) {

        sequenceNumber++;
        playerInputs.push({ sequenceNumber, dx: SPEED, dy: 0 });
        clientPlayers[socket.id].x += SPEED;
        socket.emit("move", { direction: "right", sequenceNumber });

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