/*
=========================================================
BLOCKWORLD
Hidden Block Culling
=========================================================
*/


/* ======================================================
   SAVE ORIGINAL ADD BLOCK
====================================================== */

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
   CHECK BLOCK EXPOSURE
====================================================== */

function isBlockExposed(
    x,
    y,
    z
) {

    for (
        const offset of CULLING_NEIGHBORS
    ) {

        const nx =
            x +
            offset[0];


        const ny =
            y +
            offset[1];


        const nz =
            z +
            offset[2];


        if (
            !world.has(
                blockKey(
                    nx,
                    ny,
                    nz
                )
            )
        ) {

            return true;

        }

    }


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


    if (
        Array.isArray(
            material
        )
    ) {

        material.forEach(
            item => {

                if (!item) {

                    return;

                }


                if (
                    item.map
                ) {

                    item.map.dispose();

                }


                item.dispose();

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
   REMOVE CULLED MESH
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
       IMPORTANT:

       DO NOT dispose cube.geometry.

       All normal blocks use the shared
       BLOCK_GEOMETRY from world.js.
    */


    disposeCullingMaterial(
        cube.material
    );


    meshes.delete(
        key
    );

}


/* ======================================================
   REVEAL BLOCK
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


    if (
        !world.has(
            key
        )
    ) {

        return;

    }


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
       addBlock refuses to create a block if
       world already contains it.

       Temporarily remove the world entry.
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
       No world block.
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
       Exposed block.
    */

    if (
        isBlockExposed(
            x,
            y,
            z
        )
    ) {

        revealCulledBlock(
            x,
            y,
            z
        );

    }


    /*
       Completely hidden block.
    */

    else {

        removeCulledMesh(
            key
        );

    }

}


/* ======================================================
   UPDATE AROUND BLOCK
====================================================== */

function updateCullingAround(
    x,
    y,
    z
) {

    updateCulledBlock(
        x,
        y,
        z
    );


    CULLING_NEIGHBORS.forEach(
        offset => {

            updateCulledBlock(

                x +
                offset[0],

                y +
                offset[1],

                z +
                offset[2]

            );

        }
    );

}


/* ======================================================
   WRAP ADD BLOCK
====================================================== */

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


        updateCullingAround(
            x,
            y,
            z
        );

    };


/* ======================================================
   WRAP BREAK BLOCK
====================================================== */

const cullingOriginalBreakBlock =
    breakBlock;


breakBlock =
    function(
        cube
    ) {

        if (!cube) {

            return;

        }


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


        cullingOriginalBreakBlock(
            cube
        );


        CULLING_NEIGHBORS.forEach(
            offset => {

                updateCulledBlock(

                    x +
                    offset[0],

                    y +
                    offset[1],

                    z +
                    offset[2]

                );

            }
        );

    };


console.log(
    "Hidden block culling enabled safely!"
);