/*
=========================================================
BLOCKWORLD
Hidden Block Culling
=========================================================

Blocks that are completely surrounded by other blocks
do not need a visible THREE.Mesh.

The block still exists in the world Map, so:

- Collision still works
- World data stays intact
- Hidden blocks can become visible after mining
- Hidden blocks can become hidden again after placing

=========================================================
*/


/* ======================================================
   SAVE ORIGINAL ADD BLOCK
====================================================== */

/*
   By the time this file loads, ore_visuals.js has already
   wrapped addBlock.

   Keeping that version means revealed ore blocks still
   receive their special ore textures.
*/

const cullingOriginalAddBlock =
    addBlock;


/* ======================================================
   BLOCK NEIGHBORS
====================================================== */

const CULLING_NEIGHBORS = [

    [1, 0, 0],

    [-1, 0, 0],

    [0, 1, 0],

    [0, -1, 0],

    [0, 0, 1],

    [0, 0, -1]

];


/* ======================================================
   CHECK IF BLOCK IS EXPOSED
====================================================== */

function isBlockExposed(
    x,
    y,
    z
) {

    /*
       A block is visible if at least one of its six
       neighboring positions is empty.
    */

    for (
        const offset of CULLING_NEIGHBORS
    ) {

        const nx =
            x + offset[0];

        const ny =
            y + offset[1];

        const nz =
            z + offset[2];


        const neighborKey =
            blockKey(
                nx,
                ny,
                nz
            );


        /*
           Empty neighboring space means
           this block needs a mesh.
        */

        if (
            !world.has(
                neighborKey
            )
        ) {

            return true;

        }

    }


    /*
       All six sides are blocked.
    */

    return false;

}


/* ======================================================
   DISPOSE MATERIAL
====================================================== */

function disposeCullingMaterial(
    material
) {

    if (!material) {
        return;
    }


    /*
       Handle materials such as crafting tables
       which use an array of materials.
    */

    if (
        Array.isArray(
            material
        )
    ) {

        material.forEach(
            item => {

                if (
                    item &&
                    item.map
                ) {

                    item.map.dispose();

                }


                if (item) {

                    item.dispose();

                }

            }
        );

        return;

    }


    if (
        material.map
    ) {

        material.map.dispose();

    }


    material.dispose();

}


/* ======================================================
   REMOVE VISIBLE MESH
====================================================== */

function removeCulledMesh(
    key
) {

    const cube =
        meshes.get(
            key
        );


    if (!cube) {

        return;

    }


    scene.remove(
        cube
    );


    /*
       Dispose geometry.

       Your current world.js gives each block
       its own geometry, so this is safe.
    */

    if (
        cube.geometry
    ) {

        cube.geometry.dispose();

    }


    disposeCullingMaterial(
        cube.material
    );


    meshes.delete(
        key
    );

}


/* ======================================================
   REVEAL EXISTING BLOCK
====================================================== */

function revealCulledBlock(
    x,
    y,
    z
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    /*
       No block exists there.
    */

    if (
        !world.has(
            key
        )
    ) {

        return;

    }


    /*
       It already has a mesh.
    */

    if (
        meshes.has(
            key
        )
    ) {

        return;

    }


    const type =
        world.get(
            key
        );


    if (!type) {

        return;

    }


    /*
       The normal addBlock function refuses to create
       a block when world.has(key) is already true.

       Temporarily remove the data entry, recreate the
       visual mesh, then restore the exact same block data.
    */

    world.delete(
        key
    );


    cullingOriginalAddBlock(
        x,
        y,
        z,
        type
    );


    /*
       cullingOriginalAddBlock restores the world entry.
    */

}


/* ======================================================
   UPDATE ONE BLOCK
====================================================== */

function updateCulledBlock(
    x,
    y,
    z
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    /*
       The block no longer exists.

       Make sure an old mesh is gone.
    */

    if (
        !world.has(
            key
        )
    ) {

        if (
            meshes.has(
                key
            )
        ) {

            removeCulledMesh(
                key
            );

        }

        return;

    }


    /*
       Check whether the block has at least
       one exposed side.
    */

    const exposed =
        isBlockExposed(
            x,
            y,
            z
        );


    /*
       Exposed block needs a mesh.
    */

    if (
        exposed
    ) {

        revealCulledBlock(
            x,
            y,
            z
        );

    }


    /*
       Fully surrounded block does not
       need a mesh.
    */

    else {

        removeCulledMesh(
            key
        );

    }

}


/* ======================================================
   UPDATE BLOCK + NEIGHBORS
====================================================== */

function updateCullingAround(
    x,
    y,
    z
) {

    /*
       Check the block itself.
    */

    updateCulledBlock(
        x,
        y,
        z
    );


    /*
       Check all six neighbors.
    */

    CULLING_NEIGHBORS.forEach(
        offset => {

            updateCulledBlock(

                x + offset[0],

                y + offset[1],

                z + offset[2]

            );

        }
    );

}


/* ======================================================
   REPLACE ADD BLOCK
====================================================== */

/*
   Every time a block is added:

   1. The normal game creates it
   2. We check it and its neighbors
   3. Fully hidden blocks lose their mesh
*/

addBlock =
    function(
        x,
        y,
        z,
        type
    ) {

        cullingOriginalAddBlock(
            x,
            y,
            z,
            type
        );


        /*
           Update visibility.
        */

        updateCullingAround(
            x,
            y,
            z
        );

    };


/* ======================================================
   WRAP BREAK BLOCK
====================================================== */

/*
   Your mining system already has breakBlock().

   We save it and then add one extra step:
   reveal neighboring blocks after a block disappears.
*/

const cullingOriginalBreakBlock =
    breakBlock;


breakBlock =
    function(
        cube
    ) {

        if (!cube) {

            return;

        }


        /*
           Remember the coordinates BEFORE the
           original mining code removes the block.
        */

        const parts =
            String(
                cube.userData.key
            ).split(
                ","
            );


        const x =
            Number(
                parts[0]
            );

        const y =
            Number(
                parts[1]
            );

        const z =
            Number(
                parts[2]
            );


        /*
           Run the normal mining system.
        */

        cullingOriginalBreakBlock(
            cube
        );


        /*
           The block above/below/left/right/front/back
           may have just become visible.
        */

        CULLING_NEIGHBORS.forEach(
            offset => {

                updateCulledBlock(

                    x + offset[0],

                    y + offset[1],

                    z + offset[2]

                );

            }
        );

    };


/* ======================================================
   READY
====================================================== */

console.log(
    "Hidden block culling enabled!"
);