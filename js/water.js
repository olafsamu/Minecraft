/*
=========================================================
BLOCKWORLD
Water System
=========================================================

Water exists as real blocks in the world for:

- Collision
- Future swimming
- Future underwater physics
- Future water interactions

Visually, however, water behaves like a liquid surface.

IMPORTANT:

Only the TOP face of a water block is visible.

The vertical faces are completely transparent.

This prevents the large glass-wall effect caused by
rendering many transparent cube sides on top of each other.

=========================================================
*/


/* ======================================================
   WATER BLOCK
====================================================== */

BLOCKS.water = {

    name: "Water",

    color: 0x4ca6c8,

    breakTime: 0,

    requiresTool: true,

    requiredTool: "water"

};


/* ======================================================
   WATER SETTINGS
====================================================== */

const WATER_LEVEL = 4;


/* ======================================================
   REGISTER AS INSTANCED BLOCK
====================================================== */

if (
    typeof INSTANCED_BLOCK_TYPES !==
    "undefined"
) {

    if (
        !INSTANCED_BLOCK_TYPES.includes(
            "water"
        )
    ) {

        INSTANCED_BLOCK_TYPES.push(
            "water"
        );

    }

}


/* ======================================================
   WATER TEXTURE
====================================================== */

function createWaterTexture() {

    if (
        blockVisualTextures.water
    ) {

        return blockVisualTextures.water;

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
       Water base.
    */

    ctx.fillStyle =
        "#438fab";


    ctx.fillRect(
        0,
        0,
        32,
        32
    );


    /*
       Light water reflections.
    */

    ctx.fillStyle =
        "#79c4d5";


    ctx.fillRect(
        2,
        5,
        10,
        2
    );


    ctx.fillRect(
        18,
        10,
        8,
        2
    );


    ctx.fillRect(
        7,
        18,
        12,
        2
    );


    ctx.fillRect(
        23,
        26,
        7,
        2
    );


    /*
       Dark water variation.
    */

    ctx.fillStyle =
        "#347b96";


    ctx.fillRect(
        12,
        2,
        6,
        2
    );


    ctx.fillRect(
        2,
        14,
        7,
        2
    );


    ctx.fillRect(
        20,
        21,
        8,
        2
    );


    ctx.fillRect(
        10,
        28,
        9,
        2
    );


    blockVisualTextures.water =
        prepareTexture(

            new THREE.CanvasTexture(
                canvas
            )

        );


    return blockVisualTextures.water;

}


/* ======================================================
   CREATE INVISIBLE MATERIAL
====================================================== */

function createInvisibleWaterMaterial() {

    const material =
        new THREE.MeshBasicMaterial({

            transparent:
                true,

            opacity:
                0,

            depthWrite:
                false,

            side:
                THREE.DoubleSide

        });


    material.userData.sharedBlockMaterial =
        true;


    material.userData.sharedBlockTexture =
        true;


    /*
       Never dispose shared material.
    */

    material.dispose =
        function() {};

    
    return material;

}


/* ======================================================
   CREATE WATER SURFACE MATERIAL
====================================================== */

function createWaterSurfaceMaterial() {

    const texture =
        createWaterTexture();


    const material =
        new THREE.MeshLambertMaterial({

            map:
                texture,

            transparent:
                true,

            opacity:
                0.58,

            depthWrite:
                true,

            side:
                THREE.DoubleSide

        });


    material.userData.sharedBlockMaterial =
        true;


    material.userData.sharedBlockTexture =
        true;


    /*
       Never dispose shared material.
    */

    material.dispose =
        function() {};


    return material;

}


/* ======================================================
   CREATE SHARED WATER MATERIAL SET
====================================================== */

function createSharedWaterMaterials() {

    if (
        blockVisualMaterials.water
    ) {

        return blockVisualMaterials.water;

    }


    /*
       The cube still exists underneath,
       but only its TOP face is visible.

       THREE.BoxGeometry material order:

       0 = right
       1 = left
       2 = top
       3 = bottom
       4 = front
       5 = back
    */

    const invisible =
        createInvisibleWaterMaterial();


    const surface =
        createWaterSurfaceMaterial();


    const materials = [

        invisible,

        invisible,

        surface,

        invisible,

        invisible,

        invisible

    ];


    blockVisualMaterials.water =
        materials;


    return materials;

}


/* ======================================================
   EXTEND MATERIAL SYSTEM
====================================================== */

const waterOriginalGetSharedMaterials =
    getSharedMaterials;


getSharedMaterials =
    function(
        name
    ) {

        if (
            name === "water"
        ) {

            return createSharedWaterMaterials();

        }


        return waterOriginalGetSharedMaterials(
            name
        );

    };


/* ======================================================
   LAKE NOISE
====================================================== */

function getLakeNoise(
    x,
    z
) {

    const a =
        Math.sin(
            x * 0.075
        );


    const b =
        Math.cos(
            z * 0.065
        );


    const c =
        Math.sin(
            (x + z) * 0.045
        );


    return (

        a +
        b +
        c

    ) / 3;

}


/* ======================================================
   SHOULD BE WATER
====================================================== */

function shouldGenerateWater(
    x,
    z,
    groundHeight
) {

    /*
       High terrain remains land.
    */

    if (
        groundHeight >=
        WATER_LEVEL
    ) {

        return false;

    }


    const lakeNoise =
        getLakeNoise(
            x,
            z
        );


    const variation =
        (

            Math.sin(
                x * 0.19 +
                z * 0.11
            ) +

            1

        ) / 2;


    return (

        lakeNoise > 0.42 &&

        variation > 0.20

    );

}


/* ======================================================
   ADD WATER TO CHUNK
====================================================== */

function addWaterToChunkData(
    data,
    chunkX,
    chunkZ
) {

    const minX =
        chunkX *
        CHUNK_SIZE;


    const maxX =
        minX +
        CHUNK_SIZE -
        1;


    const minZ =
        chunkZ *
        CHUNK_SIZE;


    const maxZ =
        minZ +
        CHUNK_SIZE -
        1;


    for (
        let x = minX;
        x <= maxX;
        x++
    ) {

        for (
            let z = minZ;
            z <= maxZ;
            z++
        ) {

            const ground =
                terrainHeight(
                    x,
                    z
                );


            if (
                !shouldGenerateWater(
                    x,
                    z,
                    ground
                )
            ) {

                continue;

            }


            /*
               Fill the basin up to the water level.

               The rendering system only shows the
               top surface, so the player will see a
               normal flat lake instead of transparent
               cube walls.
            */

            for (
                let y =
                    ground + 1;

                y <=
                WATER_LEVEL;

                y++
            ) {

                const key =
                    blockKey(
                        x,
                        y,
                        z
                    );


                if (
                    !data.has(
                        key
                    )
                ) {

                    data.set(
                        key,
                        BLOCKS.water
                    );

                }

            }

        }

    }

}


/* ======================================================
   WRAP CHUNK GENERATION
====================================================== */

const waterOriginalGenerateChunkData =
    generateChunkData;


generateChunkData =
    function(
        chunkX,
        chunkZ
    ) {

        /*
           Generate normal terrain.
        */

        const data =
            waterOriginalGenerateChunkData(
                chunkX,
                chunkZ
            );


        /*
           Add water.
        */

        addWaterToChunkData(
            data,
            chunkX,
            chunkZ
        );


        return data;

    };


/* ======================================================
   READY
====================================================== */

console.log(
    "Water system enabled!"
);

console.log(
    "Water surface rendering enabled!"
);