
class Player {

    constructor({ x, y, radius, color, username }) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.username = username;
    }

    draw(ctx) {

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    } 

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }
}
    