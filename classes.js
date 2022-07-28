class Boundary {
    static width = 48;
    static height = 48;
    constructor({position}){
        this.position = position
        this.width = 48;
        this.height = 48;
    }
    draw(){
        ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {max: 1, hold: 10},
        sprites,
        animate = false,
        rotation = 0,
    }){
        this.position = position;
        this.velocity = velocity;
        this.image = new Image();
        this.frames = { ...frames, val: 0, elapsed: 0 };
        this.image.onload = () =>{
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        };
        this.image.src = image.src
        this.animate = animate;
        this.sprites = sprites;
        this.opacity = 1;
        this.rotation = rotation;
    }

    draw(){
        ctx.save();
        ctx.translate(
            this.position.x + this.width / 2,
            this.position.y + this.height / 2
        )
        ctx.rotate(this.rotation)
        ctx.translate(
            - this.position.x - this.width / 2,
            - this.position.y - this.height / 2
        )
        ctx.globalAlpha = this.opacity
        ctx.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height, 
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        );
        ctx.restore();
        if(!this.animate) return;
        if(this.frames.max > 1)this.frames.elapsed++;
        if(this.frames.elapsed % this.frames.hold === 0){
            if(this.frames.val < this.frames.max -1) this.frames.val++;
            else this.frames.val = 0;
        }
    }


}

class Monster extends Sprite{
    constructor({
        position,
        velocity,
        image,
        frames = {max: 1, hold: 10},
        sprites,
        animate = false,
        rotation = 0,
        name,
        attacks,
        isEnemy = false,
    }){
        super({
            position,
            velocity,
            image,
            frames,
            sprites,
            animate,
            rotation,
        })
        this.name = name;
        this.attacks = attacks;
        this.isEnemy = isEnemy;
        this.health = 100;
    }

    faint(){
        const battleDialog = document.getElementById('battleDialog');
        battleDialog.innerText = `${this.name} fainted!`
        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        console.log("faint");
    }

    attack({ attack, recipient, renderdSprites }){
        const battleDialog = document.getElementById('battleDialog');
        battleDialog.style.display = "block";
        battleDialog.innerHTML = `${this.name} used ${attack.name}!`;

        let healthbar = '#enemyHealthbar';
        let rotation = 1
        let xMovement = 20;
        let yMovement = 180;
        if(this.isEnemy){
            healthbar = '#playerHealthbar';
            rotation = -2.2
            xMovement = -20;
            yMovement = -180;
        }
        recipient.health -= attack.damage

        switch (attack.name) {
            case "Tackle":
                const tl = gsap.timeline()
                tl.to(this.position, {
                    x: this.position.x - xMovement,
                }).to(this.position, {
                    x: this.position.x + xMovement * 20,
                    y: this.position.y - yMovement,
                    duration: 0.1,
                    onComplete: ()=>{
                        gsap.to(healthbar, {
                            width: `${recipient.health}%`
                        })
                        gsap.to(recipient.position, {
                            x:  recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                })
                .to(this.position, {
                    x: this.position.x,
                    y: this.position.y
                })
                break;
        
            case "Fireball":
                const fireballImg = new Image()
                fireballImg.src = './images/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y
                    },
                    image: fireballImg,
                    frames: {max: 4, hold: 10},
                    animate: true,
                    rotation
                });
                renderdSprites.splice(1, 0, fireball);
                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,
                    onComplete: ()=>{
                        renderdSprites.splice(1, 1);
                        gsap.to(healthbar, {
                            width: `${recipient.health}%`
                        })
                        gsap.to(recipient.position, {
                            x:  recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                        gsap.to(recipient, {
                            opacity: 0,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })
                    }
                })
                break;
        }


    } 
}