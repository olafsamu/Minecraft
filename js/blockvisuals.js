/*
=========================================================
BLOCKWORLD
Block Visuals
=========================================================

Visual upgrade for:

Grass
Dirt
Stone
Wood
Leaves
Planks

Ores and crafting tables are left alone.

=========================================================
*/


/* ======================================================
   TEXTURE CACHE
====================================================== */

const blockVisualTextures = {};


/* ======================================================
   TEXTURE SETTINGS
====================================================== */

function prepareTexture(
    texture
) {

    texture.magFilter =
        THREE.NearestFilter;

    texture.minFilter =
        THREE.NearestFilter;

    texture.colorSpace =
        THREE.SRGBColorSpace;

    return texture;

}


/* ======================================================
   CREATE CANVAS
====================================================== */

function createTextureCanvas() {

    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 32;
    canvas.height = 32;

    return canvas;

}


/* ======================================================
   GRASS TOP
====================================================== */

function createGrassTopTexture() {

    if (
        blockVisualTextures.grassTop
    ) {

        return blockVisualTextures.grassTop;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#4f9f38";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Grass variation.
    */

    ctx.fillStyle =
        "#67b947";


    const lightPixels = [

        [3, 4],
        [12, 2],
        [21, 7],
        [27, 3],
        [7, 14],
        [18, 12],
        [29, 17],
        [4, 24],
        [15, 27],
        [24, 23]

    ];


    lightPixels.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                2,
                2
            );

        }
    );


    /*
       Dark pixels.
    */

    ctx.fillStyle =
        "#36772a";


    const darkPixels = [

        [1, 10],
        [8, 8],
        [16, 5],
        [24, 13],
        [11, 20],
        [20, 18],
        [29, 27],
        [6, 29]

    ];


    darkPixels.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                2,
                2
            );

        }
    );


    blockVisualTextures.grassTop =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.grassTop;

}


/* ======================================================
   DIRT
====================================================== */

function createDirtTexture() {

    if (
        blockVisualTextures.dirt
    ) {

        return blockVisualTextures.dirt;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#8b5a2b";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Dirt pixels.
    */

    ctx.fillStyle =
        "#6f421f";


    const darkPixels = [

        [3, 5],
        [14, 2],
        [24, 7],
        [8, 12],
        [27, 15],
        [18, 20],
        [4, 25],
        [14, 28]

    ];


    darkPixels.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                3,
                2
            );

        }
    );


    ctx.fillStyle =
        "#a97039";


    const lightPixels = [

        [9, 4],
        [20, 3],
        [2, 15],
        [13, 11],
        [23, 18],
        [8, 23],
        [25, 26]

    ];


    lightPixels.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                2,
                2
            );

        }
    );


    blockVisualTextures.dirt =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.dirt;

}


/* ======================================================
   GRASS SIDE
====================================================== */

