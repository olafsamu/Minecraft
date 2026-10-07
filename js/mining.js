/*
=========================================================
BLOCKWORLD
Mining + Block Placement
=========================================================
*/


/* ======================================================
   SETTINGS
====================================================== */

const REACH_DISTANCE = 6;

const DEFAULT_BREAK_TIME = 500;


/* ======================================================
   MINING STATE
====================================================== */

let targetedBlock = null;

let breaking = false;

let breakingKey = null;

let breakingStart = 0;

let currentBreakTime =
    DEFAULT_BREAK_TIME;

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


    /*
       Current voxel.
    */

    let x =
        Math.floor(origin.x);

    let y =
        Math.floor(origin.y);

    let z =
        Math.floor(origin.z);


    /*
       Direction through the voxel grid.
    */

    const stepX =
        direction.x > 0
            ? 1
            : direction.x < 0
                ? -1
                : 0;

    const stepY =
        direction.y > 0
            ? 1
            : direction.y < 0
                ? -1
                : 0;

    const stepZ =
        direction.z > 0
            ? 1
            : direction.z < 0
                ? -1
                : 0;


    /*
       Distance along the ray to the next
       voxel boundary.
    */

    let tMaxX;

    let tMaxY;

    let tMaxZ;


    let tDeltaX;

    let tDeltaY;

    let tDeltaZ;


    if (
        stepX !== 0
    ) {

        const nextBoundaryX =
            stepX > 0
                ? x + 1
                : x;

        tMaxX =
            (
                nextBoundaryX -
                origin.x
            ) /
            direction.x;

        tDeltaX =
            1 /
            Math.abs(
                direction.x
            );

    } else {

        tMaxX =
            Infinity;

        tDeltaX =
            Infinity;

    }


    if (
        stepY !== 0
    ) {

        const nextBoundaryY =
            stepY > 0
                ? y + 1
                : y;

        tMaxY =
            (
                nextBoundaryY -
                origin.y
            ) /
            direction.y;

        tDeltaY =
            1 /
            Math.abs(
                direction.y
            );

    } else {

        tMaxY =
            Infinity;

        tDeltaY =
            Infinity;

    }


    if (
        stepZ !== 0
    ) {

        const nextBoundaryZ =
            stepZ > 0
                ? z + 1
                : z;

        tMaxZ =
            (
                nextBoundaryZ -
                origin.z
            ) /
            direction.z;

        tDeltaZ =
            1 /
            Math.abs(
                direction.z
            );

    } else {

        tMaxZ =
            Infinity;

        tDeltaZ =
            Infinity;

    }


    /*
       Face normal of the face we entered through.
    */

    let faceNormal =
        new THREE.Vector3(
            0,
            0,
            0
        );


    /*
       Maximum number of voxel crossings.
    */

    const maxSteps =
        REACH_DISTANCE * 4;


    for (
        let i = 0;
        i < maxSteps;
        i++
    ) {

        /*
           Check the current voxel.
        */

        const key =
            blockKey(
                x,
                y,
                z
            );


        if (
            world.has(key)
        ) {

            const type =
                world.get(key);


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

            tMaxX += tDeltaX;

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

            tMaxY += tDeltaY;

            faceNormal.set(
                0,
                -stepY,
                0
            );

        }

        else {

            z += stepZ;

            tMaxZ += tDeltaZ;

            faceNormal.set(
                0,
                0,
                -stepZ
            );

        }


        /*
           Stop once we've travelled beyond
           the player's reach.
        */

        const distance =
            Math.min(
                tMaxX,
                tMaxY,
                tMaxZ
            );


        if (
            distance >
            REACH_DISTANCE
        ) {

            break;

        }

    }


    targetedBlock =
        null;


    return null;

}


/* ======================================================
   CAN BREAK?
====================================================== */

function canBreak(
    type
) {

    if (!type) {

        return false;

    }


    /*
       Hand-breakable.
    */

    if (
        type.requiresTool === false
    ) {

        return true;

    }


    /*
       Pickaxe required.
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


        const item =
            getSelectedItem();


        if (!item) {

            return false;

        }


        return (
            item.type === "pickaxe"
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


    breaking =
        true;


    breakingKey =
        target.userData.key;


    breakingStart =
        performance.now();


    currentBreakTime =
        typeof type.breakTime ===
        "number"
            ? type.breakTime
            : DEFAULT_BREAK_TIME;


    if (
        typeof createCrackOverlay ===
        "function"
    ) {

        createCrackOverlay(
            target,
            target.userData.faceNormal
        );

    }

}


/* ======================================================
   UPDATE MINING
====================================================== */

function updateMining(
    delta
) {

    if (
        !leftMouseDown
    ) {

        return;

    }


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
       New block = restart mining.
    */

    if (
        !breaking ||
        breakingKey !== key
    ) {

        startMining();

        return;

    }


    const elapsed =
        performance.now() -
        breakingStart;


    const progress =
        Math.min(
            1,
            elapsed /
            currentBreakTime
        );


    if (
        typeof updateCrackOverlay ===
        "function"
    ) {

        updateCrackOverlay(
            progress
        );

    }


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

    if (!target) {

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


    if (
        !world.has(key)
    ) {

        stopMining();

        return;

    }


    const blockType =
        world.get(key);


    /*
       Remove from world.
    */

    world.delete(
        key
    );


    /*
       Remove chunk membership.
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
       Remove special mesh if present.
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
       Add block to inventory.
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
       Refresh affected chunks.
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


    currentBreakTime =
        DEFAULT_BREAK_TIME;


    if (
        typeof removeCrackOverlay ===
        "function"
    ) {

        removeCrackOverlay();

    }

}


/* ======================================================
   GET BLOCK FROM ITEM
====================================================== */

function getBlockTypeFromItem(
    item
) {

    if (
        !item ||
        typeof BLOCKS ===
        "undefined"
    ) {

        return null;

    }


    const id =
        item.id ||
        item.type;


    if (
        id &&
        BLOCKS[id]
    ) {

        return BLOCKS[id];

    }


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


    if (
        item.type === "pickaxe" ||
        item.type === "sticks"
    ) {

        return;

    }


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


    if (
        !normal
    ) {

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


    if (
        world.has(key)
    ) {

        return;

    }


    const bottom =
        camera.position.y -
        EYE_HEIGHT;


    const insidePlayer =

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
        insidePlayer
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


    addBlock(
        x,
        y,
        z,
        blockType
    );


    if (
        item.amount !==
        undefined
    ) {

        item.amount--;

    }


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

        if (
            typeof craftingOpen !==
            "undefined" &&
            craftingOpen
        ) {

            return;

        }


        /*
           LEFT CLICK = MINE
        */

        if (
            event.button === 0
        ) {

            leftMouseDown =
                true;

            startMining();

        }


        /*
           RIGHT CLICK = PLACE
        */

        if (
            event.button === 2
        ) {

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
   DISABLE RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);
