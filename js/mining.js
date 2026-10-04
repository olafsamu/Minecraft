/*
=========================================================
BLOCKWORLD
Mining + Block Placement + Inventory
=========================================================
*/

const REACH_DISTANCE = 6;

let targetedBlock = null;


/* ======================================================
   MINING VARIABLES
====================================================== */

let mining = false;
let miningBlock = null;
let miningProgress = 0;


/* ======================================================
   CRACK OVERLAY
====================================================== */

let crackOverlay = null;


/* ======================================================
   CREATE CRACK OVERLAY
====================================================== */

function createCrackOverlay(block) {

    removeCrackOverlay();


    const geometry =
        new THREE.BoxGeometry(
            1.01,
            1.01,
            1.01
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0,
            depthWrite: false
        });


    crackOverlay =
        new THREE.Mesh(
            geometry,
            material
        );


    crackOverlay.position.copy(
        block.position
    );


    crackOverlay.userData.isCrackOverlay =
        true;


    scene.add(
        crackOverlay
    );

}


/* ======================================================
   UPDATE CRACK OVERLAY
====================================================== */

function updateCrackOverlay(progress) {

    if (!crackOverlay) {
        return;
    }


    const opacity =
        Math.min(
            0.65,
            progress * 0.65
        );


    crackOverlay.material.opacity =
        opacity;

}


/* ======================================================
   REMOVE CRACK OVERLAY
====================================================== */

function removeCrackOverlay() {

    if (!crackOverlay) {
        return;
    }


    scene.remove(
        crackOverlay
    );


    crackOverlay.geometry.dispose();

    crackOverlay.material.dispose();


    crackOverlay = null;

}


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

    meshes.forEach(
        mesh => {

            blockMeshes.push(mesh);

        }
    );


    const hits =
        raycaster.intersectObjects(
            blockMeshes
        );


    if (
        hits.length === 0
    ) {

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
   CHECK IF PLAYER CAN BREAK BLOCK
====================================================== */

function canBreakBlock(blockType) {

    if (!blockType) {
        return false;
    }


    if (
        !blockType.requiresTool
    ) {

        return true;

    }


    const selectedItem =
        getSelectedItem();


    if (!selectedItem) {

        return false;

    }


    if (
        blockType.requiredTool ===
        "pickaxe"
    ) {

        return (
            selectedItem.type ===
            "pickaxe"
        );

    }


    return false;

}


/* ======================================================
   START MINING
====================================================== */

function startMining() {

    const block =
        getTargetBlock();


    if (!block) {
        return;
    }


    const blockType =
        block.userData.type;


    if (!blockType) {
        return;
    }


    if (
        !canBreakBlock(blockType)
    ) {

        if (
            blockType.requiredTool ===
            "pickaxe"
        ) {

            console.log(
                "You need a pickaxe to break stone!"
            );

        }

        return;

    }


    mining = true;

    miningBlock = block;

    miningProgress = 0;


    createCrackOverlay(
        block
    );

}


/* ======================================================
   STOP MINING
====================================================== */

function stopMining() {

    mining = false;

    miningBlock = null;

    miningProgress = 0;

    removeCrackOverlay();

}


/* ======================================================
   BREAK BLOCK
====================================================== */

function breakBlock(block) {

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


    world.delete(key);


    scene.remove(block);


    meshes.delete(key);


    if (blockType) {

        addItem(
            blockType.name,
            1
        );

    }


    block.geometry.dispose();


    if (
        Array.isArray(
            block.material
        )
    ) {

        block.material.forEach(
            material => {

                if (
                    material.map
                ) {

                    material.map.dispose();

                }

                material.dispose();

            }
        );

    }

    else {

        if (
            block.material.map
        ) {

            block.material.map.dispose();

        }

        block.material.dispose();

    }


    targetedBlock = null;

    stopMining();

}


/* ======================================================
   UPDATE MINING
====================================================== */

function updateMining(delta) {

    if (
        !mining ||
        !miningBlock
    ) {

        return;

    }


    if (
        !meshes.has(
            miningBlock.userData.key
        )
    ) {

        stopMining();

        return;

    }


    const currentTarget =
        getTargetBlock();


    if (
        currentTarget !==
        miningBlock
    ) {

        stopMining();

        return;

    }


    const blockType =
        miningBlock.userData.type;


    if (!blockType) {

        stopMining();

        return;

    }


    const breakTime =
        blockType.breakTime ||
        500;


    miningProgress +=
        delta * 1000;


    const progress =
        Math.min(
            miningProgress / breakTime,
            1
        );


    updateCrackOverlay(
        progress
    );


    if (
        miningProgress >=
        breakTime
    ) {

        breakBlock(
            miningBlock
        );

    }

}


/* ======================================================
   GET BLOCK TYPE FROM ITEM
====================================================== */

function getBlockTypeFromItem(
    itemType
) {

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


    if (
        selectedItem.type === "pickaxe"
    ) {

        return;

    }


    if (
        selectedItem.type === "sticks"
    ) {

        return;

    }


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


    if (
        hits.length === 0
    ) {

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


    if (
        world.has(key)
    ) {

        return;

    }


    const playerX =
        camera.position.x;


    const playerY =
        camera.position.y -
        EYE_HEIGHT;


    const playerZ =
        camera.position.z;


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


    const blockType =
        getBlockTypeFromItem(
            selectedItem.type
        );


    if (!blockType) {

        return;

    }


    addBlock(
        x,
        y,
        z,
        blockType
    );


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


        if (
            event.button === 0
        ) {

            startMining();

        }


        if (
            event.button === 2
        ) {

            const block =
                getTargetBlock();


            if (
                block &&
                block.userData.type ===
                BLOCKS.crafting_table
            ) {

                openCraftingTable();

                return;

            }


            placeBlock();

        }

    }
);


/* ======================================================
   LEFT CLICK RELEASE
====================================================== */

document.addEventListener(
    "mouseup",
    event => {

        if (
            event.button === 0
        ) {

            stopMining();

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