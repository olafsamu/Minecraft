/*
=========================================================
BLOCKWORLD
Mining + Block Placement
=========================================================

Handles:

- Block targeting
- Mining
- Crack animation
- Block breaking
- Block placement
- Mouse input

Compatible with the current:

blocks.js
chunks.js
inventory.js
crafting.js
cracks.js
=========================================================
*/


/* ======================================================
   SETTINGS
====================================================== */

const REACH_DISTANCE = 6;

const BREAK_TIME = 0.5;


/* ======================================================
   MINING STATE
====================================================== */

let targetedBlock = null;

let breaking = false;

let breakingKey = null;

let breakingStart = 0;

let leftMouseDown = false;


/* ======================================================
   TARGET PROXY
====================================================== */

/*
   This invisible mesh is NOT rendered.

   It is only used to give the crack system a position
   in the world.
*/

const targetProxy =
    new THREE.Mesh(
        BLOCK_GEOMETRY,
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        })
    );

targetProxy.visible = false;


/* ======================================================
   FIND BLOCK THE PLAYER IS LOOKING AT
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


    const stepSize = 0.05;

    const steps =
        Math.ceil(
            REACH_DISTANCE /
            stepSize
        );


    let previousX =
        Math.floor(
            origin.x
        );

    let previousY =
        Math.floor(
            origin.y
        );

    let previousZ =
        Math.floor(
            origin.z
        );


    for (
        let i = 0;
        i <= steps;
        i++
    ) {

        const distance =
            i * stepSize;


        const point =
            origin.clone()
                .addScaledVector(
                    direction,
                    distance
                );


        const x =
            Math.floor(
                point.x
            );

        const y =
            Math.floor(
                point.y
            );

        const z =
            Math.floor(
                point.z
            );


        /*
           Skip the same voxel repeatedly.
        */

        if (
            i !== 0 &&
            x === previousX &&
            y === previousY &&
            z === previousZ
        ) {

            continue;

        }


        const key =
            blockKey(
                x,
                y,
                z
            );


        /*
           We found a block.
        */

        if (
            world.has(key)
        ) {

            const type =
                world.get(key);


            if (!type) {

                targetedBlock =
                    null;

                return null;

            }


            /*
               Determine which face was hit.
            */

            const faceNormal =
                new THREE.Vector3(
                    previousX - x,
                    previousY - y,
                    previousZ - z
                );


            /*
               If the first voxel was somehow
               the target, determine the face
               from the camera direction.
            */

            if (
                faceNormal.lengthSq() === 0
            ) {

                const ax =
                    Math.abs(
                        direction.x
                    );

                const ay =
                    Math.abs(
                        direction.y
                    );

                const az =
                    Math.abs(
                        direction.z
                    );


                if (
                    ax >= ay &&
                    ax >= az
                ) {

                    faceNormal.set(
                        direction.x > 0
                            ? -1
                            : 1,
                        0,
                        0
                    );

                }

                else if (
                    ay >= az
                ) {

                    faceNormal.set(
                        0,
                        direction.y > 0
                            ? -1
                            : 1,
                        0
                    );

                }

                else {

                    faceNormal.set(
                        0,
                        0,
                        direction.z > 0
                            ? -1
                            : 1
                    );

                }

            }


            /*
               Store all target information
               on the invisible proxy.
            */

            targetProxy.position.set(
                x + 0.5,
                y + 0.5,
                z + 0.5
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


        previousX = x;

        previousY = y;

        previousZ = z;

    }


    targetedBlock =
        null;


    return null;

}


/* ======================================================
   CHECK WHETHER BLOCK CAN BE BROKEN
====================================================== */

function canBreak(
    type
) {

    if (!type) {

        return false;

    }


    /*
    ------------------------------------------------------
    BLOCKS THAT DO NOT REQUIRE A TOOL

    Your blocks.js contains:

        requiresTool: false

    for grass, dirt, wood, leaves, planks,
    and crafting tables.
    ------------------------------------------------------
    */

    if (
        type.requiresTool === false
    ) {

        return true;

    }


    /*
    ------------------------------------------------------
    BLOCKS THAT REQUIRE A PICKAXE
    ------------------------------------------------------
    */

    if (
        type.requiresTool === true &&
        type.requiredTool === "pickaxe"
    ) {

        if (
            typeof getSelectedItem !==
            "function"
        ) {

            return false;

        }


        const selected =
            getSelectedItem();


        if (!selected) {

            return false;

        }


        /*
           Your ITEMS.pickaxe is:

               type: "pickaxe"
        */

        return (
            selected.type === "pickaxe"
        );

    }


    return false;

}


