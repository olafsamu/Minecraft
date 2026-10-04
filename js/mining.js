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


    /*
       Normal blocks can be broken by hand.
    */

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


    /*
       Stone requires a pickaxe.
    */

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


    /*
       Check tool requirement.
    */

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


    /*
       Start the crack effect.
    */

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


    /*
       Remove crack effect.
    */

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


    /*
       Remove from world.
    */

    world.delete(key);


    /*
       Remove visually.
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
       Clean up geometry.
    */

    block.geometry.dispose();


    /*
       Clean up materials.
    */

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


    /*
       Stop mining and remove cracks.
    */

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


    /*
       Make sure the block still exists.
    */

    if (
        !meshes.has(
            miningBlock.userData.key
        )
    ) {

        stopMining();

        return;

    }


    /*
       Make sure the player is
       still looking at the same block.
    */

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


    /*
       Get break time.
    */

    const breakTime =
        blockType.breakTime ||
        500;


    /*
       Increase mining progress.
    */

    miningProgress +=
        delta * 1000;


    /*
       Convert progress to
       a value between 0 and 1.
    */

    const progress =
        Math.min(
            miningProgress / breakTime,
            1
        );


    /*
       Update crack effect.
    */

    updateCrackOverlay(
        progress
    );


    /*
       Break block when finished.
    */

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


    /*
       Tools cannot be placed.
    */

    if (
        selectedItem.type ===
        "pickaxe"
    ) {

        return;

    }


    /*
       Sticks cannot be placed.
    */

    if (
        selectedItem.type ===
        "sticks"
    ) {

        return;

    }


    /*
       Find clicked face.
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


    /*
       Don't place inside another block.
    */

    if (
        world.has(key)
    ) {

        return;

    }


    /*
       Player position.
    */

    const playerX =
        camera.position.x;


    const playerY =
        camera.position.y -
        EYE_HEIGHT;


    const playerZ =
        camera.position.z;


    /*
       Don't place inside player.
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


    /*
       Convert item into block.
    */

    const blockType =
        getBlockTypeFromItem(
            selectedItem.type
        );


    if (!blockType) {

        return;

    }


    /*
       Place block.
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
           Left click = start mining.
        */

        if (
            event.button === 0
        ) {

            startMining();

        }


        /*
           Right click.
        */

        if (
            event.button === 2
        ) {

            const block =
                getTargetBlock();


            /*
               Right-clicking a crafting
               table opens the 3x3 menu.
            */

            if (
                block &&
                block.userData.type ===
                BLOCKS.crafting_table
            ) {

                openCraftingTable();

                return;

            }


            /*
               Otherwise place a block.
            */

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