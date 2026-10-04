/*
=========================================================
BLOCKWORLD
Mining + Block Placement + Inventory
=========================================================

This version uses voxel-grid raycasting.

It does NOT raycast every block mesh.

This is important because terrain blocks are now rendered
using InstancedMesh.

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
   TARGET PROXY
====================================================== */

/*
   A single invisible Mesh is used as a compatibility
   object for the existing crack system.

   It is NOT part of world rendering.
*/

const targetProxyMaterial =
    new THREE.MeshBasicMaterial({

        transparent: true,

        opacity: 0,

        depthWrite: false

    });


const targetProxy =
    new THREE.Mesh(

        BLOCK_GEOMETRY,

        targetProxyMaterial

    );


targetProxy.userData.isTargetProxy =
    true;


scene.add(
    targetProxy
);


/* ======================================================
   GET BLOCK THE PLAYER IS LOOKING AT
====================================================== */

function getTargetBlock() {

    const origin =
        camera.position.clone();


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    direction.normalize();


    let x =
        Math.floor(
            origin.x
        );


    let y =
        Math.floor(
            origin.y
        );


    let z =
        Math.floor(
            origin.z
        );


    const stepX =
        direction.x >= 0
            ? 1
            : -1;


    const stepY =
        direction.y >= 0
            ? 1
            : -1;


    const stepZ =
        direction.z >= 0
            ? 1
            : -1;


    const tDeltaX =
        direction.x === 0
            ? Infinity
            : Math.abs(
                1 /
                direction.x
            );


    const tDeltaY =
        direction.y === 0
            ? Infinity
            : Math.abs(
                1 /
                direction.y
            );


    const tDeltaZ =
        direction.z === 0
            ? Infinity
            : Math.abs(
                1 /
                direction.z
            );


    let tMaxX;

    let tMaxY;

    let tMaxZ;


    if (
        direction.x >= 0
    ) {

        tMaxX =
            (
                x + 1 -
                origin.x
            ) /
            direction.x;

    }

    else {

        tMaxX =
            (
                x -
                origin.x
            ) /
            direction.x;

    }


    if (
        direction.y >= 0
    ) {

        tMaxY =
            (
                y + 1 -
                origin.y
            ) /
            direction.y;

    }

    else {

        tMaxY =
            (
                y -
                origin.y
            ) /
            direction.y;

    }


    if (
        direction.z >= 0
    ) {

        tMaxZ =
            (
                z + 1 -
                origin.z
            ) /
            direction.z;

    }

    else {

        tMaxZ =
            (
                z -
                origin.z
            ) /
            direction.z;

    }


    /*
       Zero direction components create NaN values
       in the calculations above.

       Fix them explicitly.
    */

    if (
        direction.x === 0
    ) {

        tMaxX =
            Infinity;

    }


    if (
        direction.y === 0
    ) {

        tMaxY =
            Infinity;

    }


    if (
        direction.z === 0
    ) {

        tMaxZ =
            Infinity;

    }


    let travelled =
        0;


    /*
       Face normal of the face we entered through.
    */

    let faceNormal =
        new THREE.Vector3();


    /*
       Check up to REACH_DISTANCE.
    */

    while (
        travelled <=
        REACH_DISTANCE
    ) {

        const key =
            blockKey(
                x,
                y,
                z
            );


        /*
           We hit a block.
        */

        if (
            world.has(
                key
            )
        ) {

            const type =
                world.get(
                    key
                );


            if (!type) {

                return null;

            }


            targetProxy.position.set(

                x +
                0.5,

                y +
                0.5,

                z +
                0.5

            );


            targetProxy.userData.key =
                key;


            targetProxy.userData.type =
                type;


            targetProxy.userData.x =
                x;


            targetProxy.userData.y =
                y;


            targetProxy.userData.z =
                z;


            targetProxy.userData.faceNormal =
                faceNormal.clone();


            targetedBlock =
                targetProxy;


            return targetProxy;

        }


        /*
           Move to the next voxel.
        */

        if (
            tMaxX <
            tMaxY &&
            tMaxX <
            tMaxZ
        ) {

            x += stepX;

            travelled =
                tMaxX;

            tMaxX +=
                tDeltaX;


            faceNormal.set(

                -stepX,

                0,

                0

            );

        }

        else if (
            tMaxY <
            tMaxZ
        ) {

            y += stepY;

            travelled =
                tMaxY;

            tMaxY +=
                tDeltaY;


            faceNormal.set(

                0,

                -stepY,

                0

            );

        }

        else {

            z += stepZ;

            travelled =
                tMaxZ;

            tMaxZ +=
                tDeltaZ;


            faceNormal.set(

                0,

                0,

                -stepZ

            );

        }

    }


    targetedBlock = null;

    return null;

}


