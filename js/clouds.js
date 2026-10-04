/*
=========================================================
BLOCKWORLD
Cloud System
=========================================================

Lightweight voxel-style clouds
- One InstancedMesh
- Deterministic generation
- Follows the player
- Day/night color changes
- Terrain can block clouds
=========================================================
*/


/* ======================================================
   SETTINGS
   ====================================================== */

const CLOUD_TILE_SIZE = 64;

const CLOUD_GRID_RADIUS = 2;

const CLOUD_HEIGHT = 42;

const MAX_CLOUD_PUFFS = 500;


/* ======================================================
   CLOUD SYSTEM
   ====================================================== */

let cloudMesh = null;

let cloudMaterial = null;

let cloudGeometry = null;

let cloudCenterTileX = null;

let cloudCenterTileZ = null;


/* ======================================================
   DETERMINISTIC RANDOM
   ====================================================== */

function cloudRandom(
    x,
    z,
    extra
) {

    const value =
        Math.sin(
            x * 127.1 +
            z * 311.7 +
            extra * 74.7
        ) *
        43758.5453123;

    return (
        value -
        Math.floor(value)
    );
}


/* ======================================================
   CREATE CLOUD SYSTEM
   ====================================================== */

function initClouds() {

    cloudGeometry =
        new THREE.BoxGeometry(
            1,
            1,
            1
        );


    /*
    Basic material is intentionally used here.

    We change the color ourselves depending on
    the time of day, which keeps the system simple.
    */
  cloudMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffffff,

        fog: true,

        side: THREE.DoubleSide,

        depthTest: true,

        depthWrite: true
    });


    cloudMesh =
        new THREE.InstancedMesh(
            cloudGeometry,
            cloudMaterial,
            MAX_CLOUD_PUFFS
        );


    cloudMesh.count = 0;


    /*
    Disable frustum culling for the cloud field.

    This avoids the need for expensive/manual
    instance bounding calculations.
    */
   cloudMesh.frustumCulled = false;

cloudMesh.material.side =
    THREE.DoubleSide;

scene.add(
    cloudMesh
);


    /*
    Build initial clouds.
    */
    rebuildClouds(
        Math.floor(
            camera.position.x /
            CLOUD_TILE_SIZE
        ),
        Math.floor(
            camera.position.z /
            CLOUD_TILE_SIZE
        )
    );
}


/* ======================================================
   REBUILD CLOUDS
   ====================================================== */