/* ======================================================
   START MINING
====================================================== */

function startMining() {

    const target =
        getTargetBlock();


    if (!target) {

        return;

    }


    const type =
        target.userData.type;


    if (
        !canBreak(type)
    ) {

        return;

    }


    const key =
        target.userData.key;


    breaking =
        true;


    breakingKey =
        key;


    breakingStart =
        performance.now();


    /*
       Start crack animation.
    */

    if (
        typeof createCrackOverlay ===
        "function"
    ) {

        createCrackOverlay(
            target
        );

    }

}


/* ======================================================
   UPDATE MINING
====================================================== */

function updateMining(
    delta
) {

    /*
       Nothing to mine if the mouse
       is not being held.
    */

    if (
        !leftMouseDown
    ) {

        return;

    }


    /*
       Don't mine while crafting.
    */

    if (
        typeof craftingOpen !==
        "undefined" &&
        craftingOpen
    ) {

        stopMining();

        return;

    }


    const target =
        getTargetBlock();


    /*
       Player is no longer looking at
       a block.
    */

    if (!target) {

        stopMining();

        return;

    }


    const type =
        target.userData.type;


    /*
       Block cannot be mined with the
       currently selected tool.
    */

    if (
        !canBreak(type)
    ) {

        stopMining();

        return;

    }


    const key =
        target.userData.key;


    /*
       Player changed target block.

       Restart mining.
    */

    if (
        !breaking ||
        breakingKey !== key
    ) {

        breaking =
            true;


        breakingKey =
            key;


        breakingStart =
            performance.now();


        if (
            typeof createCrackOverlay ===
            "function"
        ) {

            createCrackOverlay(
                target
            );

        }

    }


    const elapsed =
        performance.now() -
        breakingStart;


    const progress =
        Math.min(
            1,
            elapsed /
            (BREAK_TIME * 1000)
        );


    /*
       Update crack animation.
    */

    if (
        typeof updateCrackOverlay ===
        "function"
    ) {

        updateCrackOverlay(
            progress
        );

    }


    /*
       Block has finished breaking.
    */

    if (
        progress >= 1
    ) {

        breakBlock(
            target
        );

    }

}


/* ======================================================
   BREAK BLOCK
====================================================== */

function breakBlock(
    target
) {

    if (
        !target ||
        !target.userData.key
    ) {

        stopMining();

        return;

    }


    const key =
        target.userData.key;


    const x =
        target.userData.x;


    const y =
        target.userData.y;


    const z =
        target.userData.z;


    /*
       Make sure the block still exists.
    */

    if (
        !world.has(key)
    ) {

        stopMining();

        return;

    }


    const blockType =
        world.get(key);


    /*
       Remove block from the world.
    */

    world.delete(
        key
    );


    /*
       Remove it from chunk membership.
    */

    if (
        typeof chunkMembers !==
        "undefined"
    ) {

        const chunkX =
            Math.floor(
                x /
                CHUNK_SIZE
            );


        const chunkZ =
            Math.floor(
                z /
                CHUNK_SIZE
            );


        const chunkKey =
            chunkX +
            "," +
            chunkZ;


        const members =
            chunkMembers.get(
                chunkKey
            );


        if (members) {

            members.delete(
                key
            );

        }

    }


    /*
       Remove an old individual mesh
       if one exists.
    */

    if (
        typeof meshes !==
        "undefined" &&
        meshes.has(key)
    ) {

        const mesh =
            meshes.get(key);


        if (
            mesh.parent
        ) {

            mesh.parent.remove(
                mesh
            );

        }


        meshes.delete(
            key
        );

    }


    /*
       Give the block to the player.
    */

    if (
        blockType &&
        typeof addItem ===
        "function"
    ) {

        addItem(
            blockType.name,
            1
        );

    }


    /*
       Rebuild the affected chunk.
    */

    if (
        typeof refreshChunkAroundBlock ===
        "function"
    ) {

        refreshChunkAroundBlock(
            x,
            y,
            z
        );

    }


    stopMining();

}


/* ======================================================
   STOP MINING
====================================================== */

function stopMining() {

    breaking =
        false;


    breakingKey =
        null;


    breakingStart =
        0;


    if (
        typeof removeCrackOverlay ===
        "function"
    ) {

        removeCrackOverlay();

    }

}