/* ======================================================
   CHECK IF PLAYER CAN BREAK BLOCK
====================================================== */

function canBreakBlock(
    blockType
) {

    if (!blockType) {

        return false;

    }


    /*
       Normal blocks.
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
       Pickaxe.
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


    if (
        !canBreakBlock(
            blockType
        )
    ) {

        if (
            blockType.requiredTool ===
            "pickaxe"
        ) {

            console.log(
                "You need a pickaxe to break this block!"
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
   REMOVE SPECIAL MESH
====================================================== */

function cleanupSpecialMesh(
    key
) {

    const mesh =
        meshes.get(
            key
        );


    if (!mesh) {

        return;

    }


    scene.remove(
        mesh
    );


    /*
       Never dispose shared BLOCK_GEOMETRY.
    */

    if (
        Array.isArray(
            mesh.material
        )
    ) {

        mesh.material.forEach(
            material => {

                if (
                    material &&
                    material.map
                ) {

                    material.map.dispose();

                }


                if (material) {

                    material.dispose();

                }

            }
        );

    }

    else if (
        mesh.material
    ) {

        if (
            mesh.material.map
        ) {

            mesh.material.map.dispose();

        }


        mesh.material.dispose();

    }


    meshes.delete(
        key
    );

}


/* ======================================================
   BREAK BLOCK
====================================================== */

function breakBlock(
    block
) {

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


    const x =
        block.userData.x;


    const y =
        block.userData.y;


    const z =
        block.userData.z;


    /*
       Remove from world.
    */

    world.delete(
        key
    );


    /*
       Special blocks still have individual meshes.
    */

    if (
        meshes.has(
            key
        )
    ) {

        cleanupSpecialMesh(
            key
        );

    }


    /*
       Remove from its chunk member set.
    */

    const chunkX =
        getChunkCoordinate(
            x
        );


    const chunkZ =
        getChunkCoordinate(
            z
        );


    const cKey =
        chunkKey(
            chunkX,
            chunkZ
        );


    const members =
        chunkMembers.get(
            cKey
        );


    if (members) {

        members.delete(
            key
        );

    }


    /*
       Give the block to the player.
    */

    if (blockType) {

        addItem(
            blockType.name,
            1
        );

    }


    /*
       Rebuild the changed chunk and any
       neighboring chunk whose visibility changed.
    */

    refreshChunkAroundBlock(

        x,
        y,
        z

    );


    targetedBlock = null;


    stopMining();

}


/* ======================================================
   UPDATE MINING
====================================================== */

function updateMining(
    delta
) {

    if (
        !mining ||
        !miningBlock
    ) {

        return;

    }


    /*
       Find whatever the player is now looking at.
    */

    const currentTarget =
        getTargetBlock();


    if (!currentTarget) {

        stopMining();

        return;

    }


    if (
        currentTarget.userData.key !==
        miningBlock.userData.key
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
        delta *
        1000;


    const progress =
        Math.min(

            miningProgress /
            breakTime,

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
        itemType ===
        "grass"
    ) {

        return BLOCKS.grass;

    }


    if (
        itemType ===
        "dirt"
    ) {

        return BLOCKS.dirt;

    }


    if (
        itemType ===
        "stone"
    ) {

        return BLOCKS.stone;

    }


    if (
        itemType ===
        "wood"
    ) {

        return BLOCKS.wood;

    }


    if (
        itemType ===
        "leaves"
    ) {

        return BLOCKS.leaves;

    }


    if (
        itemType ===
        "planks"
    ) {

        return BLOCKS.planks;

    }


    if (
        itemType ===
        "crafting_table"
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
       DDA gives us the exact face normal.
    */

    const normal =
        block.userData.faceNormal;


    if (!normal) {

        return;

    }


    const x =
        block.userData.x +
        normal.x;


    const y =
        block.userData.y +
        normal.y;


    const z =
        block.userData.z +
        normal.z;


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
        world.has(
            key
        )
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
       Don't place inside the player.
    */

    if (

        x + 1 >
        playerX -
        PLAYER_RADIUS &&

        x <
        playerX +
        PLAYER_RADIUS &&

        y + 1 >
        playerY &&

        y <
        playerY +
        PLAYER_HEIGHT &&

        z + 1 >
        playerZ -
        PLAYER_RADIUS &&

        z <
        playerZ +
        PLAYER_RADIUS

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


    /*
       Our chunk-aware addBlock() handles both
       instanced terrain and special blocks.
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
           Left click = mining.
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
               Crafting table.
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
               Otherwise place.
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