function rebuildClouds(
    centerTileX,
    centerTileZ
) {

    if (
        !cloudMesh
    ) {
        return;
    }


    const matrix =
        new THREE.Matrix4();

    const scale =
        new THREE.Vector3();


    let instanceIndex = 0;


    /* ==================================================
       CLOUD TILES
       ================================================== */

    for (
        let tileX =
            centerTileX -
            CLOUD_GRID_RADIUS;

        tileX <=
            centerTileX +
            CLOUD_GRID_RADIUS;

        tileX++
    ) {

        for (
            let tileZ =
                centerTileZ -
                CLOUD_GRID_RADIUS;

            tileZ <=
                centerTileZ +
                CLOUD_GRID_RADIUS;

            tileZ++
        ) {

            if (
                instanceIndex >=
                MAX_CLOUD_PUFFS
            ) {
                break;
            }


            /*
            Not every tile contains clouds.
            */
            const tileChance =
                cloudRandom(
                    tileX,
                    tileZ,
                    1
                );


            if (
                tileChance < 0.38
            ) {
                continue;
            }


            /* ==================================================
               CLUSTER POSITION
               ================================================== */

            const baseX =
                tileX *
                CLOUD_TILE_SIZE;

            const baseZ =
                tileZ *
                CLOUD_TILE_SIZE;


            const clusterX =
                baseX +
                10 +
                cloudRandom(
                    tileX,
                    tileZ,
                    2
                ) *
                44;


            const clusterZ =
                baseZ +
                10 +
                cloudRandom(
                    tileX,
                    tileZ,
                    3
                ) *
                44;


            const clusterY =
                CLOUD_HEIGHT +
                (
                    cloudRandom(
                        tileX,
                        tileZ,
                        4
                    ) -
                    0.5
                ) *
                3;


            /* ==================================================
               PUFF COUNT
               ================================================== */

            const puffCount =
                8 +
                Math.floor(
                    cloudRandom(
                        tileX,
                        tileZ,
                        5
                    ) *
                    8
                );


            /* ==================================================
               CREATE PUFFS
               ================================================== */

            for (
                let puff = 0;
                puff < puffCount;
                puff++
            ) {

                if (
                    instanceIndex >=
                    MAX_CLOUD_PUFFS
                ) {
                    break;
                }


                const spreadX =
                    (
                        cloudRandom(
                            tileX,
                            tileZ,
                            100 +
                            puff * 3
                        ) -
                        0.5
                    ) *
                    24;


                const spreadZ =
                    (
                        cloudRandom(
                            tileX,
                            tileZ,
                            101 +
                            puff * 3
                        ) -
                        0.5
                    ) *
                    16;


                const x =
                    clusterX +
                    spreadX;


                const y =
                    clusterY +
                    (
                        cloudRandom(
                            tileX,
                            tileZ,
                            102 +
                            puff * 3
                        ) -
                        0.5
                    ) *
                    1.5;


                const z =
                    clusterZ +
                    spreadZ;


                /* ==================================================
                   PUFF SIZE
                   ================================================== */

                const sizeX =
                    3 +
                    cloudRandom(
                        tileX,
                        tileZ,
                        103 +
                        puff * 3
                    ) *
                    5;


                const sizeY =
                    1 +
                    cloudRandom(
                        tileX,
                        tileZ,
                        104 +
                        puff * 3
                    ) *
                    0.8;


                const sizeZ =
                    3 +
                    cloudRandom(
                        tileX,
                        tileZ,
                        105 +
                        puff * 3
                    ) *
                    4;


                /* ==================================================
                   BUILD INSTANCE
                   ================================================== */

                matrix.makeTranslation(
                    x,
                    y,
                    z
                );


                scale.set(
                    sizeX,
                    sizeY,
                    sizeZ
                );


                matrix.scale(
                    scale
                );


                cloudMesh.setMatrixAt(
                    instanceIndex,
                    matrix
                );


                instanceIndex++;
            }
        }
    }


    /* ==================================================
       APPLY
       ================================================== */

    cloudMesh.count =
        instanceIndex;

    cloudMesh.instanceMatrix.needsUpdate =
        true;


    cloudCenterTileX =
        centerTileX;

    cloudCenterTileZ =
        centerTileZ;
}


/* ======================================================
   UPDATE CLOUDS
   ====================================================== */

function updateClouds(
    delta
) {

    if (
        !cloudMesh
    ) {
        return;
    }


    /* ==================================================
       CHECK PLAYER TILE
       ================================================== */

    const tileX =
        Math.floor(
            camera.position.x /
            CLOUD_TILE_SIZE
        );


    const tileZ =
        Math.floor(
            camera.position.z /
            CLOUD_TILE_SIZE
        );


    /*
    Only rebuild when the player crosses
    a cloud tile boundary.
    */
    if (
        tileX !==
            cloudCenterTileX ||

        tileZ !==
            cloudCenterTileZ
    ) {

        rebuildClouds(
            tileX,
            tileZ
        );
    }


    /* ==================================================
       DAY / NIGHT COLOR
       ================================================== */

    if (
        typeof dayTime ===
        "undefined"
    ) {
        return;
    }


    const sunHeight =
        Math.sin(
            dayTime *
            Math.PI *
            2
        );


    let targetColor;


    /*
    NIGHT
    */
    if (
        sunHeight < -0.15
    ) {

        targetColor =
            0x68758c;

    }


    /*
    SUNRISE / SUNSET
    */
    else if (
        sunHeight < 0.2
    ) {

        targetColor =
            0xe8c2a5;

    }


    /*
    DAY
    */
    else {

        targetColor =
            0xffffff;
    }


    cloudMaterial.color.lerp(
        new THREE.Color(
            targetColor
        ),
        Math.min(
            1,
            delta * 3
        )
    );
}