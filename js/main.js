/*
=========================================================
BLOCKWORLD
Main Game File

This file handles:
- Three.js setup
- Lighting
- Keyboard input
- Mouse look
- Pointer lock
- Game startup
- Game loop

Other systems:
- blocks.js  → block definitions
- world.js   → world generation
- player.js  → player movement and collision
=========================================================
*/


/* ======================================================
   CANVAS
====================================================== */

const canvas =
    document.getElementById("game");


/* ======================================================
   THREE.JS
====================================================== */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(0x87ceeb);


scene.fog =
    new THREE.Fog(
        0x87ceeb,
        20,
        80
    );


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        200
    );


const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


/* ======================================================
   LIGHTING
====================================================== */

const skyLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x557755,
        1.8
    );


scene.add(
    skyLight
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );


sun.position.set(
    30,
    50,
    20
);


scene.add(
    sun
);


/* ======================================================
   KEYBOARD CONTROLS
====================================================== */

const keys = {};


document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        /*
           Jumping is handled here for now.

           player.js provides the grounded
           variable and velocityY.
        */

        if (
            event.code === "Space" &&
            grounded
        ) {

            velocityY = 8;

            grounded = false;

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


/* ======================================================
   MOUSE LOOK
====================================================== */

let yaw = 0;

let pitch = 0;

let mouseLocked = false;


document.addEventListener(
    "mousemove",
    event => {

        if (!mouseLocked) {
            return;
        }


        yaw -=
            event.movementX *
            0.002;


        pitch -=
            event.movementY *
            0.002;


        pitch =
            Math.max(
                -Math.PI / 2 + 0.05,

                Math.min(
                    Math.PI / 2 - 0.05,
                    pitch
                )
            );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            yaw;


        camera.rotation.x =
            pitch;

    }
);


/* ======================================================
   POINTER LOCK
====================================================== */

function lockMouse() {

    document.body.requestPointerLock();

}


document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement
            === document.body;

    }
);


/* ======================================================
   START BUTTON
====================================================== */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("startScreen")
                .style.display = "none";


            lockMouse();

        }
    );


/* ======================================================
   WINDOW RESIZE
====================================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* ======================================================
   GENERATE WORLD
====================================================== */

generateWorld();


/* ======================================================
   START PLAYER
====================================================== */

camera.position.set(
    12.5,
    terrainHeight(12, 12)
        + EYE_HEIGHT
        + 0.1,
    12.5
);


/* ======================================================
   GAME CLOCK
====================================================== */

const clock =
    new THREE.Clock();


/* ======================================================
   GAME LOOP
====================================================== */

function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    /*
       Player movement and
       collision are handled
       inside player.js.
    */

    updatePlayer(
        delta
    );


    /*
       Render the world.
    */

    renderer.render(
        scene,
        camera
    );

}


/* ======================================================
   START GAME LOOP
====================================================== */

gameLoop();