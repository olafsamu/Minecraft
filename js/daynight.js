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
        0x020611
    );


const DAY_FOG =
    new THREE.Color(
        0x87ceeb
    );


const NIGHT_FOG =
    new THREE.Color(
        0x020611
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
            8,

            64,
            64,
            64

        );


    gradient.addColorStop(
        0,
        "#ffffff"
    );


    gradient.addColorStop(
        0.25,
        "#fffbd0"
    );


    gradient.addColorStop(
        0.55,
        "#fff36a"
    );


    gradient.addColorStop(
        0.8,
        "rgba(255,220,50,0.35)"
    );


    gradient.addColorStop(
        1,
        "rgba(255,180,0,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,
        0,
        128,
        128

    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

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


    /*
       MUCH stronger moon disc.

       The previous gradient faded too aggressively
       near the edges, making the moon difficult to see.
    */

    const gradient =
        ctx.createRadialGradient(

            64,
            64,
            5,

            64,
            64,
            58

        );


    gradient.addColorStop(
        0,
        "#ffffff"
    );


    gradient.addColorStop(
        0.55,
        "#ffffff"
    );


    gradient.addColorStop(
        0.78,
        "#edf3ff"
    );


    gradient.addColorStop(
        0.92,
        "rgba(220,230,255,0.8)"
    );


    gradient.addColorStop(
        1,
        "rgba(180,205,255,0)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(

        0,
        0,
        128,
        128

    );


    /*
       Moon craters.

       Much more visible than before.
    */

    ctx.fillStyle =
        "rgba(155,165,185,0.38)";


    ctx.beginPath();

    ctx.arc(
        43,
        47,
        9,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        78,
        71,
        7,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        60,
        35,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        82,
        42,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.beginPath();

    ctx.arc(
        39,
        78,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

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

            color:
                DAY_SKY,

            side:
                THREE.BackSide,

            depthWrite:
                false,

            depthTest:
                false

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

            map:
                texture,

            transparent:
                true,

            opacity:
                1,

            /*
               Keep the sun visible as a sky object.

               This prevents terrain depth from making
               the sprite mysteriously disappear.
            */

            depthTest:
                false,

            depthWrite:
                false,

            blending:
                THREE.AdditiveBlending

        });


    sunMesh =
        new THREE.Sprite(
            material
        );


    sunMesh.scale.set(

        18,

        18,

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


    /*
       Main moon.
    */

    const material =
        new THREE.SpriteMaterial({

            map:
                texture,

            transparent:
                true,

            opacity:
                1,

            /*
               IMPORTANT FIX:

               Do not allow terrain depth testing to
               hide the moon.

               It is a sky object, not a physical mesh.
            */

            depthTest:
                false,

            depthWrite:
                false,

            blending:
                THREE.NormalBlending

        });


    moonMesh =
        new THREE.Sprite(
            material
        );


    /*
       Larger than before.
    */

    moonMesh.scale.set(

        18,

        18,

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

            map:
                texture,

            transparent:
                true,

            opacity:
                0.22,

            depthTest:
                false,

            depthWrite:
                false,

            blending:
                THREE.AdditiveBlending

        });


    moonGlow =
        new THREE.Sprite(
            glowMaterial
        );


    moonGlow.scale.set(

        30,

        30,

        1

    );


    moonGlow.renderOrder =
        50;


    scene.add(
        moonGlow
    );


    /* ==================================================
       MOON LIGHT
    ================================================== */

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

    const starCount =
        300;


    const positions = [];


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const radius =
            145;


        const theta =
            Math.random() *
            Math.PI *
            2;


        const phi =
            Math.acos(

                2 *
                Math.random() -
                1

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

            depthTest:
                false,

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
   INITIALIZE
====================================================== */

function initializeDayNight() {

    createSkyDome();

    createSun();

    createMoon();

    createStars();

}


/* ======================================================
   UPDATE
====================================================== */

function updateDayNight(
    delta
) {

    if (!skyDome) {

        initializeDayNight();

    }


    /* ==================================================
       TIME
    ================================================== */

    dayTime +=
        delta /
        DAY_LENGTH;


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
       SUN POSITION
    ================================================== */

    const sunX =
        Math.cos(angle) *
        110;


    const sunY =
        Math.sin(angle) *
        110;


    /*
       Keep the celestial objects far enough away
       that their perspective is effectively constant.
    */

    const sunZ =
        -120;


    sunMesh.position.set(

        camera.position.x +
        sunX,

        camera.position.y +
        sunY,

        camera.position.z +
        sunZ

    );


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
        -120;


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


    moonLight.position.set(

        camera.position.x +
        moonX,

        camera.position.y +
        moonY,

        camera.position.z +
        moonZ

    );


    /* ==================================================
       DAYLIGHT
    ================================================== */

    let dayAmount =
        (sunY + 15) /
        125;


    dayAmount =
        Math.max(

            0,

            Math.min(

                1,

                dayAmount

            )

        );


    /*
       Smooth day/night transition.
    */

    dayAmount =
        dayAmount *
        dayAmount *
        (3 - 2 * dayAmount);


    const nightAmount =
        1 -
        dayAmount;


    /* ==================================================
       SKY
    ================================================== */

    skyDome.material.color

        .copy(
            NIGHT_SKY
        )

        .lerp(

            DAY_SKY,

            dayAmount

        );


    scene.background

        .copy(
            NIGHT_SKY
        )

        .lerp(

            DAY_SKY,

            dayAmount

        );


    /* ==================================================
       FOG
    ================================================== */

    scene.fog.color

        .copy(
            NIGHT_FOG
        )

        .lerp(

            DAY_FOG,

            dayAmount

        );


    /* ==================================================
       SUNLIGHT
    ================================================== */

    sun.intensity =
        0.15 +
        dayAmount *
        1.55;


    /* ==================================================
       AMBIENT LIGHT
    ================================================== */

    skyLight.intensity =
        0.35 +
        dayAmount *
        1.45;


    /* ==================================================
       MOONLIGHT
    ================================================== */

    moonLight.intensity =
        nightAmount *
        0.55;


    /* ==================================================
       SUN VISIBILITY
    ================================================== */

    const sunVisibility =
        Math.max(

            0,

            Math.min(

                1,

                sunY /
                25

            )

        );


    sunMesh.material.opacity =
        sunVisibility;


    /* ==================================================
       MOON VISIBILITY
    ================================================== */

    const moonVisibility =
        Math.max(

            0,

            Math.min(

                1,

                moonY /
                25

            )

        );


    /*
       Give the moon a minimum brightness while
       it is above the horizon.
    */

    moonMesh.material.opacity =

        moonVisibility > 0

            ? Math.max(
                0.72,
                moonVisibility
            )

            : 0;


    moonGlow.material.opacity =

        moonVisibility > 0

            ? 0.18 +
              moonVisibility *
              0.15

            : 0;


    /* ==================================================
       STARS
    ================================================== */

    stars.material.opacity =
        nightAmount;


    /* ==================================================
       MOVE SKY
    ================================================== */

    skyDome.position.copy(
        camera.position
    );


    stars.position.copy(
        camera.position
    );

}