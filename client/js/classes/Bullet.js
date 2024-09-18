
class Bullet {

    constructor({ x, y, velocity, ctx }) {
        
        this.x = x;
        this.y = y;
        this.velocity = velocity;
        this.ctx = ctx;

        this.image = new Image();
        this.image.src = "./sprites/bullet.gif";

        this.image.onload = () => {
            this.loaded = true;
        };

        this.width = 10;
        this.height = 10;
    }

    draw() {
        if (this.loaded)
            this.ctx.drawImage(this.image, this.x, this.y, 40, 40);
    }

    clear() {
        this.ctx.clearRect(this.x, this.y, 10, 10);
    }

    update() {
        this.clear();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.draw();
    }
}