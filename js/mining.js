/*
=========================================================
BLOCKWORLD
Mining + Block Placement
=========================================================
*/

const REACH_DISTANCE = 6;

let targetedBlock = null;


/* ======================================================
   GET BLOCK THE PLAYER IS LOOKING AT
====================================================== */

function getTargetBlock() {

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const blockMeshes = [];

    meshes.forEach(mesh => {
        blockMeshes.push(mesh);
    });

    const hits =
        raycaster.intersectObjects(
            blockMeshes
        );

    if (hits.length === 0) {

        targetedBlock = null;

        return null;
    }

    const hit = hits[0];

    if (
        hit.distance >
        REACH_DISTANCE
    ) {

        targetedBlock = null;

        return null;
    }

    targetedBlock =
        hit.object;

    return hit.object;
}


/* ======================================================
   BREAK BLOCK
====================================================== */

function breakBlock() {

    const block =
        getTargetBlock();

    if (!block) {
        return;
    }

    const key =
        block.userData.key;

    if (!key) {
        return;
    }

    world.delete(key);

    scene.remove(block);

    meshes.delete(key);

    block.geometry.dispose();

    block.material.dispose();

    targetedBlock = null;
}


/* ======================================================
   PLACE BLOCK
====================================================== */

function placeBlock() {

    const block =
        getTargetBlock();

    if (!block) {
        return;
    }


    /*
       Get the face that was clicked.
    */

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );


    const hits =
        raycaster.intersectObject(
            block
        );


    if (hits.length === 0) {
        return;
    }


    const hit =
        hits[0];


    /*
       The normal tells us which
       side of the block we hit.
    */

    const normal =
        hit.face.normal;


    const position =
        block.position.clone();


    position.add(normal);


    const x =
        Math.floor(
            position.x
        );

    const y =
        Math.floor(
            position.y
        );

    const z =
        Math.floor(
            position.z
        );


    const key =
        blockKey(
            x,
            y,
            z
        );


    /*
       Don't place a block where
       one already exists.
    */

    if (world.has(key)) {
        return;
    }


    /*
       Don't place a block inside
       the player's body.
    */

    const playerX =
        camera.position.x;

    const playerY =
        camera.position.y -
        EYE_HEIGHT;

    const playerZ =
        camera.position.z;


    if (
        x + 1 > playerX - PLAYER_RADIUS &&
        x < playerX + PLAYER_RADIUS &&
        y + 1 > playerY &&
        y < playerY + PLAYER_HEIGHT &&
        z + 1 > playerZ - PLAYER_RADIUS &&
        z < playerZ + PLAYER_RADIUS
    ) {

        return;
    }


    /*
       Place a dirt block for now.
    */

    addBlock(
        x,
        y,
        z,
        BLOCKS.dirt
    );

}


/* ======================================================
   MOUSE CONTROLS
====================================================== */

document.addEventListener(
    "mousedown",
    event => {

        if (!mouseLocked) {
            return;
        }


        /*
           Left click = break
        */

        if (
            event.button === 0
        ) {

            breakBlock();

        }


        /*
           Right click = place
        */

        if (
            event.button === 2
        ) {

            placeBlock();

        }

    }
);


/* ======================================================
   PREVENT RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);