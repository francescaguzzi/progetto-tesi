
class Enemy {

    constructor({ x, y, ctx, health }) {

        this.x = x;
        this.y = y;
        this.ctx = ctx;

        this.image = new Image();
        this.image.src = "./sprites/enemy-spritesheet.png";

        this.image.onload = () => {
            this.loaded = true;
        };

        this.endImage = new Image();
        this.endImage.src = "./sprites/shoe.png";

        this.endImage.onload = () => {
            this.endLoaded = true;
        }


        // animation variables
        this.frameIndex = 0;
        this.frames = 4;
        this.frameWidth = 250;
        this.frameHeight = 200;
        this.frameTime = 1000 / 3; // 3 frames per second
        this.lastFrameTime = 0;


        this.maxHealth = 100;
        this.health = health;

        this.width = 200;
        this.height = 160;

        this.isdead = false;
    }

    draw(currentTime) {

        if (this.isdead) {
            
            if (this.endLoaded) {

                const endImageWidth = 60;
                const endImageHeight = 60;

                const centerX = this.x + (this.width / 2) - (endImageWidth / 2);
                const centerY = this.y + (this.height / 2) - (endImageHeight / 2);


                this.ctx.drawImage(
                    this.endImage, 
                    centerX, centerY, // Posizione nel canvas
                    endImageWidth, endImageHeight // Dimensioni nel canvas
                );
            }
            return;
        }

        // Gestisce il cambio di frame ogni `frameTime` millisecondi
        if (currentTime - this.lastFrameTime > this.frameTime) {
            this.frameIndex = (this.frameIndex + 1) % this.frames; // Cambia frame in modo ciclico
            this.lastFrameTime = currentTime;
        }

        // Disegna il frame corrente
        this.ctx.drawImage(
            this.image, 
            this.frameIndex * this.frameWidth, 0, // Ritaglia il frame dalla spritesheet
            this.frameWidth, this.frameHeight, // Dimensioni del frame
            this.x, this.y, // Posizione nel canvas
            this.width, this.height // Dimensioni del frame nel canvas
        );


        //this.ctx.fillStyle = "red";
        //this.ctx.fillRect(this.x, this.y, this.width, this.height);

        this.drawHealthBar();
    }

    die() {
        this.isdead = true;
    }

    drawHealthBar() {

        const healthBarWidth = 80;
        const healthBarHeight = 6;

        const healthBarX = this.x + (this.width / 2) - (healthBarWidth / 2);
        const healthBarY = this.y - 10;

        // Drawing the health bar background

        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);


        const healthPercentage = this.health / this.maxHealth;

        // Drawing the health bar
        this.ctx.fillStyle = "#cc6c34";
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    
    }   
}