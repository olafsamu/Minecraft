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

/*
   One complete day + night cycle.

   600 seconds = 10 minutes
*/

const DAY_LENGTH = 600;


/* ======================================================
   COLORS
====================================================== */

const DAY_SKY =
    new THREE.Color(0x87ceeb);

const NIGHT_SKY =
    new THREE.Color(0x07111f);


const DAY_FOG =
    new THREE.Color(0x87ceeb);

const NIGHT_FOG =
    new THREE.Color(0x07111f);


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
            5,
            32,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xffffcc
        });


    sunMesh =
        new THREE.Mesh(
            geometry,
            material
        );


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
            3.5,
            32,
            32
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xdde7ff
        });


    moonMesh =
        new THREE.Mesh(
            geometry,
            material
        );


    scene.add(
        moonMesh
    );


    /*
       Soft glow around the moon.
    */

    const glowGeometry =
        new THREE.SphereGeometry(
            5,
            32,
            32
        );


    const glowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xaec8ff,
            transparent: true,
            opacity: 0.12,
            depthWrite: false
        });


    moonGlow =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );


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

    const starCount = 350;

    const positions = [];


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        /*
           Put stars far around the player.
        */

        const x =
            (Math.random() - 0.5) * 240;

        const y =
            (Math.random() - 0.5) * 160;

        const z =
            (Math.random() - 0.5) * 240;


        /*
           Avoid putting stars
           extremely close to the camera.
        */

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
            size: 1.2,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            fog: false
        });


    stars =
        new THREE.Points(
            geometry,
            material
        );


    scene.add(
        stars
    );

}


/* ======================================================
   INITIALIZE SKY
====================================================== */

function initializeDayNight() {

    createSun();

    createMoon();

    createStars();

}


/* ======================================================
   UPDATE DAY / NIGHT
====================================================== */

function updateDayNight(delta) {

    /*
       Create everything once.
    */

    if (!sunMesh) {

        initializeDayNight();

    }


    /*
       Move time forward.
    */

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
       Convert time into an angle.

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
        Math.cos(angle) * 70;

    const sunY =
        Math.sin(angle) * 70;

    const sunZ =
        -50;


    sunMesh.position.set(
        camera.position.x + sunX,
        camera.position.y + sunY,
        camera.position.z + sunZ
    );


    /*
       Directional sunlight follows
       the visible sun.
    */

    sun.position.set(
        camera.position.x + sunX,
        camera.position.y + sunY,
        camera.position.z + sunZ
    );


    /* ==================================================
       MOON POSITION
       ================================================== */

    const moonX =
        -sunX;

    const moonY =
        -sunY;

    const moonZ =
        -50;


    moonMesh.position.set(
        camera.position.x + moonX,
        camera.position.y + moonY,
        camera.position.z + moonZ
    );


    moonGlow.position.copy(
        moonMesh.position
    );


    /*
       Moonlight points from
       the moon's position.
    */

    moonLight.position.set(
        camera.position.x + moonX,
        camera.position.y + moonY,
        camera.position.z + moonZ
    );


    /* ==================================================
       DAYLIGHT AMOUNT
       ================================================== */

    let dayAmount =
        (sunY + 10) / 70;


    dayAmount =
        Math.max(
            0,
            Math.min(
                1,
                dayAmount
            )
        );


    /*
       Smooth transition.
    */

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
        dayAmount * 1.3;


    /* ==================================================
       AMBIENT LIGHT
       ================================================== */

    skyLight.intensity =
        0.4 +
        dayAmount * 1.4;


    /* ==================================================
       MOONLIGHT
       ================================================== */

    const nightAmount =
        1 - dayAmount;


    moonLight.intensity =
        nightAmount * 0.35;


    /* ==================================================
       SUN VISIBILITY
       ================================================== */

    sunMesh.material.opacity =
        Math.max(
            0,
            Math.min(
                1,
                dayAmount * 2
            )
        );


    sunMesh.material.transparent =
        true;


    /* ==================================================
       MOON VISIBILITY
       ================================================== */

    moonMesh.material.opacity =
        Math.max(
            0,
            Math.min(
                1,
                nightAmount * 2
            )
        );


    moonMesh.material.transparent =
        true;


    /* ==================================================
       MOON GLOW
       ================================================== */

    moonGlow.material.opacity =
        nightAmount * 0.18;


    /* ==================================================
       STARS
       ================================================== */

    /*
       Stars become visible at night.
    */

    stars.material.opacity =
        nightAmount;


    /*
       Keep stars surrounding the player
       so they look like part of the sky.
    */

    stars.position.copy(
        camera.position
    );

}