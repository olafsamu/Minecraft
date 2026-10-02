```javascript
/*
=========================================================
BLOCKWORLD
Basic game engine

Current features:
- 3D world
- Blocks
- Trees
- Player
- WASD
- Mouse look
- Jumping
- Gravity
- Collision
=========================================================
*/


/* ======================================================
   CANVAS
====================================================== */

const canvas =
    document.getElementById("game");


/* ======================================================
   THREE.JS
====================================================== */

const scene =
    new THREE.Scene();


scene.background =
    new THREE.Color(0x87ceeb);


scene.fog =
    new THREE.Fog(
        0x87ceeb,
        20,
        80
    );


const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        200
    );


const renderer =
    new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: false
    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


/* ======================================================
   LIGHTING
====================================================== */

const skyLight =
    new THREE.HemisphereLight(
        0xffffff,
        0x557755,
        1.8
    );


scene.add(
    skyLight
);


const sun =
    new THREE.DirectionalLight(
        0xffffff,
        1.5
    );


sun.position.set(
    30,
    50,
    20
);


scene.add(
    sun
);


/* ======================================================
   WORLD DATA
====================================================== */

const world =
    new Map();


const meshes =
    new Map();


const WORLD_SIZE = 24;


/* ======================================================
   BLOCK KEY
====================================================== */

function blockKey(
    x,
    y,
    z
) {

    return (
        x + "," +
        y + "," +
        z
    );

}


/* ======================================================
   TERRAIN HEIGHT
====================================================== */

function terrainHeight(
    x,
    z
) {

    return Math.max(

        1,

        Math.min(

            6,

            Math.floor(

                3 +

                Math.sin(
                    x * 0.4
                ) +

                Math.cos(
                    z * 0.35
                ) +

                Math.sin(
                    (x + z) * 0.2
                )

            )

        )

    );

}


/* ======================================================
   ADD BLOCK
====================================================== */

function addBlock(
    x,
    y,
    z,
    type
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    if (
        world.has(key)
    ) {

        return;

    }


    const geometry =
        new THREE.BoxGeometry(
            1,
            1,
            1
        );


    const material =
        new THREE.MeshLambertMaterial({
            color: type.color
        });


    const cube =
        new THREE.Mesh(
            geometry,
            material
        );


    cube.position.set(
        x + 0.5,
        y + 0.5,
        z + 0.5
    );


    cube.userData.key =
        key;


    cube.userData.type =
        type;


    scene.add(
        cube
    );


    world.set(
        key,
        type
    );


    meshes.set(
        key,
        cube
    );

}


/* ======================================================
   GENERATE WORLD
====================================================== */

function generateWorld() {

    /*
       Remove previous blocks.
    */

    meshes.forEach(
        cube => {

            scene.remove(
                cube
            );

            cube.geometry.dispose();

            cube.material.dispose();

        }
    );


    world.clear();

    meshes.clear();


    /*
       Terrain.
    */

    for (
        let x = 0;
        x < WORLD_SIZE;
        x++
    ) {

        for (
            let z = 0;
            z < WORLD_SIZE;
            z++
        ) {

            const height =
                terrainHeight(
                    x,
                    z
                );


            for (
                let y = 0;
                y <= height;
                y++
            ) {

                let type;


                if (
                    y === height
                ) {

                    type =
                        BLOCKS.grass;

                }

                else if (
                    y >= height - 2
                ) {

                    type =
                        BLOCKS.dirt;

                }

                else {

                    type =
                        BLOCKS.stone;

                }


                addBlock(
                    x,
                    y,
                    z,
                    type
                );

            }

        }

    }


    /*
       Trees.
    */

    const trees = [

        [4, 5],
        [10, 8],
        [17, 5],
        [18, 15],
        [7, 18]

    ];


    trees.forEach(
        ([x, z]) => {

            const ground =
                terrainHeight(
                    x,
                    z
                );


            /*
               Trunk.
            */

            for (
                let y = ground + 1;
                y <= ground + 4;
                y++
            ) {

                addBlock(
                    x,
                    y,
                    z,
                    BLOCKS.wood
                );

            }


            /*
               Leaves.
            */

            for (
                let dx = -2;
                dx <= 2;
                dx++
            ) {

                for (
                    let dz = -2;
                    dz <= 2;
                    dz++
                ) {

                    if (
                        Math.abs(dx) +
                        Math.abs(dz)
                        <= 3
                    ) {

                        addBlock(
                            x + dx,
                            ground + 3,
                            z + dz,
                            BLOCKS.leaves
                        );

                    }

                }

            }

        }
    );

}


/* ======================================================
   PLAYER
====================================================== */

const PLAYER_HEIGHT = 2;

const PLAYER_RADIUS = 0.3;

const EYE_HEIGHT = 1.7;


let velocityY = 0;

let grounded = false;


/* ======================================================
   COLLISION
====================================================== */

function collides(
    x,
    bottom,
    z
) {

    const minX =
        Math.floor(
            x - PLAYER_RADIUS
        );


    const maxX =
        Math.floor(
            x + PLAYER_RADIUS
        );


    const minY =
        Math.floor(
            bottom
        );


    /*
       Slightly reduce the upper
       edge so standing directly
       underneath a block does not
       count as touching it.
    */

    const maxY =
        Math.floor(
            bottom +
            PLAYER_HEIGHT -
            0.001
        );


    const minZ =
        Math.floor(
            z - PLAYER_RADIUS
        );


    const maxZ =
        Math.floor(
            z + PLAYER_RADIUS
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
   MOVEMENT
====================================================== */

const keys = {};


document.addEventListener(
    "keydown",
    event => {

        keys[event.code] =
            true;


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

        keys[event.code] =
            false;

    }
);


/* ======================================================
   UPDATE PLAYER
====================================================== */

function updatePlayer(
    delta
) {

    if (
        !mouseLocked
    ) {

        return;

    }


    const speed =
        5 * delta;


    /*
       Forward direction.
    */

    const forward =
        new THREE.Vector3();


    camera.getWorldDirection(
        forward
    );


    forward.y = 0;

    forward.normalize();


    /*
       Right direction.
    */

    const right =
        new THREE.Vector3(
            forward.z,
            0,
            -forward.x
        );


    /*
       Movement vector.
    */

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


    if (
        movement.length() > 0
    ) {

        movement.normalize();


        const bottom =
            camera.position.y -
            EYE_HEIGHT;


        /*
           X movement.
        */

        const nextX =
            camera.position.x +
            movement.x *
            speed;


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


        /*
           Z movement.
        */

        const nextZ =
            camera.position.z +
            movement.z *
            speed;


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


    /*
       Gravity.
    */

    velocityY -=
        20 * delta;


    const newY =
        camera.position.y +
        velocityY *
        delta;


    const newBottom =
        newY -
        EYE_HEIGHT;


    /*
       Vertical collision.
    */

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

    }

    else {

        if (
            velocityY < 0
        ) {

            grounded = true;

        }


        velocityY = 0;

    }


    /*
       Respawn if we fall.
    */

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


/* ======================================================
   MOUSE LOOK
====================================================== */

let yaw = 0;

let pitch = 0;

let mouseLocked = false;


document.addEventListener(
    "mousemove",
    event => {

        if (
            !mouseLocked
        ) {

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
    .getElementById(
        "startButton"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "startScreen"
                )
                .style.display =
                "none";


            lockMouse();

        }
    );


/* ======================================================
   RESIZE
====================================================== */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* ======================================================
   START POSITION
====================================================== */

generateWorld();


camera.position.set(
    12.5,
    terrainHeight(12, 12)
    + EYE_HEIGHT
    + 0.1,
    12.5
);


/* ======================================================
   GAME LOOP
====================================================== */

const clock =
    new THREE.Clock();


function gameLoop() {

    requestAnimationFrame(
        gameLoop
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


gameLoop();
```
