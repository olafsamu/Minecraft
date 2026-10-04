/*
=========================================================
BLOCKWORLD
Day / Night Cycle
Sun + Moon + Stars
=========================================================
*/

let dayTime = 0.25;


/* ======================================================
   SETTINGS
====================================================== */

const DAY_LENGTH = 600;


/* ======================================================
   COLORS
====================================================== */

const DAY_SKY =
    new THREE.Color(0x87ceeb);

const NIGHT_SKY =
    new THREE.Color(0x020611);

const DAY_FOG =
    new THREE.Color(0x87ceeb);

const NIGHT_FOG =
    new THREE.Color(0x020611);


/* ======================================================
   CELESTIAL OBJECTS
====================================================== */

let sunMesh = null;
let moonMesh = null;
let moonGlow = null;
let stars = null;
let moonLight = null;


/* ======================================================
   CREATE SUN
====================================================== */

function createSun() {

    const geometry =
        new THREE.SphereGeometry(
            7,
            32,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffffaa,

            transparent: true,

            opacity: 1,

            depthTest: false,

            depthWrite: false

        });


    sunMesh =
        new THREE.Mesh(
            geometry,
            material
        );


    /*
       Make sure nothing renders
       in front of the sun.
    */

    sunMesh.renderOrder = 1000;


    scene.add(
        sunMesh
    );

}


/* ======================================================
   CREATE MOON
====================================================== */

function createMoon() {

    const geometry =
        new THREE.SphereGeometry(
            5,
            32,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            transparent: true,

            opacity: 1,

            depthTest: false,

            depthWrite: false

        });


    moonMesh =
        new THREE.Mesh(
            geometry,
            material
        );


    moonMesh.renderOrder = 1000;


    scene.add(
        moonMesh
    );


    /*
       Moon glow.
    */

    const glowGeometry =
        new THREE.SphereGeometry(
            7,
            32,
            32
        );


    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xcfe2ff,

            transparent: true,

            opacity: 0.22,

            depthTest: false,

            depthWrite: false,

            side: THREE.DoubleSide

        });


    moonGlow =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );


    moonGlow.renderOrder = 999;


    scene.add(
        moonGlow
    );


    /*
       Moonlight.
    */

    moonLight =
        new THREE.DirectionalLight(
            0x9bbcff,
            0
        );


    scene.add(
        moonLight
    );

}


/* ======================================================
   CREATE STARS
====================================================== */

function createStars() {

    const starCount = 500;

    const positions = [];


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const x =
            (Math.random() - 0.5) * 240;

        const y =
            (Math.random() - 0.5) * 160;

        const z =
            (Math.random() - 0.5) * 240;


        if (
            Math.sqrt(
                x * x +
                y * y +
                z * z
            ) < 70
        ) {

            i--;

            continue;

        }


        positions.push(
            x,
            y,
            z
        );

    }


    const geometry =
        new THREE.BufferGeometry();


    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({

            color: 0xffffff,

            size: 1.5,

            sizeAttenuation: false,

            transparent: true,

            opacity: 0,

            depthTest: false,

            depthWrite: false,

            fog: false

        });


    stars =
        new THREE.Points(
            geometry,
            material
        );


    stars.renderOrder = 998;


    scene.add(
        stars
    );

}


/* ======================================================
   INITIALIZE
====================================================== */

function initializeDayNight() {

    createSun();

    createMoon();

    createStars();

}


/* ======================================================
   UPDATE
====================================================== */

function updateDayNight(delta) {

    if (!sunMesh) {

        initializeDayNight();

    }


    /* ==================================================
       TIME
       ================================================== */

    dayTime +=
        delta / DAY_LENGTH;


    if (
        dayTime >= 1
    ) {

        dayTime -= 1;

    }


    const angle =
        dayTime *
        Math.PI *
        2;


    /* ==================================================
       SUN
       ================================================== */

    const sunX =
        Math.cos(angle) * 100;

    const sunY =
        Math.sin(angle) * 100;

    const sunZ =
        -80;


    sunMesh.position.set(

        camera.position.x + sunX,

        camera.position.y + sunY,

        camera.position.z + sunZ

    );


    sun.position.set(

        camera.position.x + sunX,

        camera.position.y + sunY,

        camera.position.z + sunZ

    );


    /* ==================================================
       MOON
       ================================================== */

    const moonX =
        -sunX;

    const moonY =
        -sunY;

    const moonZ =
        -80;


    moonMesh.position.set(

        camera.position.x + moonX,

        camera.position.y + moonY,

        camera.position.z + moonZ

    );


    moonGlow.position.copy(
        moonMesh.position
    );


    moonLight.position.set(

        camera.position.x + moonX,

        camera.position.y + moonY,

        camera.position.z + moonZ

    );


    /* ==================================================
       DAYLIGHT
       ================================================== */

    let dayAmount =
        (sunY + 15) / 115;


    dayAmount =
        Math.max(
            0,
            Math.min(
                1,
                dayAmount
            )
        );


    dayAmount =
        dayAmount *
        dayAmount *
        (3 - 2 * dayAmount);


    /* ==================================================
       SKY
       ================================================== */

    scene.background
        .copy(NIGHT_SKY)
        .lerp(
            DAY_SKY,
            dayAmount
        );


    /* ==================================================
       FOG
       ================================================== */

    scene.fog.color
        .copy(NIGHT_FOG)
        .lerp(
            DAY_FOG,
            dayAmount
        );


    /* ==================================================
       SUNLIGHT
       ================================================== */

    sun.intensity =
        0.2 +
        dayAmount * 1.5;


    /* ==================================================
       AMBIENT LIGHT
       ================================================== */

    skyLight.intensity =
        0.35 +
        dayAmount * 1.5;


    /* ==================================================
       MOONLIGHT
       ================================================== */

    const nightAmount =
        1 - dayAmount;


    moonLight.intensity =
        nightAmount * 0.5;


    /* ==================================================
       SUN VISIBILITY
       ================================================== */

    sunMesh.material.opacity = 1;


    /* ==================================================
       MOON VISIBILITY
       ================================================== */

    moonMesh.material.opacity =
        Math.max(
            0.15,
            Math.min(
                1,
                nightAmount * 2
            )
        );


    /* ==================================================
       MOON GLOW
       ================================================== */

    moonGlow.material.opacity =
        nightAmount * 0.25;


    /* ==================================================
       STARS
       ================================================== */

    stars.material.opacity =
        nightAmount;


    stars.position.copy(
        camera.position
    );

}