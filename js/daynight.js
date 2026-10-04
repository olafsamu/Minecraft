/*
=========================================================
BLOCKWORLD
Day / Night Cycle
Sun + Moon + Sky Dome + Stars
=========================================================
*/


/* ======================================================
   TIME
====================================================== */

/*
   One complete day + night cycle.

   600 seconds = 10 minutes.
*/

let dayTime = 0.25;

const DAY_LENGTH = 600;


/* ======================================================
   SKY COLORS
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

let moonLight = null;


/* ======================================================
   SKY OBJECTS
====================================================== */

let skyDome = null;

let stars = null;


/* ======================================================
   CREATE SKY DOME
====================================================== */

function createSkyDome() {

    /*
       Large sphere surrounding the player.

       The camera stays inside the sphere,
       so BackSide makes the inside visible.
    */

    const geometry =
        new THREE.SphereGeometry(
            150,
            48,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({

            color: DAY_SKY,

            side: THREE.BackSide,

            depthWrite: false,

            depthTest: false

        });


    skyDome =
        new THREE.Mesh(
            geometry,
            material
        );


    /*
       Draw the sky before the world.
    */

    skyDome.renderOrder = -100;


    scene.add(
        skyDome
    );

}


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

            /*
               The sun should never disappear
               behind terrain.
            */

            depthTest: false,

            depthWrite: false

        });


    sunMesh =
        new THREE.Mesh(
            geometry,
            material
        );


    sunMesh.renderOrder = 1000;


    scene.add(
        sunMesh
    );

}


/* ======================================================
   CREATE MOON
====================================================== */

function createMoon() {

    /*
       Main moon.
    */

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
       Soft glow surrounding the moon.
    */

    const glowGeometry =
        new THREE.SphereGeometry(
            7.5,
            32,
            32
        );


    const glowMaterial =
        new THREE.MeshBasicMaterial({

            color: 0xcfe2ff,

            transparent: true,

            opacity: 0.25,

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

    /*
       Keep the number of stars reasonable
       for performance.
    */

    const starCount = 350;


    const positions = [];


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        /*
           Random point on a sphere.

           The star field is much larger than
           the playable world.
        */

        const radius = 145;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(
                2 * Math.random() - 1
            );


        const x =
            radius *
            Math.sin(phi) *
            Math.cos(theta);


        const y =
            radius *
            Math.cos(phi);


        const z =
            radius *
            Math.sin(phi) *
            Math.sin(theta);


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

            /*
               THIS IS IMPORTANT.

               Stars now respect the depth buffer,
               so terrain and blocks can hide them.
            */

            depthTest: true,

            depthWrite: false,

            fog: false

        });


    stars =
        new THREE.Points(
            geometry,
            material
        );


    /*
       Keep stars behind the sun and moon.
    */

    stars.renderOrder = 0;


    scene.add(
        stars
    );

}


/* ======================================================
   INITIALIZE
====================================================== */

function initializeDayNight() {

    createSkyDome();

    createSun();

    createMoon();

    createStars();

}


/* ======================================================
   UPDATE DAY / NIGHT
====================================================== */

function updateDayNight(delta) {

    /*
       Create everything the first time
       the system updates.
    */

    if (!skyDome) {

        initializeDayNight();

    }


    /* ==================================================
       ADVANCE TIME
       ================================================== */

    dayTime +=
        delta / DAY_LENGTH;


    /*
       Loop back to sunrise.
    */

    if (
        dayTime >= 1
    ) {

        dayTime -= 1;

    }


    /*
       Convert time to an angle.

       0.00 = sunrise
       0.25 = noon
       0.50 = sunset
       0.75 = midnight
    */

    const angle =
        dayTime *
        Math.PI *
        2;


    /* ==================================================
       SUN POSITION
       ================================================== */

    const sunX =
        Math.cos(angle) * 100;

    const sunY =
        Math.sin(angle) * 100;

    const sunZ =
        -80;


    sunMesh.position.set(

        camera.position.x +
        sunX,

        camera.position.y +
        sunY,

        camera.position.z +
        sunZ

    );


    /*
       Directional light follows the sun.
    */

    sun.position.set(

        camera.position.x +
        sunX,

        camera.position.y +
        sunY,

        camera.position.z +
        sunZ

    );


    /* ==================================================
       MOON POSITION
       ================================================== */

    const moonX =
        -sunX;

    const moonY =
        -sunY;

    const moonZ =
        -80;


    moonMesh.position.set(

        camera.position.x +
        moonX,

        camera.position.y +
        moonY,

        camera.position.z +
        moonZ

    );


    moonGlow.position.copy(
        moonMesh.position
    );


    /*
       Moonlight follows the moon.
    */

    moonLight.position.set(

        camera.position.x +
        moonX,

        camera.position.y +
        moonY,

        camera.position.z +
        moonZ

    );


    /* ==================================================
       SKY LIGHT LEVEL
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


    /*
       Smooth transition between day and night.
    */

    dayAmount =
        dayAmount *
        dayAmount *
        (3 - 2 * dayAmount);


    const nightAmount =
        1 - dayAmount;


    /* ==================================================
       SKY DOME COLOR
       ================================================== */

    skyDome.material.color
        .copy(NIGHT_SKY)
        .lerp(
            DAY_SKY,
            dayAmount
        );


    /* ==================================================
       SCENE BACKGROUND
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

    moonLight.intensity =
        nightAmount * 0.5;


    /* ==================================================
       SUN
       ================================================== */

    /*
       Always completely visible when above
       the horizon.
    */

    sunMesh.material.opacity =
        Math.max(
            0,
            Math.min(
                1,
                dayAmount * 2
            )
        );


    /* ==================================================
       MOON
       ================================================== */

    moonMesh.material.opacity =
        Math.max(
            0,
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


    /*
       Move the sky dome and stars with the player.

       This makes the sky feel infinitely far away.
    */

    skyDome.position.copy(
        camera.position
    );


    stars.position.copy(
        camera.position
    );

}