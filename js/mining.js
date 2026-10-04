/*
=========================================================
BLOCKWORLD
Mining + Block Placement + Inventory
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


    const hit =
        hits[0];


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


    const blockType =
        block.userData.type;


    /*
       Remove block from world.
    */

    world.delete(key);


    /*
       Remove block visually.
    */

    scene.remove(block);


    /*
       Remove from mesh collection.
    */

    meshes.delete(key);


    /*
       Give block to player.
    */

    if (blockType) {

        addItem(
            blockType.name,
            1
        );

    }


    /*
       Clean up.
    */

    block.geometry.dispose();

    block.material.dispose();

    targetedBlock = null;

}


/* ======================================================
   GET BLOCK TYPE FROM ITEM
====================================================== */

function getBlockTypeFromItem(itemType) {

    if (
        itemType === "grass"
    ) {

        return BLOCKS.grass;

    }


    if (
        itemType === "dirt"
    ) {

        return BLOCKS.dirt;

    }


    if (
        itemType === "stone"
    ) {

        return BLOCKS.stone;

    }


    if (
        itemType === "wood"
    ) {

        return BLOCKS.wood;

    }


    if (
        itemType === "leaves"
    ) {

        return BLOCKS.leaves;

    }


    if (
        itemType === "planks"
    ) {

        return BLOCKS.planks;

    }


    if (
        itemType === "crafting_table"
    ) {

        return BLOCKS.crafting_table;

    }


    return null;

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


    const selectedItem =
        getSelectedItem();


    if (!selectedItem) {
        return;
    }


    if (
        selectedItem.amount <= 0
    ) {
        return;
    }


    /*
       Find the exact face being clicked.
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
       Get the face normal.
    */

    const normal =
        hit.face.normal;


    /*
       Start at the block position.
    */

    const position =
        block.position.clone();


    /*
       Move one block in the
       direction of the clicked face.
    */

    position.add(normal);


    const x =
        Math.floor(position.x);

    const y =
        Math.floor(position.y);

    const z =
        Math.floor(position.z);


    const key =
        blockKey(
            x,
            y,
            z
        );


    /*
       Don't place inside another block.
    */

    if (
        world.has(key)
    ) {

        return;

    }


    /* ==================================================
       PLAYER COLLISION
    ================================================== */

    const playerX =
        camera.position.x;


    const playerY =
        camera.position.y -
        EYE_HEIGHT;


    const playerZ =
        camera.position.z;


    /*
       Don't place the block inside
       the player's body.
    */

    if (

        x + 1 >
        playerX - PLAYER_RADIUS &&

        x <
        playerX + PLAYER_RADIUS &&

        y + 1 >
        playerY &&

        y <
        playerY + PLAYER_HEIGHT &&

        z + 1 >
        playerZ - PLAYER_RADIUS &&

        z <
        playerZ + PLAYER_RADIUS

    ) {

        return;

    }


    /* ==================================================
       GET BLOCK TYPE
    ================================================== */

    const blockType =
        getBlockTypeFromItem(
            selectedItem.type
        );


    if (!blockType) {
        return;
    }


    /* ==================================================
       PLACE BLOCK
    ================================================== */

    addBlock(
        x,
        y,
        z,
        blockType
    );


    /* ==================================================
       REMOVE ONE ITEM
    ================================================== */

    selectedItem.amount--;


    if (
        selectedItem.amount <= 0
    ) {

        hotbar[
            selectedHotbarSlot
        ] = null;

    }


    updateHotbarUI();

}


/* ======================================================
   MOUSE CONTROLS
====================================================== */

document.addEventListener(
    "mousedown",
    event => {

        /*
           Don't interact with blocks
           when the mouse isn't locked.
        */

        if (!mouseLocked) {
            return;
        }


        /*
           Left click = break.
        */

        if (
            event.button === 0
        ) {

            breakBlock();

        }


        /*
           Right click = place.
        */

        if (
            event.button === 2
        ) {

            placeBlock();

        }

    }
);


/* ======================================================
   DISABLE RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);