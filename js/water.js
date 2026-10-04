/*
=========================================================
BLOCKWORLD
Water System
=========================================================

PROFESSIONAL WATER VERSION

Water is NOT a block in world data.

Instead:

- Terrain remains completely separate
- Water is generated as a surface
- One InstancedMesh is used per chunk
- Water does not interfere with block culling
- Water does not interfere with mining
- Water is non-solid

Later this system can be extended with:

- Swimming
- Underwater fog
- Water movement
- Flow
- Waterfalls
- Boats

=========================================================
*/


/* ======================================================
   WATER SETTINGS
====================================================== */


/*
   Height of the water surface.

   Water only appears in terrain that is slightly
   below this height.
*/

const WATER_LEVEL = 4;


/*
   Only shallow depressions become lakes.

   This prevents huge oceans from appearing.
*/

const WATER_MIN_GROUND =
    WATER_LEVEL - 2;


const WATER_MAX_GROUND =
    WATER_LEVEL - 1;


/* ======================================================
   WATER GEOMETRY
====================================================== */


/*
   One plane is reused by every water instance.

   This is dramatically cheaper than creating
   separate geometry for every water tile.
*/

const WATER_SURFACE_GEOMETRY =
    new THREE.PlaneGeometry(
        1,
        1
    );


/* ======================================================
   WATER TEXTURE
====================================================== */

let waterTexture =
    null;


function createWaterTexture() {

    if (
        waterTexture
    ) {

        return waterTexture;

    }


    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width = 32;

    canvas.height = 32;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.imageSmoothingEnabled =
        false;


    /*
       Base blue.
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
       Light reflection strips.
    */

    ctx.fillStyle =
        "#78c5d7";


    ctx.fillRect(
        1,
        4,
        10,
        2
    );


    ctx.fillRect(
        17,
        9,
        12,
        2
    );


    ctx.fillRect(
        5,
        17,
        8,
        2
    );


    ctx.fillRect(
        21,
        25,
        9,
        2
    );


    /*
       Dark variation.
    */

    ctx.fillStyle =
        "#347b96";


    ctx.fillRect(
        12,
        2,
        5,
        2
    );


    ctx.fillRect(
        2,
        13,
        6,
        2
    );


    ctx.fillRect(
        18,
        20,
        8,
        2
    );


    ctx.fillRect(
        9,
        28,
        7,
        2
    );


    waterTexture =
        new THREE.CanvasTexture(
            canvas
        );


    waterTexture.magFilter =
        THREE.NearestFilter;


    waterTexture.minFilter =
        THREE.NearestFilter;


    waterTexture.colorSpace =
        THREE.SRGBColorSpace;


    /*
       This texture is shared for the whole game.

       Do not let individual cleanup code destroy it.
    */

    waterTexture.dispose =
        function() {};


    return waterTexture;

}


/* ======================================================
   WATER MATERIAL
====================================================== */

let waterSurfaceMaterial =
    null;


function getWaterSurfaceMaterial() {

    if (
        waterSurfaceMaterial
    ) {

        return waterSurfaceMaterial;

    }


    waterSurfaceMaterial =
        new THREE.MeshLambertMaterial({

            map:
                createWaterTexture(),

            transparent:
                true,

            opacity:
                0.72,

            depthWrite:
                false,

            side:
                THREE.DoubleSide

        });


    /*
       The material belongs to the global
       water system.

       Never dispose it when unloading a chunk.
    */

    waterSurfaceMaterial.dispose =
        function() {};


    return waterSurfaceMaterial;

}


/* ======================================================
   WATER NOISE
====================================================== */

function getWaterNoise(
    x,
    z
) {

    /*
       Large-scale noise.

       This creates broad connected areas.
    */

    const largeA =
        Math.sin(
            x * 0.055
        );


    const largeB =
        Math.cos(
            z * 0.062
        );


    const largeC =
        Math.sin(
            (x + z) * 0.032
        );


    const largeNoise =
        (
            largeA +
            largeB +
            largeC
        ) / 3;


    /*
       Smaller detail prevents the shorelines
       from looking perfectly smooth.
    */

    const smallA =
        Math.sin(
            x * 0.16 +
            z * 0.07
        );


    const smallB =
        Math.cos(
            z * 0.13 -
            x * 0.05
        );


    const smallNoise =
        (
            smallA +
            smallB
        ) / 2;


    return (

        largeNoise * 0.78 +

        smallNoise * 0.22

    );

}


/* ======================================================
   SHOULD GENERATE WATER
====================================================== */

function shouldGenerateWater(
    x,
    z
) {

    const groundHeight =
        terrainHeight(
            x,
            z
        );


    /*
       Only shallow low areas become water.
    */

    if (
        groundHeight <
        WATER_MIN_GROUND
    ) {

        return false;

    }


    if (
        groundHeight >
        WATER_MAX_GROUND
    ) {

        return false;

    }


    const noise =
        getWaterNoise(
            x,
            z
        );


    /*
       Higher threshold = fewer lakes.

       This gives us ponds/lakes instead of
       flooding the world.
    */

    return (
        noise >
        0.54
    );

}


/* ======================================================
   GET WATER POSITIONS
====================================================== */

function getWaterPositionsForChunk(
    chunkX,
    chunkZ
) {

    const positions = [];


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

            if (
                !shouldGenerateWater(
                    x,
                    z
                )
            ) {

                continue;

            }


            positions.push({

                x:
                    x,

                z:
                    z

            });

        }

    }


    return positions;

}


/* ======================================================
   BUILD WATER SURFACE
====================================================== */

function buildWaterSurfaceForChunk(
    chunkX,
    chunkZ
) {

    const positions =
        getWaterPositionsForChunk(
            chunkX,
            chunkZ
        );


    if (
        positions.length === 0
    ) {

        return null;

    }


    const material =
        getWaterSurfaceMaterial();


    /*
       ONE InstancedMesh for ALL water
       surfaces inside this chunk.
    */

    const mesh =
        new THREE.InstancedMesh(

            WATER_SURFACE_GEOMETRY,

            material,

            positions.length

        );


    /*
       PlaneGeometry initially stands vertically.

       Rotate it flat.
    */

    const rotation =
        new THREE.Matrix4();


    rotation.makeRotationX(
        -Math.PI / 2
    );


    const translation =
        new THREE.Matrix4();


    const matrix =
        new THREE.Matrix4();


    positions.forEach(
        (
            position,
            index
        ) => {

            translation.makeTranslation(

                position.x +
                0.5,

                WATER_LEVEL +
                0.005,

                position.z +
                0.5

            );


            matrix.multiplyMatrices(

                translation,

                rotation

            );


            mesh.setMatrixAt(

                index,

                matrix

            );

        }
    );


    mesh.instanceMatrix.needsUpdate =
        true;


    mesh.frustumCulled =
        true;


    mesh.computeBoundingSphere();


    mesh.userData.isWaterSurface =
        true;


    mesh.userData.chunkX =
        chunkX;


    mesh.userData.chunkZ =
        chunkZ;


    scene.add(
        mesh
    );


    return mesh;

}


/* ======================================================
   READY
====================================================== */

console.log(
    "Professional water system ready!"
);