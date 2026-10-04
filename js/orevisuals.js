/*
=========================================================
BLOCKWORLD
Ore Visuals
=========================================================
*/


/* ======================================================
   TEXTURE CACHE
====================================================== */

const oreTextureCanvases = {};


/* ======================================================
   CREATE PIXEL ORE TEXTURE
====================================================== */

function createOreTextureCanvas(
    type
) {

    /*
       Reuse the same canvas design for each ore type.
    */

    if (
        oreTextureCanvases[type]
    ) {

        return oreTextureCanvases[type];

    }


    const canvas =
        document.createElement("canvas");


    canvas.width = 32;
    canvas.height = 32;


    const ctx =
        canvas.getContext("2d");


    ctx.imageSmoothingEnabled =
        false;


    /* ==================================================
       STONE BASE
    ================================================== */

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
        "#5b5f63";


    ctx.fillRect(2, 4, 5, 4);
    ctx.fillRect(19, 2, 4, 5);
    ctx.fillRect(26, 12, 4, 5);
    ctx.fillRect(4, 24, 6, 4);
    ctx.fillRect(18, 20, 5, 5);
    ctx.fillRect(12, 10, 3, 4);


    /*
       Light stone patches.
    */

    ctx.fillStyle =
        "#898e92";


    ctx.fillRect(9, 2, 4, 3);
    ctx.fillRect(24, 5, 5, 3);
    ctx.fillRect(2, 17, 4, 4);
    ctx.fillRect(12, 27, 5, 3);
    ctx.fillRect(26, 23, 3, 4);


    /* ==================================================
       ORE COLORS
    ================================================== */

    let darkColor;
    let mainColor;
    let brightColor;


    /* ==================================================
       COAL
    ================================================== */

    if (
        type === "coal_ore"
    ) {

        darkColor =
            "#141516";

        mainColor =
            "#24272a";

        brightColor =
            "#3d4246";

    }


    /* ==================================================
       IRON
    ================================================== */

    else if (
        type === "iron_ore"
    ) {

        darkColor =
            "#8a593d";

        mainColor =
            "#bd7650";

        brightColor =
            "#e0a47c";

    }


    /* ==================================================
       DIAMOND
    ================================================== */

    else {

        darkColor =
            "#087d8c";

        mainColor =
            "#22d5e5";

        brightColor =
            "#a4fbff";

    }


    /* ==================================================
       ORE CLUSTERS
    ================================================== */

    const clusters = [

        [
            [5, 6],
            [6, 6],
            [7, 7],
            [6, 8]
        ],

        [
            [22, 4],
            [23, 5],
            [24, 5]
        ],

        [
            [15, 15],
            [16, 15],
            [17, 16],
            [16, 17]
        ],

        [
            [27, 20],
            [26, 21],
            [27, 22],
            [28, 22]
        ],

        [
            [7, 25],
            [8, 24],
            [9, 25]
        ],

        [
            [20, 27],
            [21, 26],
            [22, 27]
        ]

    ];


    clusters.forEach(
        cluster => {

            /*
               Dark edge of ore.
            */

            ctx.fillStyle =
                darkColor;


            cluster.forEach(
                ([x, y]) => {

                    ctx.fillRect(
                        x,
                        y,
                        4,
                        4
                    );

                }
            );


            /*
               Main ore color.
            */

            ctx.fillStyle =
                mainColor;


            cluster.forEach(
                ([x, y]) => {

                    ctx.fillRect(
                        x + 1,
                        y,
                        2,
                        3
                    );

                }
            );


            /*
               Tiny bright highlight.
            */

            ctx.fillStyle =
                brightColor;


            const first =
                cluster[0];


            ctx.fillRect(
                first[0] + 1,
                first[1],
                1,
                1
            );

        }
    );


    /* ==================================================
       PIXEL BORDER / SHADING
    ================================================== */

    ctx.fillStyle =
        "rgba(0,0,0,0.12)";


    ctx.fillRect(
        0,
        0,
        32,
        2
    );


    ctx.fillRect(
        0,
        0,
        2,
        32
    );


    ctx.fillStyle =
        "rgba(255,255,255,0.08)";


    ctx.fillRect(
        0,
        30,
        32,
        2
    );


    ctx.fillRect(
        30,
        0,
        2,
        32
    );


    oreTextureCanvases[type] =
        canvas;


    return canvas;

}


/* ======================================================
   CREATE ORE MATERIAL
====================================================== */

function createOreMaterial(
    type
) {

    const canvas =
        createOreTextureCanvas(
            type
        );


    /*
       Give every ore block its own
       CanvasTexture.

       This is important because your
       mining system disposes textures
       when a block is broken.
    */

    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.magFilter =
        THREE.NearestFilter;


    texture.minFilter =
        THREE.NearestFilter;


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return new THREE.MeshLambertMaterial({

        map: texture

    });

}


/* ======================================================
   UPGRADE ADD BLOCK
====================================================== */

/*
   Save the original working addBlock.
*/

const originalAddBlock =
    addBlock;


/*
   Replace it with an upgraded version.
*/

addBlock = function(
    x,
    y,
    z,
    type
) {

    /*
       Let the original game create
       the block first.

       This keeps all existing world
       and collision logic intact.
    */

    originalAddBlock(
        x,
        y,
        z,
        type
    );


    /*
       Get the newly created block.
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


    /*
       Only change ore blocks.
    */

    if (
        type !== BLOCKS.coal_ore &&
        type !== BLOCKS.iron_ore &&
        type !== BLOCKS.diamond_ore
    ) {

        return;

    }


    /*
       Remove the old plain material.
    */

    if (
        Array.isArray(
            cube.material
        )
    ) {

        cube.material.forEach(
            material => {

                material.dispose();

            }
        );

    }

    else {

        cube.material.dispose();

    }


    /*
       Give the ore its proper texture.
    */

    cube.material =
        createOreMaterial(
            type.name
        );

};