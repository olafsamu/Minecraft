/*
=========================================================
BLOCKWORLD
Cloud System
=========================================================

Voxel-style clouds
- Instanced rendering
- Deterministic positions
- Only nearby cloud regions rendered
- Terrain blocks clouds
- Changes appearance with day/night
=========================================================
*/


/* ======================================================
   SETTINGS
   ====================================================== */

const CLOUD_TILE_SIZE = 64;

const CLOUD_GRID_RADIUS = 3;

const CLOUD_HEIGHT = 42;

const MAX_CLOUD_PUFFS = 700;


/* ======================================================
   CLOUD OBJECT
   ====================================================== */

let cloudMesh = null;

let cloudCenterTileX = null;
let cloudCenterTileZ = null;


/* ======================================================
   CLOUD MATERIAL
   ====================================================== */

let cloudMaterial = null;


/* ======================================================
   CLOUD GEOMETRY
   ====================================================== */

let cloudGeometry = null;


/* ======================================================
   DETERMINISTIC RANDOM
   ====================================================== */

function cloudRandom(
    x,
    z,
    extra = 0
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

    /*
    One shared cube for every cloud piece.
    */
    cloudGeometry =
        new THREE.BoxGeometry(
            1,
            1,
            1
        );


    /*
    Opaque material is intentional.

    This is much cheaper than transparent cloud layers
    and avoids transparency sorting problems.
    */
    cloudMaterial =
        new THREE.MeshLambertMaterial({
            color: 0xffffff,

            fog: true
        });


    /*
    One InstancedMesh for the entire nearby cloud field.
    */
    cloudMesh =
        new THREE.InstancedMesh(
            cloudGeometry,
            cloudMaterial,
            MAX_CLOUD_PUFFS
        );


    cloudMesh.count = 0;

    /*
    Clouds must respect the depth buffer.

    This means:
    terrain in front of a cloud
    will correctly hide the cloud.
    */
    cloudMesh.material.depthTest = true;

    cloudMesh.material.depthWrite = true;


    scene.add(
        cloudMesh
    );


    /*
    Build the first cloud field.
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
   ADD ONE CLOUD PUFF
   ====================================================== */

function addCloudPuff(
    matrix,
    x,
    y,
    z,
    scaleX,
    scaleY,
    scaleZ,
    rotationY
) {

    matrix.makeRotationY(
        rotationY
    );

    matrix.scale(
        new THREE.Vector3(
            scaleX,
            scaleY,
            scaleZ
        )
    );

    matrix.setPosition(
        x,
        y,
        z
    );

    return matrix;
}


/* ======================================================
   REBUILD CLOUD FIELD
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


    let instanceIndex = 0;


    /*
    Generate nearby cloud tiles.
    */
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

            /*
            Decide whether this tile contains clouds.
            */
            const tileChance =
                cloudRandom(
                    tileX,
                    tileZ,
                    1
                );

            if (
                tileChance < 0.42
            ) {
                continue;
            }


            /*
            1–2 cloud clusters per tile.
            */
            const clusterCount =
                cloudRandom(
                    tileX,
                    tileZ,
                    2
                ) > 0.7
                    ? 2
                    : 1;


            for (
                let cluster = 0;
                cluster < clusterCount;
                cluster++
            ) {

                if (
                    instanceIndex >=
                    MAX_CLOUD_PUFFS
                ) {
                    break;
                }


                /* ======================================
                   CLUSTER POSITION
                   ====================================== */

                const tileWorldX =
                    tileX *
                    CLOUD_TILE_SIZE;

                const tileWorldZ =
                    tileZ *
                    CLOUD_TILE_SIZE;


                const clusterX =
                    tileWorldX +
                    8 +
                    cloudRandom(
                        tileX,
                        tileZ,
                        cluster * 10 + 3
                    ) *
                    (CLOUD_TILE_SIZE - 16);


                const clusterZ =
                    tileWorldZ +
                    8 +
                    cloudRandom(
                        tileX,
                        tileZ,
                        cluster * 10 + 4
                    ) *
                    (CLOUD_TILE_SIZE - 16);


                /*
                Slightly vary cloud altitude.
                */
                const clusterY =
                    CLOUD_HEIGHT +
                    (
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 10 + 5
                        ) -
                        0.5
                    ) *
                    3;


                /* ======================================
                   CLUSTER SIZE
                   ====================================== */

                const puffCount =
                    7 +
                    Math.floor(
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 10 + 6
                        ) *
                        10
                    );


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


                    /* ==================================
                       PUFF POSITION
                       ================================== */

                    const spreadX =
                        (
                            cloudRandom(
                                tileX,
                                tileZ,
                                cluster * 100 +
                                puff * 3 +
                                20
                            ) -
                            0.5
                        ) *
                        22;


                    const spreadZ =
                        (
                            cloudRandom(
                                tileX,
                                tileZ,
                                cluster * 100 +
                                puff * 3 +
                                21
                            ) -
                            0.5
                        ) *
                        14;


                    const puffX =
                        clusterX +
                        spreadX;


                    const puffZ =
                        clusterZ +
                        spreadZ;


                    const puffY =
                        clusterY +
                        (
                            cloudRandom(
                                tileX,
                                tileZ,
                                cluster * 100 +
                                puff * 3 +
                                22
                            ) -
                            0.5
                        ) *
                        1.2;


                    /* ==================================
                       PUFF SIZE
                       ================================== */

                    const scaleX =
                        3 +
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 100 +
                            puff * 3 +
                            23
                        ) *
                        5;


                    const scaleY =
                        0.9 +
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 100 +
                            puff * 3 +
                            24
                        ) *
                        0.8;


                    const scaleZ =
                        2.5 +
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 100 +
                            puff * 3 +
                            25
                        ) *
                        4;


                    const rotationY =
                        cloudRandom(
                            tileX,
                            tileZ,
                            cluster * 100 +
                            puff * 3 +
                            26
                        ) *
                        Math.PI;


                    /* ==================================
                       BUILD MATRIX
                       ================================== */

                    addCloudPuff(
                        matrix,
                        puffX,
                        puffY,
                        puffZ,
                        scaleX,
                        scaleY,
                        scaleZ,
                        rotationY
                    );


                    cloudMesh.setMatrixAt(
                        instanceIndex,
                        matrix
                    );


                    instanceIndex++;
                }
            }
        }
    }


    /* ==================================================
       APPLY INSTANCE COUNT
       ================================================== */

    cloudMesh.count =
        instanceIndex;

    cloudMesh.instanceMatrix.needsUpdate =
        true;


    /*
    Recalculate bounds so Three.js can cull
    the cloud field correctly.
    */
    cloudMesh.computeBoundingBox();

    cloudMesh.computeBoundingSphere();


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


    const currentTileX =
        Math.floor(
            camera.position.x /
            CLOUD_TILE_SIZE
        );


    const currentTileZ =
        Math.floor(
            camera.position.z /
            CLOUD_TILE_SIZE
        );


    /*
    Only rebuild when the player actually
    enters a new cloud tile.

    This keeps the system very cheap.
    */
    if (
        currentTileX !==
            cloudCenterTileX ||

        currentTileZ !==
            cloudCenterTileZ
    ) {

        rebuildClouds(
            currentTileX,
            currentTileZ
        );
    }


    /* ==================================================
       DAY / NIGHT CLOUD COLOR
       ================================================== */

    if (
        typeof dayTime !==
        "undefined"
    ) {

        const sunHeight =
            Math.sin(
                dayTime *
                Math.PI *
                2
            );


        const dayAmount =
            Math.max(
                0,
                Math.min(
                    1,
                    (sunHeight + 0.25) /
                    0.75
                )
            );


        const nightColor =
            new THREE.Color(
                0x6c7890
            );


        const sunsetColor =
            new THREE.Color(
                0xf0c6a6
            );


        const dayColor =
            new THREE.Color(
                0xffffff
            );


        let targetColor;


        if (
            sunHeight < -0.15
        ) {

            /*
            Night
            */
            targetColor =
                nightColor;

        } else if (
            sunHeight < 0.2
        ) {

            /*
            Sunrise / sunset
            */
            targetColor =
                sunsetColor;

        } else {

            /*
            Day
            */
            targetColor =
                dayColor;
        }


        /*
        Smoothly approach the target color.
        */
        cloudMaterial.color.lerp(
            targetColor,
            Math.min(
                1,
                delta * 3
            )
        );
    }
}