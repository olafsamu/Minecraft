/*
=========================================================
BLOCKWORLD
Main Game File

Handles:
- Three.js setup
- Lighting
- Window resizing
- World startup
- Player startup
- Game loop

Other systems:
- blocks.js
- world.js
- player.js
- controls.js
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


    updatePlayer(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


/* ======================================================
   START GAME
====================================================== */

gameLoop();