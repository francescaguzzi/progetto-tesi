
class Player {

    // sprites -> 1.png, 2.png, 3.png, 4.png
    // randomly chosen on the server

    constructor({ x, y, color, username, ctx }) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.username = username;
        this.ctx = ctx;

        this.image = new Image();
        this.image.src = `./sprites/players/${color}.png`;

        this.image.onload = () => {
            this.draw();
        };
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, 30, 30);
    } 

    clear() {
        this.ctx.clearRect(this.x, this.y, 30, 30);
    }

    updatePosition(x, y) {
        this.clear();
        this.x = x;
        this.y = y;
        this.draw();
    }
}
    