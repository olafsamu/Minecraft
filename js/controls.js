/*
=========================================================
BLOCKWORLD
Controls

Handles:
- WASD
- Space
- Mouse movement
- Pointer lock
- Start button
=========================================================
*/


/* ======================================================
   KEYBOARD
====================================================== */

const keys = {};


document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;


        /*
           Jump.
        */

        if (
            event.code === "Space" &&
            grounded
        ) {

            velocityY = 8;

            grounded = false;

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


/* ======================================================
   MOUSE LOOK
====================================================== */

let yaw = 0;

let pitch = 0;

let mouseLocked = false;


document.addEventListener(
    "mousemove",
    event => {

        if (!mouseLocked) {
            return;
        }


        yaw -=
            event.movementX *
            0.002;


        pitch -=
            event.movementY *
            0.002;


        pitch =
            Math.max(
                -Math.PI / 2 + 0.05,

                Math.min(
                    Math.PI / 2 - 0.05,
                    pitch
                )
            );


        camera.rotation.order =
            "YXZ";


        camera.rotation.y =
            yaw;


        camera.rotation.x =
            pitch;

    }
);


/* ======================================================
   POINTER LOCK
====================================================== */

function lockMouse() {

    document.body.requestPointerLock();

}


document.addEventListener(
    "pointerlockchange",
    () => {

        mouseLocked =
            document.pointerLockElement
            === document.body;

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