/*
=========================================================
BLOCKWORLD
Day / Night Cycle
=========================================================
*/

let dayTime = 0.25;


/* ======================================================
   SETTINGS
====================================================== */

const DAY_LENGTH = 180;


/* ======================================================
   COLORS
====================================================== */

const DAY_SKY = new THREE.Color(0x87ceeb);
const NIGHT_SKY = new THREE.Color(0x08111f);

const DAY_FOG = new THREE.Color(0x87ceeb);
const NIGHT_FOG = new THREE.Color(0x08111f);


/* ======================================================
   UPDATE DAY / NIGHT
====================================================== */

function updateDayNight(delta) {

    /*
       Move time forward.
    */

    dayTime +=
        delta / DAY_LENGTH;


    /*
       Keep time between 0 and 1.
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


    /*
       Move the sun.
    */

    const sunX =
        Math.cos(angle) * 60;

    const sunY =
        Math.sin(angle) * 60;

    const sunZ =
        20;


    sun.position.set(
        sunX,
        sunY,
        sunZ
    );


    /*
       Calculate daylight amount.
    */

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
       Smooth the transition.
    */

    dayAmount =
        dayAmount *
        dayAmount *
        (3 - 2 * dayAmount);


    /*
       Update sky color.
    */

    scene.background
        .copy(NIGHT_SKY)
        .lerp(
            DAY_SKY,
            dayAmount
        );


    /*
       Update fog color.
    */

    scene.fog.color
        .copy(NIGHT_FOG)
        .lerp(
            DAY_FOG,
            dayAmount
        );


    /*
       Change sunlight brightness.
    */

    sun.intensity =
        0.25 +
        dayAmount * 1.25;


    /*
       Change ambient light.
    */

    skyLight.intensity =
        0.5 +
        dayAmount * 1.3;

}