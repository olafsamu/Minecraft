/*
=========================================================
BLOCKWORLD
Mining + Block Placement
Chunk-Compatible Version
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
   VOXEL RAYCAST
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
       Prevent division-by-zero problems.
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


    let faceNormal =
        new THREE.Vector3();


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


    targetedBlock =
        null;


    return null;

}


    /*
       Walk through the world in tiny steps.

       This is deliberately simple and reliable.
       Six blocks of reach at 0.05-block steps
       is only 120 checks.
    */

    const step =
        0.05;


    for (
        let distance = 0;
        distance <= REACH_DISTANCE;
        distance += step
    ) {

        const point =
            origin.clone().addScaledVector(
                direction,
                distance
            );


        const x =
            Math.floor(point.x);

        const y =
            Math.floor(point.y);

        const z =
            Math.floor(point.z);


    /*
    Small step size gives reliable voxel targeting.
    */
    const stepSize = 0.05;


    const steps =
        Math.ceil(
            REACH_DISTANCE /
            stepSize
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


        const position =
            start.clone().addScaledVector(
                direction,
                distance
            );


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


<<<<<<< HEAD
        /*
           Did we hit a block?
        */

=======
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173
        if (
            world.has(key)
        ) {

            const type =
                world.get(key);


<<<<<<< HEAD
            if (!type) {
                return null;
            }


            /*
               Store everything mining needs.
            */

            targetProxy.position.set(

                x + 0.5,

                y + 0.5,

                z + 0.5

            );


=======
            /*
            Store target information.
            */
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173
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


<<<<<<< HEAD
            /*
               Calculate the face we entered.

               This is mainly needed for block placement.
            */

            const previousPoint =
                origin.clone().addScaledVector(
                    direction,
                    Math.max(
                        0,
                        distance - step
                    )
                );
=======
            targetedBlock =
                targetProxy;
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173


<<<<<<< HEAD
            const previousX =
                Math.floor(
                    previousPoint.x
                );

            const previousY =
                Math.floor(
                    previousPoint.y
                );

            const previousZ =
                Math.floor(
                    previousPoint.z
                );


            const faceNormal =
                new THREE.Vector3(

                    previousX - x,

                    previousY - y,

                    previousZ - z

                );


            /*
               If we entered through exactly the same
               voxel because of the first step, determine
               the dominant direction instead.
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
=======
            /*
            Keep the proxy positioned correctly
            for the crack overlay.
            */
            targetProxy.position.set(
                x + 0.5,
                y + 0.5,
                z + 0.5
            );
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173

<<<<<<< HEAD
                const az =
                    Math.abs(
                        direction.z
                    );
=======
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173

<<<<<<< HEAD

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
=======
            return targetProxy;
        }
>>>>>>> 47a8facad26dd03af3d1122f7c045cee8a4b3173
    }


    targetedBlock =
        null;


    return null;
}


/* ======================================================
   CAN THE PLAYER BREAK THIS BLOCK?
   ====================================================== */

