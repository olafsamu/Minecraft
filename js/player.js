const PLAYER_HEIGHT = 2;
const EYE_HEIGHT = 1.7;

let velocityY = 0;
let grounded = false;


/* ======================================================
   CHECK IF A BLOCK EXISTS
====================================================== */

function blockExists(x, y, z) {

    return world.has(
        blockKey(x, y, z)
    );

}


/* ======================================================
   CHECK PLAYER POSITION
====================================================== */

function canStandAt(x, z) {

    /*
       Find the block directly underneath
       the player's feet.
    */

    const blockX =
        Math.floor(x);

    const blockZ =
        Math.floor(z);

    const groundY =
        terrainHeight(
            blockX,
            blockZ
        );

    return groundY + 1;


}


/* ======================================================
   PLAYER MOVEMENT
====================================================== */

function updatePlayer(delta) {

    const speed = 5;


    /* ==================================================
       CAMERA DIRECTION
    ================================================== */

    const forward =
        new THREE.Vector3();

    camera.getWorldDirection(
        forward
    );

    forward.y = 0;

    if (forward.length() > 0) {
        forward.normalize();
    }


    const right =
        new THREE.Vector3(
            forward.z,
            0,
            -forward.x
        );


    /* ==================================================
       MOVEMENT INPUT
    ================================================== */

    const movement =
        new THREE.Vector3();


    if (keys["KeyW"]) {
        movement.add(forward);
    }

    if (keys["KeyS"]) {
        movement.sub(forward);
    }

    if (keys["KeyA"]) {
        movement.sub(right);
    }

    if (keys["KeyD"]) {
        movement.add(right);
    }


    /* ==================================================
       HORIZONTAL MOVEMENT
    ================================================== */

    if (movement.length() > 0) {

        movement.normalize();


        const moveX =
            movement.x *
            speed *
            delta;

        const moveZ =
            movement.z *
            speed *
            delta;


        /*
           Current position.
        */

        let newX =
            camera.position.x;

        let newZ =
            camera.position.z;


        /*
           Try X movement.
        */

        const testX =
            camera.position.x +
            moveX;


        /*
           Keep the player inside
           the generated world.
        */

        if (
            testX >= 0.35 &&
            testX <= 23.65
        ) {

            newX = testX;

        }


        /*
           Try Z movement.
        */

        const testZ =
            camera.position.z +
            moveZ;


        if (
            testZ >= 0.35 &&
            testZ <= 23.65
        ) {

            newZ = testZ;

        }


        /*
           Apply movement.
        */

        camera.position.x =
            newX;

        camera.position.z =
            newZ;

    }


    /* ==================================================
       GRAVITY
    ================================================== */

    velocityY -=
        20 * delta;


    camera.position.y +=
        velocityY * delta;


    /* ==================================================
       GROUND COLLISION
    ================================================== */

    const groundBlockY =
        terrainHeight(
            Math.floor(
                camera.position.x
            ),
            Math.floor(
                camera.position.z
            )
        );


    const groundHeight =
        groundBlockY +
        1 +
        EYE_HEIGHT;


    if (
        camera.position.y <
        groundHeight
    ) {

        camera.position.y =
            groundHeight;

        velocityY = 0;

        grounded = true;

    } else {

        grounded = false;

    }


    /* ==================================================
       FALL PROTECTION
    ================================================== */

    if (
        camera.position.y < -20
    ) {

        camera.position.set(
            12.5,
            terrainHeight(12, 12)
                + 1
                + EYE_HEIGHT,
            12.5
        );

        velocityY = 0;

    }

}