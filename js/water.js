/*
=========================================================
BLOCKWORLD
Natural Lake Water
=========================================================

Water is a separate rendering system.

Water is NOT stored in world data.

This version creates:

- Natural lakes
- Connected water regions
- Deterministic lake locations
- Clean shorelines
- Cross-chunk lakes
- No underwater tree trunks
- One InstancedMesh per chunk

Water remains purely visual for now.

Later we can add:

- Swimming
- Underwater fog
- Water physics
- Flowing water
- Waterfalls
- Water animation
=========================================================
*/


/* ======================================================
   WATER SETTINGS
====================================================== */


/*
   Height of the water surface.

   Terrain one block below this becomes the
   preferred shoreline.
*/

const WATER_LEVEL = 4;


/*
   Only terrain at this height is allowed to
   become part of a lake.

   This prevents water from floating over
   deep valleys.
*/

const WATER_GROUND_LEVEL =
    WATER_LEVEL - 1;


/*
   Distance between possible lake centers.

   Larger number = fewer lakes.
*/

const LAKE_CELL_SIZE = 32;


/*
   Minimum and maximum lake radius.
*/

const LAKE_MIN_RADIUS = 5;

const LAKE_MAX_RADIUS = 10;


/* ======================================================
   WATER GEOMETRY
====================================================== */


/*
   One plane is shared by the entire game.
*/

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
       Clean, simple water.

       We deliberately avoid heavy transparency effects
       because those were responsible for much of the
       previous cursed appearance.
    */

    waterSurfaceMaterial =
        new THREE.MeshLambertMaterial({

            color:
                0x4b9fbd,

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
       This material is shared globally.

       Never dispose it when a chunk unloads.
    */

    waterSurfaceMaterial.dispose =
        function() {};


    return waterSurfaceMaterial;

}


/* ======================================================
   DETERMINISTIC HASH
====================================================== */

function waterHash(
    x,
    z
) {

    const value =
        Math.sin(

            x * 127.1 +
            z * 311.7 +
            74.7

        )
        *
        43758.5453123;


    return (

        value -
        Math.floor(
            value
        )

    );

}


/* ======================================================
   GET LAKE CENTER
====================================================== */


/*
   Each large grid cell has a possible lake center.

   The center position and radius are deterministic,
   meaning the same lake always exists when the
   chunk is loaded again.
*/

function getLakeCenter(
    cellX,
    cellZ
) {

    /*
       Decide whether this cell gets a lake.

       Roughly half of the cells are rejected,
       producing relatively rare lakes.
    */

    const chance =
        waterHash(
            cellX * 17,
            cellZ * 31
        );


    if (
        chance < 0.56
    ) {

        return null;

    }


    /*
       Deterministic position inside the cell.
    */

    const centerOffsetX =
        6 +
        Math.floor(

            waterHash(
                cellX * 43,
                cellZ * 71
            )
            *
            20

        );


    const centerOffsetZ =
        6 +
        Math.floor(

            waterHash(
                cellX * 97,
                cellZ * 53
            )
            *
            20

        );


    const x =
        cellX *
        LAKE_CELL_SIZE +
        centerOffsetX;


    const z =
        cellZ *
        LAKE_CELL_SIZE +
        centerOffsetZ;


    /*
       Variable lake size.
    */

    const radius =
        LAKE_MIN_RADIUS +
        Math.floor(

            waterHash(
                cellX * 131,
                cellZ * 149
            )
            *
            (
                LAKE_MAX_RADIUS -
                LAKE_MIN_RADIUS +
                1
            )

        );


    /*
       IMPORTANT:

       Don't create lakes on high terrain.

       Otherwise the water would float on hills.

       Only centers sitting at the correct terrain
       elevation are allowed.
    */

    if (
        terrainHeight(
            x,
            z
        ) !==
        WATER_GROUND_LEVEL
    ) {

        return null;

    }


    return {

        x:
            x,

        z:
            z,

        radius:
            radius

    };

}


/* ======================================================
   DISTANCE TO LAKE CENTER
====================================================== */

function distanceToLake(
    x,
    z,
    lake
) {

    const dx =
        x -
        lake.x;


    const dz =
        z -
        lake.z;


    return Math.sqrt(

        dx * dx +
        dz * dz

    );

}


/* ======================================================
   FIND NEAREST LAKE
====================================================== */

function findNearestLake(
    x,
    z
) {

    const cellX =
        Math.floor(
            x /
            LAKE_CELL_SIZE
        );


    const cellZ =
        Math.floor(
            z /
            LAKE_CELL_SIZE
        );


    let nearest =
        null;


    let nearestDistance =
        Infinity;


    /*
       Search neighboring cells.

       This is important because a lake near a
       chunk border can extend into another chunk.
    */

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

            const lake =
                getLakeCenter(

                    cellX + dx,

                    cellZ + dz

                );


            if (!lake) {

                continue;

            }


            const distance =
                distanceToLake(

                    x,

                    z,

                    lake

                );


            /*
               Keep a small buffer around the lake.
            */

            if (
                distance <
                lake.radius +
                2
            ) {

                if (
                    distance <
                    nearestDistance
                ) {

                    nearest =
                        lake;

                    nearestDistance =
                        distance;

                }

            }

        }

    }


    return nearest;

}


/* ======================================================
   SHORELINE VARIATION
====================================================== */


/*
   This makes lakes slightly irregular without
   creating noisy pixel-by-pixel edges.
*/

function getLakeEdgeVariation(
    x,
    z
) {

    const a =
        Math.sin(
            x * 0.37 +
            z * 0.21
        );


    const b =
        Math.cos(
            x * 0.19 -
            z * 0.31
        );


    return (

        a * 0.65 +
        b * 0.35

    );

}


/* ======================================================
   SHOULD TILE BE WATER
====================================================== */

function shouldGenerateWater(
    x,
    z
) {

    /*
       Actual terrain height.
    */

    const groundHeight =
        terrainHeight(
            x,
            z
        );


    /*
       Only one-block-deep low terrain.

       This gives us predictable, grounded lakes.
    */

    if (
        groundHeight !==
        WATER_GROUND_LEVEL
    ) {

        return false;

    }


    /*
       Find the nearest natural lake.
    */

    const lake =
        findNearestLake(
            x,
            z
        );


    if (!lake) {

        return false;

    }


    /*
       Slightly deform the shoreline.
    */

    const edgeVariation =
        getLakeEdgeVariation(
            x,
            z
        );


    const effectiveRadius =
        lake.radius +

        edgeVariation *
        1.15;


    const distance =
        distanceToLake(
            x,
            z,
            lake
        );


    return (
        distance <=
        effectiveRadius
    );

}


/* ======================================================
   TREE CHECK
====================================================== */


/*
   Trees should never begin inside water.

   We also keep a tiny shoreline buffer so tree trunks
   don't appear to grow directly from a lake.
*/

function isTooCloseToWater(
    x,
    z
) {

    for (
        let dx = -2;
        dx <= 2;
        dx++
    ) {

        for (
            let dz = -2;
            dz <= 2;
            dz++
        ) {

            if (
                shouldGenerateWater(
                    x + dx,
                    z + dz
                )
            ) {

                return true;

            }

        }

    }


    return false;

}


/* ======================================================
   PREVENT TREES IN WATER
====================================================== */

const waterOriginalShouldGenerateTree =
    shouldGenerateTree;


shouldGenerateTree =
    function(
        x,
        z
    ) {

        /*
           No trees inside lakes or directly
           beside the shoreline.
        */

        if (
            isTooCloseToWater(
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
       One GPU object for the whole chunk.
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
    "Natural lake system enabled!"
);