import './app/style/scss/ghosts.scss'
import './app/style/scss/mainPage.scss'
import './app/style/scss/maze.scss'
import './app/style/scss/pacman.scss'
import './app/style/scss/pickups.scss'

import GameCoordinator from './app/scripts/core/gameCoordinator.js'
let gameCoordinator = new GameCoordinator();


//TODO: below can be removed after testing
const gamepads = {};

window.addEventListener(
    "gamepadconnected",
    (e) => {
        gamepadHandler(e, true);
    },
    false,
);
window.addEventListener(
    "gamepaddisconnected",
    (e) => {
        gamepadHandler(e, false);
    },
    false,
);

function gamepadHandler(e, connected) {
    const gamepad = e.gamepad;
    // Note:
    // gamepad === navigator.getGamepads()[gamepad.index]

    if (connected) {
        gamepads[gamepad.index] = gamepad;
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length,
        );
        console.log(e.gamepad);
    } else {
        delete gamepads[gamepad.index];
        console.log(
            "Gamepad disconnected from index %d: %s",
            e.gamepad.index,
            e.gamepad.id,
            );
        console.log(e.gamepad);
    }
}


const gamepadInfo = document.getElementById("gamepad-info");
const ball = document.getElementById("ball");
let start;
let a = 0;
let b = 0;

let demoStartButton = document.getElementById('demo-start');
demoStartButton.addEventListener(
    'click',
    startButtonClick.bind(this),
);

window.addEventListener("gamepadconnected", (e) => {
    gamepadInfo.textContent = "Gamepad connected.";
});

window.addEventListener("gamepaddisconnected", (e) => {
    gamepadInfo.textContent = "Waiting for gamepad...";
    cancelAnimationFrame(start);
});

function startButtonClick() {
    //demoStartButton.disabled = true;
    gameLoop(true);
}

function gameLoop() {
    const gamepads = navigator.getGamepads();
    if (!gamepads || gamepads.every(element => element === null)) {
        start = requestAnimationFrame(gameLoop);
        return;
    }

    gamepads.forEach(function(gp, index, array) {
        if(gp != null) {

            //const gp = gamepads[0];
            if (gp.buttons[13].pressed) {
                b++;
            }
            if (gp.buttons[12].pressed) {
                b--;
            }
            if (gp.buttons[15].pressed) {
                a++;
            }
            if (gp.buttons[14].pressed) {
                a--;
            }


            //const gp = gamepads[0];
            if (gp.buttons[0].pressed) {
                b++;
            }
            if (gp.buttons[3].pressed) {
                b--;
                if(gp.vibrationActuator)
                    gp.vibrationActuator.playEffect("dual-rumble", {
                        startDelay: 0,
                        duration: 1000,
                        weakMagnitude: 0.8,
                        strongMagnitude: 0.5
                    });
            }
            if (gp.buttons[1].pressed) {
                a++;
                let gpx = gamepads[1]
                if(gpx && gpx.vibrationActuator)
                    gpx.vibrationActuator.playEffect("trigger-rumble", {
                        startDelay: 0,
                        duration: 1000,
                        weakMagnitude: 0.8,
                        strongMagnitude: 0.5,
                        leftTrigger:0,
                        rightTrigger:0.8
                    });
            }
            if (gp.buttons[2].pressed) {
                a--;
                if(gp.vibrationActuator)
                    gp.vibrationActuator.playEffect("dual-rumble", {
                        startDelay: 0,
                        duration: 1000,
                        weakMagnitude: 0.8,
                        strongMagnitude: 0.5,
                        leftTrigger:0.8,
                        rightTrigger:0
                    });
            }
        }
    });

    ball.style.left = `${a * 2}px`;
    ball.style.top = `${b * 2}px`;

    start = requestAnimationFrame(gameLoop);
}


// window.addEventListener("gamepadconnected", (e) => {
//     console.log(
//         "Gamepad connected at index %d: %s. %d buttons, %d axes.",
//         e.gamepad.index,
//         e.gamepad.id,
//         e.gamepad.buttons.length,
//         e.gamepad.axes.length,
//       );
//     console.log(e.gamepad);
// });

// window.addEventListener("gamepaddisconnected", (e) => {
//     console.log(
//         "Gamepad disconnected from index %d: %s",
//         e.gamepad.index,
//         e.gamepad.id,
//       );
//     console.log(e.gamepad);
// });