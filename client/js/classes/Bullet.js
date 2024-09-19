
class Bullet {

    constructor({ x, y, type, velocity, ctx }) {
        
        this.x = x;
        this.y = y;
        this.type = type;
        this.velocity = velocity;
        this.ctx = ctx;

        if (this.type === "player") {
            this.image = new Image();
            this.image.src = "./sprites/playerbullet.png";
        } else {
            this.image = new Image();
            this.image.src = "./sprites/enemybullet.png";
        }

        this.image.onload = () => {
            this.loaded = true;
        };

        this.width = 20;
        this.height = 20;
    }

    draw() {
        if (this.loaded)
            this.ctx.drawImage(this.image, this.x, this.y, 20, 20);
    }

    clear() {
        this.ctx.clearRect(this.x, this.y, 20, 20);
    }

    update() {
        this.clear();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}