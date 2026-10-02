const PLAYER_HEIGHT = 2;
const EYE_HEIGHT = 1.7;

let velocityY = 0;
let grounded = false;


/* ======================================================
   PLAYER MOVEMENT
====================================================== */

function updatePlayer(delta) {

    const speed = 5;

    const forward = new THREE.Vector3();

    camera.getWorldDirection(forward);

    forward.y = 0;

    if (forward.length() > 0) {
        forward.normalize();
    }


    const right = new THREE.Vector3(
        forward.z,
        0,
        -forward.x
    );


    const movement = new THREE.Vector3();


    /* WASD */

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


    /* Move */

    if (movement.length() > 0) {

        movement.normalize();

        camera.position.x +=
            movement.x * speed * delta;

        camera.position.z +=
            movement.z * speed * delta;
    }


    /* ==================================================
       GRAVITY
    ================================================== */

    velocityY -= 20 * delta;

    camera.position.y +=
        velocityY * delta;


    /* Keep player above the terrain */

    const groundY =
        terrainHeight(
            Math.floor(camera.position.x),
            Math.floor(camera.position.z)
        ) + 1 + EYE_HEIGHT;


    if (
        camera.position.y < groundY
    ) {

        camera.position.y =
            groundY;

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