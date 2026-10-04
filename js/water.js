/*
=========================================================
BLOCKWORLD
Water System
=========================================================

Adds:

- Procedural lakes and ponds
- Transparent pixel-style water
- Water rendered with InstancedMesh
- Water is not solid
- Water cannot be mined
- Water works with chunk loading

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
   REGISTER WATER AS INSTANCED
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
       Transparent blue base.
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
       Light water streaks.
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
       Darker streaks.
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
   CREATE SHARED WATER MATERIAL
====================================================== */

function createSharedWaterMaterials() {

    if (
        blockVisualMaterials.water
    ) {

        return blockVisualMaterials.water;

    }


    const texture =
        createWaterTexture();


    const material =
        createSharedMaterial(

            texture,

            {

                transparent:
                    true,

                opacity:
                    0.62,

                depthWrite:
                    true,

                side:
                    THREE.DoubleSide

            }

        );


    /*
       Water should remain visible even in
       relatively dark areas.
    */

    material.color.set(
        0x8ed4e5
    );


    const materials = [

        material,
        material,
        material,
        material,
        material,
        material

    ];


    blockVisualMaterials.water =
        materials;


    return materials;

}


/* ======================================================
   EXTEND SHARED MATERIAL SYSTEM
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

    /*
       Low-frequency waves create large
       connected areas instead of random
       individual water blocks.
    */

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
       Water only occurs below the waterline.
    */

    if (
        groundHeight >=
        WATER_LEVEL
    ) {

        return false;

    }


    /*
       Large smooth lake mask.
    */

    const lakeNoise =
        getLakeNoise(
            x,
            z
        );


    /*
       Small secondary variation so the world
       doesn't become one enormous ocean.
    */

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
   ADD WATER TO CHUNK DATA
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
               Fill from the terrain surface
               up to the water level.

               Never overwrite trees or other
               existing generated blocks.
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
           Generate normal terrain first.
        */

        const data =
            waterOriginalGenerateChunkData(
                chunkX,
                chunkZ
            );


        /*
           Add water afterward.
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