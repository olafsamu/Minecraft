const keys = {};

let yaw = 0;
let pitch = 0;
let mouseLocked = false;


/* ======================================================
   KEYBOARD
====================================================== */

document.addEventListener("keydown", function(event) {

    keys[event.code] = true;

    if (
        event.code === "Space" &&
        grounded
    ) {

        velocityY = 8;

        grounded = false;
    }

});


document.addEventListener("keyup", function(event) {

    keys[event.code] = false;

});


/* ======================================================
   MOUSE LOOK
====================================================== */

document.addEventListener("mousemove", function(event) {

    if (!mouseLocked) {
        return;
    }

    yaw -=
        event.movementX * 0.002;

    pitch -=
        event.movementY * 0.002;


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

document.addEventListener(
    "pointerlockchange",
    function() {

        mouseLocked =
            document.pointerLockElement === canvas;

    }
);


/* ======================================================
   START BUTTON
====================================================== */

const startButton =
    document.getElementById("startButton");


if (startButton) {

    startButton.addEventListener(
        "click",
        function() {

            const startScreen =
                document.getElementById(
                    "startScreen"
                );

            if (startScreen) {
                startScreen.style.display = "none";
            }

            canvas.requestPointerLock();

        }
    );

}