function createGrassSideTexture() {

    if (
        blockVisualTextures.grassSide
    ) {

        return blockVisualTextures.grassSide;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    /*
       Dirt base.
    */

    ctx.fillStyle =
        "#8b5a2b";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Grass layer across the top.
    */

    ctx.fillStyle =
        "#4f9f38";

    ctx.fillRect(
        0,
        0,
        32,
        8
    );


    /*
       Uneven grass edge.
    */

    ctx.fillStyle =
        "#43882f";


    ctx.fillRect(
        3,
        7,
        3,
        3
    );


    ctx.fillRect(
        13,
        6,
        4,
        4
    );


    ctx.fillRect(
        25,
        7,
        3,
        3
    );


    /*
       Dark dirt.
    */

    ctx.fillStyle =
        "#6f421f";


    ctx.fillRect(
        2,
        14,
        3,
        2
    );


    ctx.fillRect(
        18,
        12,
        3,
        2
    );


    ctx.fillRect(
        27,
        22,
        3,
        2
    );


    ctx.fillRect(
        8,
        26,
        3,
        2
    );


    /*
       Light dirt.
    */

    ctx.fillStyle =
        "#a97039";


    ctx.fillRect(
        10,
        17,
        2,
        2
    );


    ctx.fillRect(
        23,
        27,
        2,
        2
    );


    blockVisualTextures.grassSide =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.grassSide;

}


/* ======================================================
   STONE
====================================================== */

function createStoneTexture() {

    if (
        blockVisualTextures.stone
    ) {

        return blockVisualTextures.stone;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#73777b";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Dark stone patches.
    */

    ctx.fillStyle =
        "#595d61";


    const darkPatches = [

        [2, 3, 4, 3],
        [12, 2, 3, 4],
        [24, 6, 5, 3],
        [6, 11, 4, 4],
        [18, 13, 5, 4],
        [27, 21, 3, 5],
        [10, 24, 5, 3],
        [20, 28, 4, 2]

    ];


    darkPatches.forEach(
        ([x, y, w, h]) => {

            ctx.fillRect(
                x,
                y,
                w,
                h
            );

        }
    );


    /*
       Light stone patches.
    */

    ctx.fillStyle =
        "#8f9498";


    const lightPatches = [

        [8, 5, 3, 2],
        [21, 3, 3, 2],
        [2, 18, 4, 2],
        [14, 18, 3, 3],
        [23, 15, 3, 2],
        [5, 28, 3, 2]

    ];


    lightPatches.forEach(
        ([x, y, w, h]) => {

            ctx.fillRect(
                x,
                y,
                w,
                h
            );

        }
    );


    blockVisualTextures.stone =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.stone;

}


/* ======================================================
   WOOD SIDE
====================================================== */

function createWoodSideTexture() {

    if (
        blockVisualTextures.woodSide
    ) {

        return blockVisualTextures.woodSide;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#70441f";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Bark stripes.
    */

    ctx.fillStyle =
        "#8e5b2b";


    ctx.fillRect(
        4,
        0,
        3,
        32
    );


    ctx.fillRect(
        14,
        0,
        4,
        32
    );


    ctx.fillRect(
        25,
        0,
        3,
        32
    );


    /*
       Dark bark lines.
    */

    ctx.fillStyle =
        "#4f3018";


    ctx.fillRect(
        8,
        0,
        2,
        32
    );


    ctx.fillRect(
        21,
        0,
        2,
        32
    );


    /*
       Small bark marks.
    */

    ctx.fillRect(
        2,
        7,
        5,
        2
    );


    ctx.fillRect(
        16,
        14,
        6,
        2
    );


    ctx.fillRect(
        24,
        24,
        5,
        2
    );


    blockVisualTextures.woodSide =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.woodSide;

}


/* ======================================================
   WOOD TOP
====================================================== */

function createWoodTopTexture() {

    if (
        blockVisualTextures.woodTop
    ) {

        return blockVisualTextures.woodTop;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#b07a43";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Tree rings.
    */

    ctx.strokeStyle =
        "#70441f";

    ctx.lineWidth = 2;


    ctx.strokeRect(
        3,
        3,
        26,
        26
    );


    ctx.strokeRect(
        8,
        8,
        16,
        16
    );


    ctx.strokeRect(
        13,
        13,
        6,
        6
    );


    /*
       Small highlight.
    */

    ctx.fillStyle =
        "#d29a5a";

    ctx.fillRect(
        5,
        5,
        3,
        2
    );


    blockVisualTextures.woodTop =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.woodTop;

}


/* ======================================================
   LEAVES
====================================================== */

function createLeavesTexture() {

    if (
        blockVisualTextures.leaves
    ) {

        return blockVisualTextures.leaves;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#3d8a35";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Leaf clusters.
    */

    ctx.fillStyle =
        "#5eab45";


    const lightLeaves = [

        [3, 4],
        [14, 2],
        [24, 6],
        [7, 13],
        [19, 11],
        [28, 18],
        [10, 24],
        [22, 27]

    ];


    lightLeaves.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                4,
                3
            );

        }
    );


    ctx.fillStyle =
        "#276b2a";


    const darkLeaves = [

        [1, 10],
        [12, 8],
        [22, 14],
        [5, 20],
        [16, 20],
        [27, 26]

    ];


    darkLeaves.forEach(
        ([x, y]) => {

            ctx.fillRect(
                x,
                y,
                3,
                3
            );

        }
    );


    blockVisualTextures.leaves =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.leaves;

}


/* ======================================================
   PLANKS
====================================================== */

function createPlanksTexture() {

    if (
        blockVisualTextures.planks
    ) {

        return blockVisualTextures.planks;

    }


    const canvas =
        createTextureCanvas();


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    ctx.fillStyle =
        "#a66d35";

    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Plank divisions.
    */

    ctx.fillStyle =
        "#71451f";


    ctx.fillRect(
        0,
        10,
        32,
        2
    );


    ctx.fillRect(
        0,
        21,
        32,
        2
    );


    /*
       Vertical seams.
    */

    ctx.fillRect(
        8,
        0,
        2,
        10
    );


    ctx.fillRect(
        23,
        12,
        2,
        9
    );


    ctx.fillRect(
        14,
        23,
        2,
        9
    );


    /*
       Highlights.
    */

    ctx.fillStyle =
        "#c1874b";


    ctx.fillRect(
        2,
        3,
        5,
        2
    );


    ctx.fillRect(
        12,
        14,
        7,
        2
    );


    ctx.fillRect(
        26,
        26,
        4,
        2
    );


    blockVisualTextures.planks =
        prepareTexture(
            new THREE.CanvasTexture(
                canvas
            )
        );


    return blockVisualTextures.planks;

}


/* ======================================================
   CREATE MATERIAL
====================================================== */

function createVisualMaterial(
    texture,
    options = {}
) {

    const material =
        new THREE.MeshLambertMaterial({

            map: texture,

            ...options

        });


    /*
       Tell culling that this material uses
       a shared texture.

       The texture must NOT be disposed when
       one block disappears.
    */

    material.userData.sharedBlockTexture =
        true;


    return material;

}


/* ======================================================
   CREATE BLOCK MATERIALS
====================================================== */

function createVisualMaterials(
    type
) {

    const name =
        String(
            type.name || ""
        )
        .toLowerCase()
        .replaceAll(
            " ",
            "_"
        );


    /* ==================================================
       GRASS
    ================================================== */

    if (
        name === "grass"
    ) {

        const side =
            createGrassSideTexture();


        const top =
            createGrassTopTexture();


        const bottom =
            createDirtTexture();


        return [

            createVisualMaterial(side),

            createVisualMaterial(side),

            createVisualMaterial(top),

            createVisualMaterial(bottom),

            createVisualMaterial(side),

            createVisualMaterial(side)

        ];

    }


    /* ==================================================
       DIRT
    ================================================== */

    if (
        name === "dirt"
    ) {

        const texture =
            createDirtTexture();


        return [

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture)

        ];

    }


    /* ==================================================
       STONE
    ================================================== */

    if (
        name === "stone"
    ) {

        const texture =
            createStoneTexture();


        return [

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture)

        ];

    }


    /* ==================================================
       WOOD
    ================================================== */

    if (
        name === "wood"
    ) {

        const side =
            createWoodSideTexture();


        const top =
            createWoodTopTexture();


        return [

            createVisualMaterial(side),

            createVisualMaterial(side),

            createVisualMaterial(top),

            createVisualMaterial(top),

            createVisualMaterial(side),

            createVisualMaterial(side)

        ];

    }


    /* ==================================================
       LEAVES
    ================================================== */

    if (
        name === "leaves"
    ) {

        const texture =
            createLeavesTexture();


        return [

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            ),

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            ),

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            ),

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            ),

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            ),

            createVisualMaterial(
                texture,
                {
                    transparent: true,
                    opacity: 0.92,
                    alphaTest: 0.05
                }
            )

        ];

    }


    /* ==================================================
       PLANKS
    ================================================== */

    if (
        name === "planks"
    ) {

        const texture =
            createPlanksTexture();


        return [

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture),

            createVisualMaterial(texture)

        ];

    }


    return null;

}


