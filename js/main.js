/*
=========================================================
BLOCKWORLD
Main Game
=========================================================
*/


/* ======================================================
   CANVAS
   ====================================================== */

const canvas =
    document.getElementById(
        "game"
    );


/* ======================================================
   SCENE
   ====================================================== */

const scene =
    new THREE.Scene();

scene.background =
    new THREE.Color(
        0x87ceeb
    );

scene.fog =
    new THREE.Fog(
        0x87ceeb,
        20,
        80
    );


/* ======================================================
   CAMERA
   ====================================================== */

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        200
    );


/* ======================================================
   RENDERER
   ====================================================== */

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
    1
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
    function() {

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
   PLAYER START POSITION
   ====================================================== */

camera.position.set(
    12.5,
    terrainHeight(12,12)
      + 1
      + EYE_HEIGHT
      + 0.1,
    12.5
);


/* ======================================================
   DAY / NIGHT
   ====================================================== */

initDayNight();


/* ======================================================
   CLOUDS
   ====================================================== */

initClouds();

/* ======================================================
   CLOCK
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


    /* ================================================
       PLAYER
       ================================================ */

    updatePlayer(
        delta
    );


    /* ================================================
       CHUNKS
       ================================================ */

    processChunkLoadQueue();


    /* ================================================
       MINING
       ================================================ */

    updateMining(
        delta
    );


    /* ================================================
       DAY / NIGHT
       ================================================ */

    updateDayNight(
        delta
    );


    /* ================================================
       CLOUDS
       ================================================ */

    updateClouds(
        delta
    );


    /* ================================================
       RENDER
       ================================================ */

    renderer.render(
        scene,
        camera
    );
}


/* ======================================================
   START
   ====================================================== */

gameLoop();