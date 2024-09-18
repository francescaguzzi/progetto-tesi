
class Player {

    // sprites -> 1.png, 2.png, 3.png, 4.png
    // randomly chosen on the server

    constructor({ x, y, color, username, ctx }) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.username = username;
        this.ctx = ctx;

        this.maxHealth = 100;
        this.health = 100;

        this.image = new Image();
        this.image.src = `./sprites/players/${color}.png`;

        this.width = 10;
        this.height = 10;

        this.image.onload = () => {
            this.draw();
        };
    }

    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, 30, 30);

        this.drawHealthBar();
    } 

    clear() {
        this.ctx.clearRect(this.x, this.y, 30, 30);
    }

    drawHealthBar() {

        const healthBarWidth = 80;
        const healthBarHeight = 6;

        const healthBarX = this.x + (30 / 2) - (healthBarWidth / 2);
        const healthBarY = this.y - 10;

        // Drawing the health bar background

        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        const healthPercentage = this.health / this.maxHealth;

        // Drawing the health bar

        this.ctx.fillStyle = "red";
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    }

    updatePosition(x, y) {
        this.clear();
        this.x = x;
        this.y = y;
        this.draw();
    }
}
    