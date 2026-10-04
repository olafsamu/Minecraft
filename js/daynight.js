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

let dayTime = 0.25;

const DAY_LENGTH = 600;


/* ======================================================
   SKY COLORS
   ====================================================== */

const DAY_SKY =
    new THREE.Color(
        0x87ceeb
    );

const NIGHT_SKY =
    new THREE.Color(
        0x071225
    );

const SUNSET_SKY =
    new THREE.Color(
        0xd98b65
    );


const DAY_FOG =
    new THREE.Color(
        0x87ceeb
    );

const NIGHT_FOG =
    new THREE.Color(
        0x071225
    );

const SUNSET_FOG =
    new THREE.Color(
        0xd98b65
    );


/* ======================================================
   OBJECTS
   ====================================================== */

let sunMesh = null;
let moonMesh = null;
let moonGlow = null;
let moonLight = null;

let skyDome = null;
let stars = null;

let dayNightInitialized = false;


/* ======================================================
   CREATE SUN TEXTURE
   ====================================================== */

function createSunTexture() {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 128;
    canvas.height = 128;

    const ctx =
        canvas.getContext(
            "2d"
        );

    const gradient =
        ctx.createRadialGradient(
            64,
            64,
            5,
            64,
            64,
            60
        );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
        0.35,
        "rgba(255,245,190,1)"
    );

    gradient.addColorStop(
        0.7,
        "rgba(255,220,100,0.9)"
    );

    gradient.addColorStop(
        1,
        "rgba(255,200,50,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        128,
        128
    );

    return new THREE.CanvasTexture(
        canvas
    );
}


/* ======================================================
   CREATE MOON TEXTURE
   ====================================================== */

function createMoonTexture() {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 128;
    canvas.height = 128;

    const ctx =
        canvas.getContext(
            "2d"
        );

    const gradient =
        ctx.createRadialGradient(
            64,
            64,
            4,
            64,
            64,
            52
        );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,1)"
    );

    gradient.addColorStop(
        0.55,
        "rgba(240,245,255,1)"
    );

    gradient.addColorStop(
        0.82,
        "rgba(210,220,240,0.95)"
    );

    gradient.addColorStop(
        1,
        "rgba(180,200,230,0)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        128,
        128
    );

    return new THREE.CanvasTexture(
        canvas
    );
}


/* ======================================================
   CREATE SKY DOME
   ====================================================== */

function createSkyDome() {

    const geometry =
        new THREE.SphereGeometry(
            150,
            32,
            24
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: DAY_SKY,

            side:
                THREE.BackSide,

            /*
            The sky should always be behind
            the actual world.
            */
            depthTest: false,
            depthWrite: false,

            fog: false
        });

    skyDome =
        new THREE.Mesh(
            geometry,
            material
        );

    skyDome.renderOrder =
        -100;

    scene.add(
        skyDome
    );
}


/* ======================================================
   CREATE SUN
   ====================================================== */

function createSun() {

    const texture =
        createSunTexture();

    const material =
        new THREE.SpriteMaterial({
            map: texture,

            transparent: true,

            opacity: 1,

            /*
            Terrain blocks the sun.
            */
            depthTest: true,
            depthWrite: false,

            fog: false,

            blending:
                THREE.AdditiveBlending
        });

    sunMesh =
        new THREE.Sprite(
            material
        );

    sunMesh.scale.set(
        14,
        14,
        1
    );

    sunMesh.renderOrder =
        50;

    scene.add(
        sunMesh
    );
}


/* ======================================================
   CREATE MOON
   ====================================================== */

function createMoon() {

    const texture =
        createMoonTexture();


    const material =
        new THREE.SpriteMaterial({
            map: texture,

            transparent: true,

            opacity: 1,

            /*
            IMPORTANT:
            Terrain blocks the moon.
            */
            depthTest: true,
            depthWrite: false,

            fog: false
        });


    moonMesh =
        new THREE.Sprite(
            material
        );

    moonMesh.scale.set(
        12,
        12,
        1
    );

    moonMesh.renderOrder =
        51;

    scene.add(
        moonMesh
    );


    /* ==================================================
       MOON GLOW
       ================================================== */

    const glowMaterial =
        new THREE.SpriteMaterial({
            map: texture,

            transparent: true,

            opacity: 0.22,

            /*
            The glow must ALSO be blocked
            by terrain.
            */
            depthTest: true,
            depthWrite: false,

            fog: false,

            blending:
                THREE.AdditiveBlending
        });


    moonGlow =
        new THREE.Sprite(
            glowMaterial
        );

    moonGlow.scale.set(
        18,
        18,
        1
    );

    moonGlow.renderOrder =
        49;

    scene.add(
        moonGlow
    );
}


/* ======================================================
   CREATE MOON LIGHT
   ====================================================== */

