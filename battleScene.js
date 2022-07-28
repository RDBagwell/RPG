const battleUi = document.getElementById('battleUi');
const enemyHealthbar = document.getElementById('enemyHealthbar');
const playerHealthbar = document.getElementById('playerHealthbar');
const battleDialog = document.getElementById('battleDialog');
const attacksBox = document.querySelector('.attacks');
const attackType = document.querySelector('.attackType');
const battleBackgoundImage = new Image();
battleBackgoundImage.src = './images/battleBackground.png';

const battleBackgound = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgoundImage
});

let playerAttacks;
let draggle;
let emby;
let renderdSprites;
let battleAnimationId;
let queue;
let buttons;

function initBattle() {
    battleUi.style.display = 'block';
    battleDialog.style.display = 'none';
    enemyHealthbar.style.width = '100%';
    playerHealthbar.style.width = '100%';
    attacksBox.replaceChildren();

    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby);
    renderdSprites = [draggle, emby];
    queue = [];

    playerAttacks = emby.attacks;
    playerAttacks.forEach(({name})=>{
        const button = document.createElement('button');
        button.innerHTML = name
        attacksBox.append(button)
    });

    buttons = document.querySelectorAll('button');
    buttons.forEach(button=>{
        button.addEventListener("click", (event)=>{
            emby.attack({
                attack: attacks[event.target.innerText],
                recipient: draggle, 
                renderdSprites
            })
            
            if(draggle.health <= 0){
                queue.push(()=>{
                    draggle.faint()
                });
                exitBattle();
                return
            }
            // Enemy Attckts
            const randomAttck = draggle.attacks[Math.floor((Math.random() * draggle.attacks.length))];
            queue.push(()=>{
                    draggle.attack({
                    attack: randomAttck,
                    recipient: emby,
                    renderdSprites
                })
            })

            if(emby.health <= 0){
                queue.push(()=>{
                    emby.faint()
                });
                exitBattle();
                return
            }

        });

        button.addEventListener('mouseover', (event)=>{
            attackType.innerText = attacks[event.target.innerText].type;
            attackType.style.color = attacks[event.target.innerText].textColor;
        });
        button.addEventListener('mouseout', (event)=>{
            attackType.innerText = 'Attack Type';
            attackType.style.color = 'black';
        });
        
    });

}

function exitBattle() {
    queue.push(()=>{
        gsap.to('#overlapping', {
            opacity: 1,
            onComplete: ()=>{
                cancelAnimationFrame(battleAnimationId)
                animate();
                battleUi.style.display = 'none'
                gsap.to('#overlapping', {
                    opacity: 0
                })
            }
        })
    })
    battle.initiated = false
}

function animateBattle() {
    battleAnimationId = requestAnimationFrame(animateBattle);
    battleBackgound.draw();
    renderdSprites.forEach((sprite=>{
        sprite.draw()
    }))
}

battleDialog.addEventListener('click', (event)=>{
    if (queue.length > 0){
        queue[0]();
        queue.shift();
    } else { event.target.style.display = 'none'; }
    
})

animate()
// initBattle()
// animateBattle()