function canBreak(
    type
) {

    if (
        !type
    ) {
        return false;
    }


    /*
    Normal breakable blocks.
    */
    if (
        type.breakable === true
    ) {
        return true;
    }


    /*
    Stone / ore blocks requiring a pickaxe.
    */
    if (
        type.breakable ===
        "pickaxe"
    ) {

        return (
            typeof inventory !==
                "undefined" &&

            typeof hotbar !==
                "undefined" &&

            typeof selectedBlock !==
                "undefined" &&

            inventory.wood_pickaxe > 0 &&

            hotbar[selectedBlock] &&

            hotbar[selectedBlock].id ===
                "wood_pickaxe"
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


    if (
        !target
    ) {

        stopMining();

        return;
    }


    const type =
        target.userData.type;


    if (
        !canBreak(type)
    ) {

        stopMining();


        if (
            type &&
            type.id === "stone"
        ) {

            showMessage(
                "You need a wooden pickaxe to break stone!"
            );

        } else {

            showMessage(
                "You cannot break this!"
            );
        }


        return;
    }


    const key =
        target.userData.key;


    /*
    Start a new block.
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
}


/* ======================================================
   UPDATE MINING
   ====================================================== */

function updateMining(
    delta
) {

    /*
    Mouse must still be held.
    */
    if (
        !mouseLocked ||
        craftingOpen ||
        !leftMouseDown
    ) {

        stopMining();

        return;
    }


    const target =
        getTargetBlock();


    if (
        !target
    ) {

        stopMining();

        return;
    }


    const type =
        target.userData.type;


    if (
        !canBreak(type)
    ) {

        stopMining();


        if (
            type &&
            type.id === "stone"
        ) {

            showMessage(
                "You need a wooden pickaxe to break stone!"
            );

        }

        return;
    }


    const key =
        target.userData.key;


    /*
    Looking at a different block
    starts a new mining operation.
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
            (BREAK_TIME * 1000)
        );


    /*
    Show breaking cracks.
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


    if (
        typeof crackMesh !==
        "undefined"
    ) {

        crackMesh.position.set(
            target.userData.x + 0.5,
            target.userData.y + 0.5,
            target.userData.z + 0.5
        );


        crackMesh.visible =
            true;
    }


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
    Block is finished.
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
    Remove from the actual world data.
    */
    world.delete(key);


    /*
    Remove old special mesh if this block
    is one of the non-instanced block types.
    */
    if (
        meshes &&
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


        meshes.delete(key);
    }


    /*
    Update chunk membership.

    The chunk renderer should rebuild the
    affected chunk and its neighbors.
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

    } else if (
        typeof chunkMembers !==
        "undefined"
    ) {

        const chunkX =
            Math.floor(
                x / CHUNK_SIZE
            );

        const chunkZ =
            Math.floor(
                z / CHUNK_SIZE
            );


        const chunkKey =
            chunkX +
            "," +
            chunkZ;


        const members =
            chunkMembers.get(
                chunkKey
            );


        if (
            members
        ) {

            members.delete(key);
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

    } else if (
        typeof inventory !==
            "undefined" &&
        blockType.id
    ) {

        if (
            inventory[blockType.id] !==
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
    Rebuild the changed chunk and
    surrounding chunk borders.
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


    showMessage(
        "Collected " +
        blockType.name +
        "!"
    );


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
        typeof crackMesh !==
        "undefined"
    ) {

        crackMesh.visible =
            false;
    }


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


    if (
        !target
    ) {
        return;
    }


    const item =
        hotbar[selectedBlock];


    if (
        !item ||
        !item.placeable
    ) {

        showMessage(
            "That item cannot be placed."
        );

        return;
    }


    if (
        !inventory[item.id] ||
        inventory[item.id] <= 0
    ) {

        showMessage(
            "You don't have any " +
            item.name +
            "!"
        );

        return;
    }


    const x =
        target.userData.x;

    const y =
        target.userData.y;

    const z =
        target.userData.z;


    /*
    Determine which face the player is
    looking at from the ray direction.

    We use the point where the ray first
    entered the target block.
    */
    const direction =
        new THREE.Vector3();

    camera.getWorldDirection(
        direction
    );

    direction.normalize();


    const center =
        new THREE.Vector3(
            x + 0.5,
            y + 0.5,
            z + 0.5
        );


    const relative =
        camera.position.clone()
            .sub(center);


    let faceX = 0;
    let faceY = 0;
    let faceZ = 0;


    if (
        Math.abs(relative.x) >
        Math.abs(relative.y) &&

        Math.abs(relative.x) >
        Math.abs(relative.z)
    ) {

        faceX =
            relative.x > 0
                ? 1
                : -1;

    } else if (
        Math.abs(relative.y) >
        Math.abs(relative.z)
    ) {

        faceY =
            relative.y > 0
                ? 1
                : -1;

    } else {

        faceZ =
            relative.z > 0
                ? 1
                : -1;
    }


    const placeX =
        x + faceX;

    const placeY =
        y + faceY;

    const placeZ =
        z + faceZ;


    /*
    Do not place inside the player.
    */
    const bottom =
        camera.position.y -
        EYE_HEIGHT;


    if (
        camera.position.x +
            PLAYER_RADIUS >
            placeX &&

        camera.position.x -
            PLAYER_RADIUS <
            placeX + 1 &&

        camera.position.z +
            PLAYER_RADIUS >
            placeZ &&

        camera.position.z -
            PLAYER_RADIUS <
            placeZ + 1 &&

        bottom +
            PLAYER_HEIGHT >
            placeY &&

        bottom <
            placeY + 1
    ) {

        showMessage(
            "You cannot place a block here!"
        );

        return;
    }


    /*
    Do not place inside an existing block.
    */
    if (
        world.has(
            blockKey(
                placeX,
                placeY,
                placeZ
            )
        )
    ) {

        return;
    }


    /*
    Add through the chunk-aware system.
    */
    addBlock(
        placeX,
        placeY,
        placeZ,
        item
    );


    inventory[item.id]--;


    updateHotbar();


    showMessage(
        "Placed " +
        item.name
    );
}


/* ======================================================
   MOUSE INPUT
   ====================================================== */

document.addEventListener(
    "mousedown",
    function(event) {

        if (
            craftingOpen
        ) {

            return;
        }


        if (
            event.button === 0 &&
            mouseLocked
        ) {

            leftMouseDown =
                true;

            startMining();
        }


        if (
            event.button === 2 &&
            mouseLocked
        ) {

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
   PREVENT CONTEXT MENU
   ====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();
    }
);