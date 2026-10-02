const PLAYER_HEIGHT = 2;
const PLAYER_RADIUS = 0.3;
const EYE_HEIGHT = 1.7;

let velocityY = 0;
let grounded = false;

function collides(x, bottom, z) {

    const minX =
        Math.floor(x - PLAYER_RADIUS);

    const maxX =
        Math.floor(x + PLAYER_RADIUS);

    const minY =
        Math.floor(bottom);

    const maxY =
        Math.floor(
            bottom +
            PLAYER_HEIGHT -
            0.001
        );

    const minZ =
        Math.floor(z - PLAYER_RADIUS);

    const maxZ =
        Math.floor(z + PLAYER_RADIUS);

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

function updatePlayer(delta) {

    if (!mouseLocked) {
        return;
    }

    const speed = 5 * delta;

    const forward =
        new THREE.Vector3();

    camera.getWorldDirection(
        forward
    );

    forward.y = 0;
    forward.normalize();

    const right =
        new THREE.Vector3(
            forward.z,
            0,
            -forward.x
        );

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

    if (movement.length() > 0) {

        movement.normalize();

        const bottom =
            camera.position.y -
            EYE_HEIGHT;

        const nextX =
            camera.position.x +
            movement.x * speed;

        if (
            !collides(
                nextX,
                bottom,
                camera.position.z
            )
        ) {
            camera.position.x =
                nextX;
        }

        const nextZ =
            camera.position.z +
            movement.z * speed;

        if (
            !collides(
                camera.position.x,
                bottom,
                nextZ
            )
        ) {
            camera.position.z =
                nextZ;
        }
    }

    velocityY -= 20 * delta;

    const newY =
        camera.position.y +
        velocityY * delta;

    const newBottom =
        newY -
        EYE_HEIGHT;

    if (
        !collides(
            camera.position.x,
            newBottom,
            camera.position.z
        )
    ) {

        camera.position.y =
            newY;

        grounded = false;

    } else {

        if (velocityY < 0) {
            grounded = true;
        }

        velocityY = 0;
    }

    if (
        camera.position.y < -10
    ) {

        camera.position.set(
            12.5,
            10,
            12.5
        );

        velocityY = 0;
    }
}