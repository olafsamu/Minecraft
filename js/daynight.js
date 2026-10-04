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


/*
   600 seconds = 10 minutes.
*/

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
        document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 128;


    const ctx =
        canvas.getContext("2d");


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
        document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 128;


    const ctx =
        canvas.getContext("2d");


    const gradient =
        ctx.createRadialGradient(
            64,
            64,
            10,
            64,
            64,
            64
        );


    gradient.addColorStop(
        0,
        "#ffffff"
    );

    gradient.addColorStop(
        0.35,
        "#f5f7ff"
    );

    gradient.addColorStop(
        0.65,
        "rgba(210,225,255,0.6)"
    );

    gradient.addColorStop(
        1,
        "rgba(150,190,255,0)"
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
       Small moon craters.
    */

    ctx.fillStyle =
        "rgba(170,180,200,0.3)";


    ctx.beginPath();
    ctx.arc(
        45,
        48,
        8,
        0,
        Math.PI * 2
    );
    ctx.fill();


    ctx.beginPath();
    ctx.arc(
        78,
        72,
        6,
        0,
        Math.PI * 2
    );
    ctx.fill();


    ctx.beginPath();
    ctx.arc(
        62,
        35,
        4,
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

            depthTest: false,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    sunMesh =
        new THREE.Sprite(
            material
        );


    /*
       Size of the sun.
    */

    sunMesh.scale.set(
        18,
        18,
        1
    );


    sunMesh.renderOrder =
        1000;


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

            depthTest: false,

            depthWrite: false

        });


    moonMesh =
        new THREE.Sprite(
            material
        );


    moonMesh.scale.set(
        14,
        14,
        1
    );


    moonMesh.renderOrder =
        1000;


    scene.add(
        moonMesh
    );


    /*
       Separate soft moon glow.
    */

    const glowMaterial =
        new THREE.SpriteMaterial({

            map: texture,

            transparent: true,

            opacity: 0.15,

            depthTest: false,

            depthWrite: false,

            blending:
                THREE.AdditiveBlending

        });


    moonGlow =
        new THREE.Sprite(
            glowMaterial
        );


    moonGlow.scale.set(
        24,
        24,
        1
    );


    moonGlow.renderOrder =
        999;


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

    const starCount =
        300;


    const positions = [];


    for (
        let i = 0;
        i < starCount;
        i++
    ) {

        const radius = 145;


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

            color: 0xffffff,

            size: 1.4,

            sizeAttenuation: false,

            transparent: true,

            opacity: 0,

            /*
               Stars respect terrain and blocks.
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


    stars.renderOrder =
        0;


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

function updateDayNight(delta) {

    if (!skyDome) {

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
        Math.cos(angle) * 110;

    const sunY =
        Math.sin(angle) * 110;

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
       MOON
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
        (sunY + 15) / 125;


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


    const nightAmount =
        1 - dayAmount;


    /* ==================================================
       SKY
    ================================================== */

    skyDome.material.color
        .copy(NIGHT_SKY)
        .lerp(
            DAY_SKY,
            dayAmount
        );


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
        0.15 +
        dayAmount * 1.55;


    /* ==================================================
       AMBIENT LIGHT
    ================================================== */

    skyLight.intensity =
        0.35 +
        dayAmount * 1.45;


    /* ==================================================
       MOONLIGHT
    ================================================== */

    moonLight.intensity =
        nightAmount * 0.45;


    /* ==================================================
       SUN VISIBILITY
    ================================================== */

    const sunVisibility =
        Math.max(
            0,
            Math.min(
                1,
                sunY / 25
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
                -sunY / 25
            )
        );


    moonMesh.material.opacity =
        moonVisibility;


    moonGlow.material.opacity =
        moonVisibility * 0.2;


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