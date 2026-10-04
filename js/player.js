/*
=========================================================
BLOCKWORLD
Player
=========================================================
*/

const PLAYER_HEIGHT = 2;

const PLAYER_RADIUS = 0.3;

const EYE_HEIGHT = 1.7;


let velocityY = 0;

let grounded = false;


/* ======================================================
   BLOCK COLLISION
====================================================== */

function collidesAt(
    x,
    bottom,
    z
) {

    const minX =
        Math.floor(
            x -
            PLAYER_RADIUS
        );


    const maxX =
        Math.floor(
            x +
            PLAYER_RADIUS
        );


    const minY =
        Math.floor(
            bottom +
            0.001
        );


    const maxY =
        Math.floor(

            bottom +
            PLAYER_HEIGHT -
            0.001

        );


    const minZ =
        Math.floor(
            z -
            PLAYER_RADIUS
        );


    const maxZ =
        Math.floor(
            z +
            PLAYER_RADIUS
        );


    for (
        let bx = minX;
        bx <= maxX;
        bx++
    ) {

        for (
            let by = minY;
            by <= maxY;
            by++
        ) {

            for (
                let bz = minZ;
                bz <= maxZ;
                bz++
            ) {

                if (
                    world.has(
                        blockKey(
                            bx,
                            by,
                            bz
                        )
                    )
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


/* ======================================================
   PLAYER MOVEMENT
====================================================== */

function updatePlayer(
    delta
) {

    /*
       Load the chunks around the player
       before movement occurs.

       This is what allows the player to
       cross into new chunks safely.
    */

    if (
        typeof updateChunksAroundPlayer ===
        "function"
    ) {

        updateChunksAroundPlayer();

    }


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


    if (
        forward.length() > 0
    ) {

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


    if (
        keys["KeyW"]
    ) {

        movement.add(
            forward
        );

    }


    if (
        keys["KeyS"]
    ) {

        movement.sub(
            forward
        );

    }


    if (
        keys["KeyA"]
    ) {

        movement.sub(
            right
        );

    }


    if (
        keys["KeyD"]
    ) {

        movement.add(
            right
        );

    }


    /* ==================================================
       HORIZONTAL COLLISION
    ================================================== */

    if (
        movement.length() > 0
    ) {

        movement.normalize();


        const moveX =
            movement.x *
            speed *
            delta;


        const moveZ =
            movement.z *
            speed *
            delta;


        const bottom =
            camera.position.y -
            EYE_HEIGHT;


        /* ==================================================
           X
        ================================================== */

        const nextX =
            camera.position.x +
            moveX;


        if (
            !collidesAt(
                nextX,
                bottom,
                camera.position.z
            )
        ) {

            camera.position.x =
                nextX;

        }


        /* ==================================================
           Z
        ================================================== */

        const nextZ =
            camera.position.z +
            moveZ;


        if (
            !collidesAt(
                camera.position.x,
                bottom,
                nextZ
            )
        ) {

            camera.position.z =
                nextZ;

        }

    }


    /* ==================================================
       GRAVITY
    ================================================== */

    velocityY -=
        20 *
        delta;


    const nextY =
        camera.position.y +
        velocityY *
        delta;


    const nextBottom =
        nextY -
        EYE_HEIGHT;


    /* ==================================================
       VERTICAL COLLISION
    ================================================== */

    if (
        !collidesAt(
            camera.position.x,
            nextBottom,
            camera.position.z
        )
    ) {

        camera.position.y =
            nextY;


        grounded = false;

    }

    else {

        if (
            velocityY < 0
        ) {

            grounded = true;

        }


        velocityY = 0;

    }


    /* ==================================================
       FALL PROTECTION
    ================================================== */

    if (
        camera.position.y <
        -WORLD_DEPTH - 10
    ) {

        camera.position.set(

            12.5,

            terrainHeight(
                12,
                12
            )
            + 1
            + EYE_HEIGHT,

            12.5

        );


        velocityY = 0;

    }

}