/* ======================================================
   APPLY VISUALS
====================================================== */

function applyBlockVisuals(
    cube,
    type
) {

    if (!cube || !type) {

        return;

    }


    /*
       Leave ores alone.
    */

    const name =
        String(
            type.name || ""
        )
        .toLowerCase()
        .replaceAll(
            " ",
            "_"
        );


    if (
        name === "coal_ore" ||
        name === "iron_ore" ||
        name === "diamond_ore"
    ) {

        return;

    }


    /*
       Leave crafting table alone.
    */

    if (
        name === "crafting_table"
    ) {

        return;

    }


    const materials =
        createVisualMaterials(
            type
        );


    if (!materials) {

        return;

    }


    /*
       Dispose the old material.

       Do NOT dispose the old texture here.
       The old basic material normally has none.
    */

    if (
        Array.isArray(
            cube.material
        )
    ) {

        cube.material.forEach(
            material => {

                if (material) {

                    material.dispose();

                }

            }
        );

    }

    else if (
        cube.material
    ) {

        cube.material.dispose();

    }


    cube.material =
        materials;

}


/* ======================================================
   WRAP ADD BLOCK
====================================================== */

const visualOriginalAddBlock =
    addBlock;


addBlock =
    function(
        x,
        y,
        z,
        type
    ) {

        /*
           Create the block using the existing system.
        */

        visualOriginalAddBlock(
            x,
            y,
            z,
            type
        );


        /*
           Retrieve the newly created mesh.
        */

        const key =
            blockKey(
                x,
                y,
                z
            );


        const cube =
            meshes.get(
                key
            );


        if (!cube) {

            return;

        }


        applyBlockVisuals(
            cube,
            type
        );

    };


/* ======================================================
   READY
====================================================== */

console.log(
    "Block visuals enabled!"
);