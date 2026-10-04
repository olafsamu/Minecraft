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


    /*
       The block type is stored in
       userData.type.
    */

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
       Remove it from mesh collection.
    */

    meshes.delete(key);


    /*
       Give the player the block.
    */

    if (blockType) {

        addItem(
            blockType.name,
            1
        );

    }


    /*
       Clean up memory.
    */

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
       Find the clicked face.
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


    const normal =
        hit.face.normal;


    const position =
        block.position.clone();


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

    if (world.has(key)) {
        return;
    }


    /*
       Don't place a block inside
       the player.
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
       Convert the selected item's
       name into the actual block.
    */

    let blockType = null;


    if (
        selectedItem.type === "grass"
    ) {
        blockType =
            BLOCKS.grass;
    }

    else if (
        selectedItem.type === "dirt"
    ) {
        blockType =
            BLOCKS.dirt;
    }

    else if (
        selectedItem.type === "stone"
    ) {
        blockType =
            BLOCKS.stone;
    }

    else if (
        selectedItem.type === "wood"
    ) {
        blockType =
            BLOCKS.wood;
    }

    else if (
        selectedItem.type === "leaves"
    ) {
        blockType =
            BLOCKS.leaves;
    }

    else if (
        selectedItem.type === "planks"
    ) {
        blockType =
            BLOCKS.planks;
    }

    else if (
        selectedItem.type === "crafting_table"
    ) {
        blockType =
            BLOCKS.crafting_table;
    }


    /*
       If the block doesn't exist,
       don't place anything.
    */

    if (!blockType) {
        return;
    }


    /*
       Place the block.
    */

    addBlock(
        x,
        y,
        z,
        blockType
    );


    /*
       Remove one item.
    */

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