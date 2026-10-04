/*
=========================================================
BLOCKWORLD
Water System
=========================================================

CLEAN WATER VERSION

Water is rendered as a separate liquid surface.

Water is NOT stored in world.

Features:

- Natural ponds and lakes
- Clean flat water surface
- One InstancedMesh per chunk
- No transparent cube walls
- No water blocks
- No water collision
- Trees do not spawn in water

=========================================================
*/


/* ======================================================
   WATER SETTINGS
====================================================== */

/*
   Terrain one block below this level can become water.

   This creates simple one-block-deep ponds for now.
*/

const WATER_LEVEL = 4;


/* ======================================================
   WATER GEOMETRY
====================================================== */

const WATER_SURFACE_GEOMETRY =
    new THREE.PlaneGeometry(
        1,
        1
    );


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


    /*
       Deliberately simple.

       A clean material looks much better than
       thousands of transparent textured cubes.
    */

    waterSurfaceMaterial =
        new THREE.MeshLambertMaterial({

            color:
                0x459fbe,

            transparent:
                true,

            opacity:
                0.68,

            depthWrite:
                false,

            side:
                THREE.DoubleSide

        });


    /*
       This material is shared by the entire world.

       Never dispose it when a chunk unloads.
    */

    waterSurfaceMaterial.dispose =
        function() {};


    return waterSurfaceMaterial;

}


/* ======================================================
   BROAD LAKE NOISE
====================================================== */

function getLakeNoise(
    x,
    z
) {

    const a =
        Math.sin(
            x * 0.055
        );


    const b =
        Math.cos(
            z * 0.060
        );


    const c =
        Math.sin(
            (x + z) * 0.035
        );


    const d =
        Math.cos(
            (x - z) * 0.025
        );


    return (

        a * 0.30 +

        b * 0.30 +

        c * 0.25 +

        d * 0.15

    );

}


/* ======================================================
   CHECK LOW NEIGHBORS
====================================================== */

function countLowNeighbors(
    x,
    z
) {

    let count = 0;


    for (
        let dx = -1;
        dx <= 1;
        dx++
    ) {

        for (
            let dz = -1;
            dz <= 1;
            dz++
        ) {

            /*
               Don't count the center tile.
            */

            if (
                dx === 0 &&
                dz === 0
            ) {

                continue;

            }


            const neighborHeight =
                terrainHeight(
                    x + dx,
                    z + dz
                );


            if (
                neighborHeight ===
                WATER_LEVEL - 1
            ) {

                count++;

            }

        }

    }


    return count;

}


/* ======================================================
   SHOULD THIS TILE BE WATER?
====================================================== */

function shouldGenerateWater(
    x,
    z
) {

    const height =
        terrainHeight(
            x,
            z
        );


    /*
       Only exactly one level below the water
       surface becomes water.

       This prevents water from floating high above
       very deep terrain.
    */

    if (
        height !==
        WATER_LEVEL - 1
    ) {

        return false;

    }


    /*
       Require several neighboring low tiles.

       This removes tiny isolated puddles.
    */

    const lowNeighbors =
        countLowNeighbors(
            x,
            z
        );


    if (
        lowNeighbors < 5
    ) {

        return false;

    }


    /*
       Broad noise controls where actual lakes
       are located.
    */

    const lakeNoise =
        getLakeNoise(
            x,
            z
        );


    if (
        lakeNoise < 0.20
    ) {

        return false;

    }


    /*
       Secondary variation prevents every suitable
       basin from becoming a lake.
    */

    const detail =
        (

            Math.sin(
                x * 0.17 +
                z * 0.13
            )

            +

            Math.cos(
                x * 0.09 -
                z * 0.19
            )

        ) / 2;


    return (
        detail >
        -0.35
    );

}


/* ======================================================
   GET WATER POSITIONS FOR CHUNK
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
                shouldGenerateWater(
                    x,
                    z
                )
            ) {

                positions.push({

                    x:
                        x,

                    z:
                        z

                });

            }

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
       One instanced mesh per chunk.
    */

    const mesh =
        new THREE.InstancedMesh(

            WATER_SURFACE_GEOMETRY,

            material,

            positions.length

        );


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
                0.01,

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
   PREVENT TREES IN WATER
====================================================== */

/*
   IMPORTANT:

   water.js must be loaded AFTER chunks.js.

   That way shouldGenerateTree() already exists.
*/

const waterOriginalShouldGenerateTree =
    shouldGenerateTree;


shouldGenerateTree =
    function(
        x,
        z
    ) {

        /*
           Absolute rule:

           No tree trunk starts inside a lake.
        */

        if (
            shouldGenerateWater(
                x,
                z
            )
        ) {

            return false;

        }


        return waterOriginalShouldGenerateTree(
            x,
            z
        );

    };


/* ======================================================
   READY
====================================================== */

console.log(
    "Clean lake water system enabled!"
);