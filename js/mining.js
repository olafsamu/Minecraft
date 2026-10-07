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
   TARGET BLOCK
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


    const step =
        0.02;


    const maxSteps =
        Math.ceil(
            REACH_DISTANCE / step
        );


    let previousX =
        Math.floor(origin.x);

    let previousY =
        Math.floor(origin.y);

    let previousZ =
        Math.floor(origin.z);


    for (
        let i = 0;
        i <= maxSteps;
        i++
    ) {

        const distance =
            i * step;


        const point =
            origin.clone()
                .addScaledVector(
                    direction,
                    distance
                );


        const x =
            Math.floor(point.x);

        const y =
            Math.floor(point.y);

        const z =
            Math.floor(point.z);


        if (
            i > 0 &&
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


        if (
            world.has(key)
        ) {

            const type =
                world.get(key);


            if (!type) {

                return null;

            }


            /*
               Determine the actual face
               that the ray entered.

               We use the hit point instead of
               relying on the movement between
               voxels, which is more reliable
               when looking diagonally.
            */

            const centerX =
                x + 0.5;

            const centerY =
                y + 0.5;

            const centerZ =
                z + 0.5;


            const localX =
                point.x - centerX;

            const localY =
                point.y - centerY;

            const localZ =
                point.z - centerZ;


            const distanceToX =
                0.5 - Math.abs(localX);

            const distanceToY =
                0.5 - Math.abs(localY);

            const distanceToZ =
                0.5 - Math.abs(localZ);


            let faceNormal;


            if (
                distanceToX <=
                    distanceToY &&
                distanceToX <=
                    distanceToZ
            ) {

                faceNormal =
                    new THREE.Vector3(
                        localX >= 0
                            ? 1
                            : -1,
                        0,
                        0
                    );

            }

            else if (
                distanceToY <=
                    distanceToZ
            ) {

                faceNormal =
                    new THREE.Vector3(
                        0,
                        localY >= 0
                            ? 1
                            : -1,
                        0
                    );

            }

            else {

                faceNormal =
                    new THREE.Vector3(
                        0,
                        0,
                        localZ >= 0
                            ? 1
                            : -1
                    );

            }


            targetProxy.position.set(
                centerX,
                centerY,
                centerZ
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
                faceNormal;


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
   CAN BREAK?
====================================================== */

function canBreak(
    type
) {

    if (!type) {

        return false;

    }


    /*
       Hand-breakable blocks.
    */

    if (
        type.requiresTool === false
    ) {

        return true;

    }


    /*
       Pickaxe blocks.
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
       The player looked at a different block.
       Restart the mining timer.
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

    if (
        !target
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


    if (
        !world.has(key)
    ) {

        stopMining();

        return;

    }


    const blockType =
        world.get(key);


    /*
       Remove world data.
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


        meshes.delete(key);

    }


    /*
       Give the item to the player.
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
       Update chunks.
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


    if (!normal) {

        return;

    }


    const x =
        target.userData.x +
        Math.round(normal.x);


    const y =
        target.userData.y +
        Math.round(normal.y);


    const z =
        target.userData.z +
        Math.round(normal.z);


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


    /*
       Prevent placing a block inside
       the player.
    */

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
   MOUSE DOWN
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


            /*
               Crafting table interaction.
            */

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
   RIGHT CLICK MENU
====================================================== */

document.addEventListener(
    "contextmenu",
    function(event) {

        event.preventDefault();

    }
);
