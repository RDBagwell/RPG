const canvas = document.querySelector('canvas');
canvas.width = 1024;
canvas.height = 576;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i))
}

const battleZoneMap = []
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZoneMap.push(battleZonesData.slice(i, 70 + i))
}

const image = new Image();
image.src = './images/Pellet Town.png';

const forgroundImage = new Image();
forgroundImage.src = './images/foregroundObjects.png';

const playerImage = new Image();
playerImage.src = './images/playerDown.png';

const playerImageUP = new Image();
playerImageUP.src = './images/playerUp.png';

const playerImageLeft = new Image();
playerImageLeft.src = './images/playerLeft.png';

const playerImageRight = new Image();
playerImageRight.src = './images/playerRight.png';

const boundaries = [];
const offset = {
    x: -740,
    y: -615
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025){
            boundaries.push(new Boundary({position:{
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
            }}))
        }
    })
})

const battleZones = [];
battleZoneMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if(symbol === 1025){
            battleZones.push(new Boundary({position:{
                x: j * Boundary.width + offset.x,
                y: i * Boundary.height + offset.y
            }}))
        }
    })
});

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
});

const forground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: forgroundImage
});

const keys = {
    w:{ pressed: false },
    a:{ pressed: false },
    s:{ pressed: false },
    d:{ pressed: false },
};

let lastKey = '';

const player = new Sprite({
    position: {
        x: canvas.width / 2 - playerImage.width / 4 / 2 ,
        y: canvas.height / 2 - playerImage.height / 2
    }, 
    image: playerImage,
    frames: {max: 4, hold: 10},
    sprites: {
        up: playerImageUP,
        left: playerImageLeft,
        right: playerImageRight,
        down: playerImage
    }
})

const movables = [
    background,
    ...boundaries,
    ...battleZones,
    forground
]

function rectangularCollision({ rec1, rec2}) {
    return(
        rec1.position.x + rec1.width >= rec2.position.x &&
        rec1.position.x  <= rec2.position.x + rec2.width &&
        rec1.position.y <= rec2.position.y + rec2.height && 
        rec1.position.y + rec1.height >= rec2.position.y
     );
}

const battle = {
    initiated: false
}

let id = 0;

function animate() {
    let moving = true
    const animationId = requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary=>{
        boundary.draw()
    })
    battleZones.forEach(battleZone=>{
        battleZone.draw()
    })
    player.draw();
    forground.draw();
    player.animate = false;
    if(battle.initiated) return
    if(keys.w.pressed || keys.a.pressed || keys.d.pressed || keys.s.pressed){
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * ( Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y)); 
            if(rectangularCollision({
                rec1: player, 
                rec2: battleZone
            }) && overlappingArea > (player.width * player.height) / 2  
               && Math.random() < 0.01
            ){
                console.log("battleZone");
                // Deactivate Animation
                cancelAnimationFrame(animationId)
                console.log(animationId)
                id = animationId
                battle.initiated = true;

                audio.Map.stop();
                audio.InitBattle.play();
                audio.Battle.play();

                gsap.to('#overlapping', {
                    opacity: 1, 
                    repeat: 3,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlapping', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete(){
                                // Activate new animation loop
                                initBattle();
                                animateBattle();
                                gsap.to('#overlapping', {
                                    opacity: 0,
                                    duration: 0.4,
                                })
                            }
                        })
                    }
                });
                break;
            }  
        }
    }

    if(keys.w.pressed && lastKey === 'w'){
        player.animate = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rec1: player, 
                rec2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })
            ){
                moving = false;
                break;
            }  
        }

        if(moving){
            movables.forEach((movable =>{
                movable.position.y += 3
            }));
        }
    }
    else if(keys.a.pressed && lastKey === 'a'){
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rec1: player, 
                rec2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }
            })
            ){
                moving = false;
                break;
            }  
        }
        if(moving){
            movables.forEach((movable =>{
                movable.position.x += 3
            }));
        }
    }
    else if(keys.s.pressed && lastKey === 's' ){
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rec1: player, 
                rec2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })
            ){
                moving = false;
                break;
            }  
        }
        if(moving){
            movables.forEach((movable =>{
                movable.position.y -= 3
            }));
        }
    }
    else if(keys.d.pressed && lastKey === 'd'){
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if(rectangularCollision({
                rec1: player, 
                rec2: {
                    ...boundary,
                    position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }
            })
            ){
                moving = false;
                break;
            }  
        }
        if(moving){
            movables.forEach((movable =>{
                movable.position.x -= 3
            }));
        }
    };
}

addEventListener('keydown', ({key})=>{
    switch (key) {
        case 'w':
            keys.w.pressed = true;
            lastKey = 'w';   
            break;
        case 'a':
            keys.a.pressed = true;  
            lastKey = 'a'; 
            break;
        case 's':
            keys.s.pressed = true;
            lastKey = 's';   
            break;
        case 'd':
            keys.d.pressed = true;
            lastKey = 'd';   
            break;
    }
});

addEventListener('keyup', ({key})=>{
    switch (key) {
        case 'w':
            keys.w.pressed = false;   
            break;
        case 'a':
            keys.a.pressed = false;   
            break;
        case 's':
            keys.s.pressed = false;
            player.animate = false  
            break;
        case 'd':
            keys.d.pressed = false;   
            break;
}
   
});

let clicked = false
addEventListener('click', ()=>{
    if(!clicked){
        audio.Map.play();
        clicked  = true
    }
});