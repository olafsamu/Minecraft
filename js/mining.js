/*
=========================================================
BLOCKWORLD
Mining + Block Placement
Clean Chunk-Compatible Version
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

/*
   Uses a simple ray march through the voxel world.

   This is intentionally simple:
   - reliable
   - easy to debug
   - only 6 blocks of reach
   - does not raycast every rendered mesh
*/

function getTargetBlock() {

    const origin =
        camera.position.clone();


    const direction =
        new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    direction.normalize();


    const stepSize =
        0.05;


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


        if (
            distance >
            REACH_DISTANCE
        ) {

            break;

        }


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
           Skip the same voxel.
        */

        if (
            x === previousX &&
            y === previousY &&
            z === previousZ
        ) {

            continue;

        }


        previousX =
            x;

        previousY =
            y;

        previousZ =
            z;


        const key =
            blockKey(
                x,
                y,
                z
            );


        /*
           Did we hit a block?
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


            /*
               Determine which face was entered.

               This is needed for block placement.
            */

            const previousPoint =
                origin.clone()
                    .addScaledVector(
                        direction,
                        Math.max(
                            0,
                            distance - stepSize
                        )
                    );


            const previousVoxelX =
                Math.floor(
                    previousPoint.x
                );


            const previousVoxelY =
                Math.floor(
                    previousPoint.y
                );


            const previousVoxelZ =
                Math.floor(
                    previousPoint.z
                );


            const faceNormal =
                new THREE.Vector3(

                    previousVoxelX - x,

                    previousVoxelY - y,

                    previousVoxelZ - z

                );


            /*
               If the previous voxel could not
               determine the face, use the dominant
               direction of the camera ray.
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


            targetProxy.userData.faceNormal =
                faceNormal;


            targetedBlock =
                targetProxy;


            return targetProxy;

        }

    }


    targetedBlock =
        null;


    return null;

}


/* ======================================================
   CAN BREAK
====================================================== */

function canBreak(
    type
) {

    if (!type) {

        return false;

    }


    /*
       Normal blocks.
    */

    if (
        type.breakable === true
    ) {

        return true;

    }


    /*
       Blocks requiring a pickaxe.
    */

    if (
        type.breakable === "pickaxe"
    ) {

        /*
           Check the selected hotbar item.
        */

        if (
            typeof hotbar === "undefined"
        ) {

            return false;

        }


        if (
            typeof selectedBlock === "undefined"
        ) {

            return false;

        }


        const selectedItem =
            hotbar[
                selectedBlock
            ];


        if (!selectedItem) {

            return false;

        }


        return (
            selectedItem.id ===
            "wood_pickaxe"
        );

    }


    /*
       Also support the older
       requiresTool system.
    */

    if (
        type.requiresTool
    ) {

        if (
            typeof hotbar === "undefined"
        ) {

            return false;

        }


        if (
            typeof selectedBlock === "undefined"
        ) {

            return false;

        }


        const selectedItem =
            hotbar[
                selectedBlock
            ];


        if (!selectedItem) {

            return false;

        }


        if (
            type.requiredTool ===
            "pickaxe"
        ) {

            return (
                selectedItem.id ===
                "wood_pickaxe"
            );

        }


        return false;

    }


    return false;

}


/* ======================================================
   START MINING
====================================================== */

function startMining() {

    console.log("MINING: left click detected");


    const target =
        getTargetBlock();


    console.log(
        "MINING: target =",
        target
    );


    if (!target) {

        console.log(
            "MINING: NO BLOCK TARGETED"
        );

        return;

    }


    console.log(
        "MINING: BLOCK TARGETED:",
        target.userData.type,
        target.userData.key
    );


    breaking =
        true;


    breakingKey =
        target.userData.key;


    breakingStart =
        performance.now();


    console.log(
        "MINING: STARTED"
    );

}


/* ======================================================
   UPDATE MINING
====================================================== */

function updateMining(
    delta
) {

    /*
       Stop if the mouse is no longer held.
    */

    if (
        !mouseLocked ||
        (
            typeof craftingOpen !==
            "undefined" &&
            craftingOpen
        ) ||
        !leftMouseDown
    ) {

        stopMining();

        return;

    }


    const target =
        getTargetBlock();


    /*
       Player stopped looking at a block.
    */

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
       Player moved the crosshair
       onto another block.
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

    }


    const elapsed =
        performance.now() -
        breakingStart;


    const progress =
        Math.min(

            1,

            elapsed /
            (
                BREAK_TIME *
                1000
            )

        );


    /*
       Use the existing crack system
       if it exists.
    */

    if (
        typeof drawCracks ===
        "function"
    ) {

        drawCracks(
            Math.max(
                0.1,
                progress
            )
        );

    }


    /*
       Keep compatibility with
       crackMesh systems.
    */

    if (
        typeof crackMesh !==
        "undefined" &&
        crackMesh
    ) {

        crackMesh.position.set(

            target.userData.x +
            0.5,

            target.userData.y +
            0.5,

            target.userData.z +
            0.5

        );


        crackMesh.visible =
            true;

    }


    /*
       Optional breaking text.
    */

    const breakingText =
        document.getElementById(
            "breakingText"
        );


    if (
        breakingText
    ) {

        breakingText.classList.add(
            "show"
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


    const x =
        target.userData.x;


    const y =
        target.userData.y;


    const z =
        target.userData.z;


    const key =
        target.userData.key;


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
       Remove special mesh if one exists.
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
       Remove from chunk membership.
    */

    if (
        typeof removeBlockFromChunkMembers ===
        "function"
    ) {

        removeBlockFromChunkMembers(
            x,
            y,
            z
        );

    }

    else if (
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
       Give the block to the player.
    */

    if (
        typeof addItem ===
        "function"
    ) {

        addItem(

            blockType.name,

            1

        );

    }

    else if (
        typeof inventory !==
        "undefined" &&
        blockType.id
    ) {

        if (
            inventory[
                blockType.id
            ] !==
            undefined
        ) {

            inventory[
                blockType.id
            ]++;

        }


        if (
            typeof updateHotbar ===
            "function"
        ) {

            updateHotbar();

        }

    }


    /*
       Rebuild affected chunks.
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


    if (
        typeof showMessage ===
        "function"
    ) {

        showMessage(

            "Collected " +
            blockType.name +
            "!"

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


    /*
       Hide old crack mesh.
    */

    if (
        typeof crackMesh !==
        "undefined" &&
        crackMesh
    ) {

        crackMesh.visible =
            false;

    }


    /*
       Hide breaking text.
    */

    const breakingText =
        document.getElementById(
            "breakingText"
        );


    if (
        breakingText
    ) {

        breakingText.classList.remove(
            "show"
        );

    }

}


/* ======================================================
   PLACE BLOCK
====================================================== */

function placeBlock() {

    const target =
        getTargetBlock();


    if (!target) {

        return;

    }


    if (
        typeof hotbar ===
        "undefined"
    ) {

        return;

    }


    const item =
        hotbar[
            selectedBlock
        ];


    if (
        !item ||
        !item.placeable
    ) {

        if (
            typeof showMessage ===
            "function"
        ) {

            showMessage(
                "That item cannot be placed."
            );

        }

        return;

    }


    if (
        typeof inventory ===
        "undefined"
    ) {

        return;

    }


    if (
        !inventory[item.id] ||
        inventory[item.id] <= 0
    ) {

        if (
            typeof showMessage ===
            "function"
        ) {

            showMessage(

                "You don't have any " +
                item.name +
                "!"

            );

        }

        return;

    }


    /*
       Use the face detected by the voxel ray.
    */

    const normal =
        target.userData.faceNormal;


    if (!normal) {

        return;

    }


    const x =
        target.userData.x +
        normal.x;


    const y =
        target.userData.y +
        normal.y;


    const z =
        target.userData.z +
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
        world.has(key)
    ) {

        return;

    }


    /*
       Player collision box.
    */

    const bottom =
        camera.position.y -
        EYE_HEIGHT;


    if (

        camera.position.x +
            PLAYER_RADIUS >
            x &&

        camera.position.x -
            PLAYER_RADIUS <
            x + 1 &&

        camera.position.z +
            PLAYER_RADIUS >
            z &&

        camera.position.z -
            PLAYER_RADIUS <
            z + 1 &&

        bottom +
            PLAYER_HEIGHT >
            y &&

        bottom <
            y + 1

    ) {

        if (
            typeof showMessage ===
            "function"
        ) {

            showMessage(
                "You cannot place a block here!"
            );

        }

        return;

    }


    /*
       Add through the chunk-aware
       world system.
    */

    addBlock(

        x,

        y,

        z,

        item

    );


    /*
       Remove one item.
    */

    inventory[item.id]--;


    if (
        inventory[item.id] <= 0
    ) {

        inventory[item.id] =
            0;

    }


    if (
        typeof updateHotbar ===
        "function"
    ) {

        updateHotbar();

    }


    if (
        typeof showMessage ===
        "function"
    ) {

        showMessage(

            "Placed " +
            item.name

        );

    }

}


/* ======================================================
   MOUSE DOWN
====================================================== */

document.addEventListener(
    "mousedown",
    function(event) {

        /*
           Crafting table currently open.
        */

        if (
            typeof craftingOpen !==
            "undefined" &&
            craftingOpen
        ) {

            return;

        }


        /*
           Left mouse = mining.
        */

        if (
            event.button === 0 &&
            mouseLocked
        ) {

            leftMouseDown =
                true;


            startMining();

        }


        /*
           Right mouse = placement.
        */

        if (
            event.button === 2 &&
            mouseLocked
        ) {

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
   DISABLE RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);