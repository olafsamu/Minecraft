/*
=========================================================
BLOCKWORLD
Mining + Block Placement
Clean Chunk-Compatible Version
=========================================================

This file handles:

- Looking at blocks
- Breaking blocks
- Block placement
- Mouse input

Terrain blocks are stored in the voxel world and rendered
through the chunk system, so we do NOT raycast meshes.
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
   Invisible compatibility mesh.

   The actual terrain does NOT use this mesh.
   It simply gives the crack system a position.
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
   GET TARGET BLOCK
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


    /*
       Small-step voxel ray.

       Six blocks of reach with 0.05 steps
       means only 120 checks.
    */

    const stepSize = 0.05;

    const steps =
        Math.ceil(
            REACH_DISTANCE /
            stepSize
        );


    /*
       Remember the previous voxel.

       This lets us determine which face was hit,
       which is needed for block placement.
    */

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
           Ignore repeated checks of the same voxel.
        */

        if (
            x === previousX &&
            y === previousY &&
            z === previousZ &&
            i !== 0
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
           Did we hit a real block?
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

                targetedBlock =
                    null;

                return null;

            }


            /*
               Work out the face we entered through.
            */

            let faceNormal =
                new THREE.Vector3(
                    previousX - x,
                    previousY - y,
                    previousZ - z
                );


            /*
               If there is no useful previous voxel,
               use the dominant camera direction.
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
               Store target information.
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
   CHECK IF BLOCK CAN BE BROKEN
====================================================== */

function canBreak(
    type
) {

    if (!type) {

        return false;

    }


    /*
       Most normal blocks are breakable by hand.
    */

    if (
        type.breakable === true
    ) {

        return true;

    }


    /*
       Some versions of blocks.js may use
       "pickaxe" as the breakable value.
    */

    if (
        type.breakable === "pickaxe"
    ) {

        const selected =
            typeof getSelectedItem ===
            "function"
                ? getSelectedItem()
                : null;


        if (!selected) {

            return false;

        }


        /*
           Support several possible naming styles
           for the wooden pickaxe.
        */

        return (
            selected.type === "pickaxe" ||
            selected.type === "wood_pickaxe" ||
            selected.id === "wood_pickaxe"
        );

    }


    /*
       Also support requiresTool / requiredTool,
       if blocks.js uses that structure.
    */

    if (
        type.requiresTool
    ) {

        const selected =
            typeof getSelectedItem ===
            "function"
                ? getSelectedItem()
                : null;


        if (!selected) {

            return false;

        }


        if (
            type.requiredTool === "pickaxe"
        ) {

            return (
                selected.type === "pickaxe" ||
                selected.type === "wood_pickaxe" ||
                selected.id === "wood_pickaxe"
            );

        }

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
       Start the crack visual if available.
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
       Mining only happens while left mouse
       is being held.
    */

    if (
        !leftMouseDown
    ) {

        return;

    }


    /*
       If crafting is open, don't mine.
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


    if (!target) {

        stopMining();

        return;

    }


    const type =
        target.userData.type;


    if (
        !canBreak(type)
    ) {

        stopMining();

        return;

    }


    const key =
        target.userData.key;


    /*
       Looking at another block starts
       a new mining operation.
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
       Update crack visual.
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
       Finished!
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
       Remove from world data.
    */

    world.delete(
        key
    );


    /*
       Remove from chunk membership.
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


        const cKey =
            chunkX +
            "," +
            chunkZ;


        const members =
            chunkMembers.get(
                cKey
            );


        if (members) {

            members.delete(
                key
            );

        }

    }


    /*
       Remove an old individual mesh if one exists.

       Important:
       We do NOT dispose shared terrain geometry.
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
       Give the block to the inventory.
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


    /*
       Stop mining.
    */

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
   GET BLOCK TYPE FROM ITEM
====================================================== */

function getBlockTypeFromItem(
    item
) {

    if (!item) {

        return null;

    }


    const id =
        item.id ||
        item.type;


    if (
        typeof BLOCKS ===
        "undefined"
    ) {

        return null;

    }


    if (
        BLOCKS[id]
    ) {

        return BLOCKS[id];

    }


    /*
       Some inventory systems use names
       instead of IDs.
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
       Tools and non-placeable items
       cannot be placed.
    */

    if (
        item.placeable === false
    ) {

        return;

    }


    if (
        item.placeable ===
        undefined &&
        (
            item.type === "pickaxe" ||
            item.type === "sticks"
        )
    ) {

        return;

    }


    /*
       Make sure there is actually an item.
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
       Don't place inside another block.
    */

    if (
        world.has(key)
    ) {

        return;

    }


    /*
       Player collision check.
    */

    const bottom =
        camera.position.y -
        EYE_HEIGHT;


    if (

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
        PLAYER_RADIUS

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
       Add through the chunk system.
    */

    addBlock(
        x,
        y,
        z,
        blockType
    );


    /*
       Remove one item from the selected slot.
    */

    if (
        item.amount !==
        undefined
    ) {

        item.amount--;

    }


    /*
       Update inventory UI.
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
   MOUSE INPUT
====================================================== */

document.addEventListener(
    "mousedown",
    function(event) {

        /*
           Don't interact with the world
           while a crafting menu is open.
        */

        if (
            typeof craftingOpen !==
            "undefined" &&
            craftingOpen
        ) {

            return;

        }


        /*
           LEFT CLICK = MINING
        */

        if (
            event.button === 0
        ) {

            leftMouseDown =
                true;


            startMining();

        }


        /*
           RIGHT CLICK = PLACING
        */

        if (
            event.button === 2
        ) {

            /*
               If the right-clicked block is a
               crafting table, open it instead.
            */

            const target =
                getTargetBlock();


            if (
                target &&
                typeof BLOCKS !==
                "undefined" &&
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
   MOUSE RELEASE
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
   PREVENT RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);