function createMoonLight() {

    moonLight =
        new THREE.DirectionalLight(
            0x9fb8ff,
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

    const starCount =
        700;


    const positions =
        new Float32Array(
            starCount * 3
        );


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.random() *
            Math.PI;


        const radius =
            120;


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


        positions[i * 3] =
            x;

        positions[i * 3 + 1] =
            y;

        positions[i * 3 + 2] =
            z;
    }


    const geometry =
        new THREE.BufferGeometry();


    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );


    const material =
        new THREE.PointsMaterial({

            color:
                0xffffff,

            size:
                1.4,

            sizeAttenuation:
                false,

            transparent:
                true,

            opacity:
                0,

            /*
            VERY IMPORTANT:
            Ground must block stars.
            */
            depthTest:
                true,

            depthWrite:
                false,

            fog:
                false
        });


    stars =
        new THREE.Points(
            geometry,
            material
        );


    stars.renderOrder =
        40;


    scene.add(
        stars
    );
}


/* ======================================================
   INITIALIZE DAY / NIGHT
   ====================================================== */

function initDayNight() {

    /*
    Prevent accidental double initialization.
    */
    if (
        dayNightInitialized
    ) {
        return;
    }


    createSkyDome();

    createSun();

    createMoon();

    createMoonLight();

    createStars();


    dayNightInitialized =
        true;
}


/* ======================================================
   UPDATE DAY / NIGHT
   ====================================================== */

function updateDayNight(
    delta
) {

    /*
    Do nothing until main.js has initialized
    the day/night objects.
    */
    if (
        !dayNightInitialized
    ) {
        return;
    }


    /* ==================================================
       ADVANCE TIME
       ================================================== */

    dayTime +=
        delta /
        DAY_LENGTH;


    if (
        dayTime >= 1
    ) {
        dayTime -= 1;
    }


    /* ==================================================
       SUN ANGLE
       ================================================== */

    const angle =
        dayTime *
        Math.PI *
        2;


    const distance =
        100;


    const sunX =
        Math.cos(angle) *
        distance;


    const sunY =
        Math.sin(angle) *
        distance;


    const sunZ =
        0;


    /* ==================================================
       SUN POSITION
       ================================================== */

    sunMesh.position.set(
        camera.position.x + sunX,
        camera.position.y + sunY,
        camera.position.z + sunZ
    );


    /* ==================================================
       MOON POSITION
       ================================================== */

    moonMesh.position.set(
        camera.position.x - sunX,
        camera.position.y - sunY,
        camera.position.z - sunZ
    );


    moonGlow.position.copy(
        moonMesh.position
    );


    /* ==================================================
       SUN AMOUNT
       ================================================== */

    const sunAmount =
        Math.max(
            0,
            Math.min(
                1,
                sunY / 60
            )
        );


    /* ==================================================
       MOON AMOUNT
       ================================================== */

    const moonAmount =
        Math.max(
            0,
            Math.min(
                1,
                -sunY / 60
            )
        );


    /* ==================================================
       HORIZON
       ================================================== */

    const horizonAmount =
        Math.max(
            0,
            1 -
            Math.abs(sunY) /
            30
        );


    /* ==================================================
       SUN VISIBILITY
       ================================================== */

    sunMesh.material.opacity =
        Math.max(
            0.15,
            sunAmount
        );


    /* ==================================================
       MOON VISIBILITY
       ================================================== */

    moonMesh.material.opacity =
        moonAmount;


    moonGlow.material.opacity =
        0.22 *
        moonAmount;


    /* ==================================================
       MOON LIGHT
       ================================================== */

    moonLight.intensity =
        0.25 *
        moonAmount;


    moonLight.position.copy(
        moonMesh.position
    );


    /* ==================================================
       SKY COLOR
       ================================================== */

    let skyColor;


    if (
        sunY > 20
    ) {

        skyColor =
            DAY_SKY.clone();

    } else if (
        sunY > -20
    ) {

        skyColor =
            DAY_SKY.clone();

        skyColor.lerp(
            SUNSET_SKY,
            horizonAmount
        );

    } else {

        skyColor =
            NIGHT_SKY.clone();
    }


    skyDome.material.color.copy(
        skyColor
    );


    scene.background.copy(
        skyColor
    );


    /* ==================================================
       FOG COLOR
       ================================================== */

    let fogColor;


    if (
        sunY > 20
    ) {

        fogColor =
            DAY_FOG.clone();

    } else if (
        sunY > -20
    ) {

        fogColor =
            DAY_FOG.clone();

        fogColor.lerp(
            SUNSET_FOG,
            horizonAmount
        );

    } else {

        fogColor =
            NIGHT_FOG.clone();
    }


    scene.fog.color.copy(
        fogColor
    );


    /* ==================================================
       SUN LIGHT
       ================================================== */

    if (
        typeof sun !==
        "undefined"
    ) {

        sun.position.set(
            sunX,
            sunY,
            sunZ
        );


        sun.intensity =
            0.25 +
            1.5 *
            sunAmount;
    }


    /* ==================================================
       SKY LIGHT
       ================================================== */

    if (
        typeof skyLight !==
        "undefined"
    ) {

        skyLight.intensity =
            0.35 +
            1.45 *
            sunAmount;


        skyLight.color.set(
            0xffffff
        );


        skyLight.groundColor.set(
            0x557755
        );
    }


    /* ==================================================
       STARS
       ================================================== */

    stars.material.opacity =
        Math.max(
            0,
            Math.min(
                1,
                moonAmount * 1.2
            )
        );


    /* ==================================================
       FOLLOW CAMERA
       ================================================== */

    skyDome.position.copy(
        camera.position
    );


    stars.position.copy(
        camera.position
    );
}