/* ======================================================
   GET BLOCK TYPE FROM INVENTORY ITEM
====================================================== */

function getBlockTypeFromItem(
    item
) {

    if (!item) {

        return null;

    }


    if (
        typeof BLOCKS ===
        "undefined"
    ) {

        return null;

    }


    const id =
        item.id ||
        item.type;


    /*
       Direct ID lookup.
    */

    if (
        id &&
        BLOCKS[id]
    ) {

        return BLOCKS[id];

    }


    /*
       Name lookup.
    */

    if (
        item.name
    ) {

        const name =
            item.name
                .toLowerCase()
                .replaceAll(
                    " ",
                    "_"
                );


        if (
            BLOCKS[name]
        ) {

            return BLOCKS[name];

        }

    }


    return null;

}


/* ======================================================
   PLACE BLOCK
====================================================== */

function placeBlock() {

    if (
        typeof getSelectedItem !==
        "function"
    ) {

        return;

    }


    const item =
        getSelectedItem();


    if (!item) {

        return;

    }


    /*
       Tools cannot be placed.
    */

    if (
        item.type === "pickaxe"
    ) {

        return;

    }


    /*
       Sticks cannot be placed.
    */

    if (
        item.type === "sticks"
    ) {

        return;

    }


    /*
       Make sure an item actually exists.
    */

    if (
        item.amount !==
        undefined &&
        item.amount <= 0
    ) {

        return;

    }


    const target =
        getTargetBlock();


    if (!target) {

        return;

    }


    const normal =
        target.userData.faceNormal;


    if (!normal) {

        return;

    }


    const x =
        target.userData.x +
        Math.round(
            normal.x
        );


    const y =
        target.userData.y +
        Math.round(
            normal.y
        );


    const z =
        target.userData.z +
        Math.round(
            normal.z
        );


    const key =
        blockKey(
            x,
            y,
            z
        );


    /*
       Don't place inside an existing block.
    */

    if (
        world.has(key)
    ) {

        return;

    }


    /*
       Don't place a block inside the player.
    */

    const bottom =
        camera.position.y -
        EYE_HEIGHT;


    const intersectsPlayer =

        x + 1 >
        camera.position.x -
        PLAYER_RADIUS &&

        x <
        camera.position.x +
        PLAYER_RADIUS &&

        y + 1 >
        bottom &&

        y <
        bottom +
        PLAYER_HEIGHT &&

        z + 1 >
        camera.position.z -
        PLAYER_RADIUS &&

        z <
        camera.position.z +
        PLAYER_RADIUS;


    if (
        intersectsPlayer
    ) {

        return;

    }


    const blockType =
        getBlockTypeFromItem(
            item
        );


    if (!blockType) {

        return;

    }


    /*
       Add block to the world.
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

    if (
        item.amount !==
        undefined
    ) {

        item.amount--;

    }


    /*
       Refresh hotbar.
    */

    if (
        typeof updateHotbar ===
        "function"
    ) {

        updateHotbar();

    }

    else if (
        typeof updateHotbarUI ===
        "function"
    ) {

        updateHotbarUI();

    }

}


/* ======================================================
   MOUSE DOWN
====================================================== */

document.addEventListener(
    "mousedown",
    function(event) {

        /*
           Don't interact while crafting.
        */

        if (
            typeof craftingOpen !==
            "undefined" &&
            craftingOpen
        ) {

            return;

        }


        /*
           LEFT CLICK
           = START MINING
        */

        if (
            event.button === 0
        ) {

            leftMouseDown =
                true;


            startMining();

        }


        /*
           RIGHT CLICK
           = PLACE BLOCK
        */

        if (
            event.button === 2
        ) {

            const target =
                getTargetBlock();


            /*
               Right-click crafting table.
            */

            if (
                target &&
                target.userData.type ===
                BLOCKS.crafting_table
            ) {

                if (
                    typeof openCraftingTable ===
                    "function"
                ) {

                    openCraftingTable();

                }


                return;

            }


            placeBlock();

        }

    }
);


/* ======================================================
   MOUSE UP
====================================================== */

document.addEventListener(
    "mouseup",
    function(event) {

        if (
            event.button === 0
        ) {

            leftMouseDown =
                false;


            stopMining();

        }

    }
);


/* ======================================================
   DISABLE BROWSER RIGHT-CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);
