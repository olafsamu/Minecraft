/*
=========================================================
BLOCKWORLD
Controls
=========================================================
*/

const keys = {};

let yaw = 0;
let pitch = 0;
let mouseLocked = false;


/* ======================================================
   KEYBOARD
====================================================== */

document.addEventListener("keydown", event => {

    keys[event.code] = true;

    if (
        event.code === "Space" &&
        grounded
    ) {
        velocityY = 8;
        grounded = false;
    }

});


document.addEventListener("keyup", event => {

    keys[event.code] = false;

});


/* ======================================================
   MOUSE LOOK
====================================================== */

document.addEventListener("mousemove", event => {

    if (!mouseLocked) {
        return;
    }

    yaw -= event.movementX * 0.002;

    pitch -= event.movementY * 0.002;

    pitch = Math.max(
        -Math.PI / 2 + 0.05,
        Math.min(
            Math.PI / 2 - 0.05,
            pitch
        )
    );

    camera.rotation.order = "YXZ";

    camera.rotation.y = yaw;

    camera.rotation.x = pitch;

});


/* ======================================================
   POINTER LOCK
====================================================== */

function lockMouse() {

    canvas.requestPointerLock();

}


document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement === canvas;

    }
);


/* ======================================================
   ESCAPE
====================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (event.code === "Escape") {

            if (
                document.pointerLockElement
            ) {

                document.exitPointerLock();

            }

        }

    }
);


/* ======================================================
   START BUTTON
====================================================== */

document
    .getElementById("startButton")
    .addEventListener(
        "click",
        () => {

            document
                .getElementById("startScreen")
                .style.display = "none";

            lockMouse();

        }
    );