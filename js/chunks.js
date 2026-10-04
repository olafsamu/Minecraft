/*
=========================================================
BLOCKWORLD
Professional Chunk Renderer
=========================================================

Features:

- 16 x 16 chunks
- Instanced terrain rendering
- Hidden-block culling
- Chunk streaming
- Chunk unloading
- Persistent modified chunks
- Special meshes for rare blocks
- Separate water surface rendering

=========================================================
*/


/* ======================================================
   CHUNK SETTINGS
====================================================== */

const CHUNK_SIZE = 16;


/*
   Keep render distance at 1 while testing.

   This gives a 3 x 3 loaded area.
*/

const CHUNK_RENDER_DISTANCE = 1;


/*
   Only generate one new chunk per frame.

   This prevents large loading spikes.
*/

const CHUNKS_PER_FRAME = 1;


/* ======================================================
   CHUNK STORAGE
====================================================== */

const loadedChunks =
    new Set();


const chunkStorage =
    new Map();


const chunkMembers =
    new Map();


const chunkRenderObjects =
    new Map();


/* ======================================================
   CHUNK QUEUE
====================================================== */

let chunkLoadQueue = [];


let currentChunkX = 0;

let currentChunkZ = 0;


/* ======================================================
   INSTANCED BLOCK TYPES
====================================================== */

const INSTANCED_BLOCK_TYPES = [

    "grass",

    "dirt",

    "stone",

    "wood",

    "leaves",

    "planks"

];


/* ======================================================
   NORMALIZE BLOCK NAME
====================================================== */

function normalizeChunkBlockName(
    type
) {

    return String(

        type &&
        type.name
            ? type.name
            : ""

    )
    .toLowerCase()
    .replaceAll(
        " ",
        "_"
    )
    .replaceAll(
        "-",
        "_"
    );

}


/* ======================================================
   IS INSTANCED BLOCK
====================================================== */

function isInstancedBlock(
    type
) {

    return INSTANCED_BLOCK_TYPES.includes(

        normalizeChunkBlockName(
            type
        )

    );

}


/* ======================================================
   CHUNK KEY
====================================================== */

function chunkKey(
    chunkX,
    chunkZ
) {

    return (

        chunkX +
        "," +
        chunkZ

    );

}


/* ======================================================
   WORLD TO CHUNK
====================================================== */

function getChunkCoordinate(
    value
) {

    return Math.floor(

        value /
        CHUNK_SIZE

    );

}


/* ======================================================
   BLOCK NEIGHBORS
====================================================== */

const CHUNK_NEIGHBORS = [

    [1, 0, 0],

    [-1, 0, 0],

    [0, 1, 0],

    [0, -1, 0],

    [0, 0, 1],

    [0, 0, -1]

];


/* ======================================================
   DETERMINISTIC HASH
====================================================== */

function chunkHash3D(
    x,
    y,
    z
) {

    const value =
        Math.sin(

            x * 127.1 +
            y * 269.5 +
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
   TREE HASH
====================================================== */

function chunkHash2D(
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
   TREE GENERATION
====================================================== */

function shouldGenerateTree(
    x,
    z
) {

    const fixedTrees = [

        "4,5",

        "10,8",

        "17,5",

        "18,15",

        "7,18"

    ];


    if (
        fixedTrees.includes(
            x + "," + z
        )
    ) {

        return true;

    }


    return (

        chunkHash2D(
            x,
            z
        )
        >
        0.992

    );

}


/* ======================================================
   ADD BLOCK DATA
====================================================== */

function addChunkDataBlock(
    data,
    x,
    y,
    z,
    type
) {

    if (!type) {

        return;

    }


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
            type
        );

    }

}


/* ======================================================
   ADD TREE
====================================================== */

function addTreeToChunkData(
    data,
    chunkX,
    chunkZ,
    treeX,
    treeZ
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


    const ground =
        terrainHeight(
            treeX,
            treeZ
        );


    /*
       Trunk.
    */

    for (
        let y =
            ground + 1;

        y <=
        ground + 4;

        y++
    ) {

        if (

            treeX >= minX &&
            treeX <= maxX &&

            treeZ >= minZ &&
            treeZ <= maxZ

        ) {

            addChunkDataBlock(

                data,

                treeX,
                y,
                treeZ,

                BLOCKS.wood

            );

        }

    }


    /*
       Leaves.
    */

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

                Math.abs(dx) +
                Math.abs(dz)
                >
                3

            ) {

                continue;

            }


            const leafX =
                treeX +
                dx;


            const leafZ =
                treeZ +
                dz;


            const leafY =
                ground +
                3;


            if (
                leafY <=
                terrainHeight(
                    leafX,
                    leafZ
                )
            ) {

                continue;

            }


            if (

                leafX >= minX &&
                leafX <= maxX &&

                leafZ >= minZ &&
                leafZ <= maxZ

            ) {

                addChunkDataBlock(

                    data,

                    leafX,
                    leafY,
                    leafZ,

                    BLOCKS.leaves

                );

            }

        }

    }

}


/* ======================================================
   GENERATE CHUNK
====================================================== */

function generateChunkData(
    chunkX,
    chunkZ
) {

    const data =
        new Map();


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


    /* ==================================================
       TERRAIN
    ================================================== */

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

            const height =
                terrainHeight(
                    x,
                    z
                );


            for (
                let y =
                    -WORLD_DEPTH;

                y <= height;

                y++
            ) {

                let type;


                /*
                   Grass.
                */

                if (
                    y === height
                ) {

                    type =
                        BLOCKS.grass;

                }


                /*
                   Dirt.
                */

                else if (
                    y >=
                    height - 2
                ) {

                    type =
                        BLOCKS.dirt;

                }


                /*
                   Stone and ores.
                */

                else {

                    type =
                        BLOCKS.stone;


                    const oreRoll =
                        chunkHash3D(

                            x,
                            y,
                            z

                        );


                    if (

                        BLOCKS.diamond_ore &&

                        y <= -15 &&

                        oreRoll <
                        0.02

                    ) {

                        type =
                            BLOCKS.diamond_ore;

                    }

                    else if (

                        BLOCKS.iron_ore &&

                        y <= -5 &&

                        oreRoll <
                        0.055

                    ) {

                        type =
                            BLOCKS.iron_ore;

                    }

                    else if (

                        BLOCKS.coal_ore &&

                        oreRoll <
                        0.09

                    ) {

                        type =
                            BLOCKS.coal_ore;

                    }

                }


                addChunkDataBlock(

                    data,

                    x,
                    y,
                    z,
                    type

                );

            }

        }

    }


    /* ==================================================
       TREES
    ================================================== */

    for (
        let treeX =
            minX - 2;

        treeX <=
        maxX + 2;

        treeX++
    ) {

        for (
            let treeZ =
                minZ - 2;

            treeZ <=
            maxZ + 2;

            treeZ++
        ) {

            if (
                shouldGenerateTree(
                    treeX,
                    treeZ
                )
            ) {

                addTreeToChunkData(

                    data,

                    chunkX,
                    chunkZ,

                    treeX,
                    treeZ

                );

            }

        }

    }


    return data;

}


/* ======================================================
   CHECK BLOCK EXPOSURE
====================================================== */

function chunkBlockIsExposed(
    x,
    y,
    z
) {

    for (
        const offset of
        CHUNK_NEIGHBORS
    ) {

        const key =
            blockKey(

                x +
                offset[0],

                y +
                offset[1],

                z +
                offset[2]

            );


        if (
            !world.has(
                key
            )
        ) {

            return true;

        }

    }


    return false;

}


/* ======================================================
   ORIGINAL ADD BLOCK
====================================================== */

const chunkOriginalAddBlock =
    addBlock;


/* ======================================================
   CREATE SPECIAL MESH
====================================================== */

function createSpecialMeshFromData(
    x,
    y,
    z,
    type
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    if (
        meshes.has(
            key
        )
    ) {

        return;

    }


    if (
        !chunkBlockIsExposed(
            x,
            y,
            z
        )
    ) {

        return;

    }


    const savedType =
        world.get(
            key
        );


    world.delete(
        key
    );


    chunkOriginalAddBlock(

        x,
        y,
        z,
        type

    );


    /*
       Restore world data.
    */

    if (
        savedType
    ) {

        world.set(
            key,
            savedType
        );

    }

}


/* ======================================================
   REMOVE SPECIAL MESH
====================================================== */

function removeSpecialMesh(
    key
) {

    const mesh =
        meshes.get(
            key
        );


    if (!mesh) {

        return;

    }


    scene.remove(
        mesh
    );


    /*
       Shared BLOCK_GEOMETRY must never
       be disposed here.
    */


    if (
        Array.isArray(
            mesh.material
        )
    ) {

        mesh.material.forEach(
            material => {

                if (
                    material &&
                    material.map
                ) {

                    material.map.dispose();

                }


                if (material) {

                    material.dispose();

                }

            }
        );

    }

    else if (
        mesh.material
    ) {

        if (
            mesh.material.map
        ) {

            mesh.material.map.dispose();

        }


        mesh.material.dispose();

    }


    meshes.delete(
        key
    );

}


/* ======================================================
   REMOVE CHUNK RENDER
====================================================== */

function removeChunkRenderObjects(
    chunkX,
    chunkZ
) {

    const key =
        chunkKey(
            chunkX,
            chunkZ
        );


    const renderInfo =
        chunkRenderObjects.get(
            key
        );


    if (!renderInfo) {

        return;

    }


    /*
       Remove normal instanced meshes.
    */

    renderInfo.instancedMeshes
        .forEach(
            mesh => {

                scene.remove(
                    mesh
                );

            }
        );


    /*
       Remove special meshes.
    */

    renderInfo.specialKeys
        .forEach(
            blockKeyValue => {

                removeSpecialMesh(
                    blockKeyValue
                );

            }
        );


    /*
       Remove water surface.

       Water geometry and material are shared
       globally and therefore are NOT disposed.
    */

    if (
        renderInfo.waterMesh
    ) {

        scene.remove(
            renderInfo.waterMesh
        );

    }


    chunkRenderObjects.delete(
        key
    );

}


/* ======================================================
   BUILD CHUNK RENDER
====================================================== */

function buildChunkRender(
    chunkX,
    chunkZ
) {

    const key =
        chunkKey(
            chunkX,
            chunkZ
        );


    const members =
        chunkMembers.get(
            key
        );


    if (!members) {

        return;

    }


    /*
       Remove any previous render.
    */

    removeChunkRenderObjects(

        chunkX,
        chunkZ

    );


    const renderInfo = {

        instancedMeshes: [],

        specialKeys: new Set(),

        waterMesh: null

    };


    const grouped =
        new Map();


    /* ==================================================
       GROUP VISIBLE BLOCKS
    ================================================== */

    members.forEach(
        blockKeyValue => {

            const type =
                world.get(
                    blockKeyValue
                );


            if (!type) {

                return;

            }


            const typeName =
                normalizeChunkBlockName(
                    type
                );


            if (
                isInstancedBlock(
                    type
                )
            ) {

                const parts =
                    blockKeyValue.split(
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


                /*
                   Hidden blocks receive no instance.
                */

                if (
                    !chunkBlockIsExposed(
                        x,
                        y,
                        z
                    )
                ) {

                    return;

                }


                if (
                    !grouped.has(
                        typeName
                    )
                ) {

                    grouped.set(

                        typeName,

                        []

                    );

                }


                grouped
                    .get(
                        typeName
                    )
                    .push({

                        x:
                            x,

                        y:
                            y,

                        z:
                            z,

                        key:
                            blockKeyValue

                    });

            }

            else {

                /*
                   Ores and crafting tables.
                */

                renderInfo.specialKeys.add(
                    blockKeyValue
                );

            }

        }
    );


    /* ==================================================
       BUILD INSTANCED BLOCK MESHES
    ================================================== */

    grouped.forEach(
        (
            blocks,
            typeName
        ) => {

            const type =
                world.get(
                    blocks[0].key
                );


            if (!type) {

                return;

            }


            const materials =
                getSharedMaterials(
                    typeName
                );


            if (!materials) {

                return;

            }


            const mesh =
                new THREE.InstancedMesh(

                    BLOCK_GEOMETRY,

                    materials,

                    blocks.length

                );


            mesh.frustumCulled =
                true;


            const matrix =
                new THREE.Matrix4();


            blocks.forEach(
                (
                    block,
                    index
                ) => {

                    matrix.makeTranslation(

                        block.x,

                        block.y,

                        block.z

                    );


                    mesh.setMatrixAt(

                        index,

                        matrix

                    );

                }
            );


            mesh.instanceMatrix.needsUpdate =
                true;


            mesh.computeBoundingSphere();


            mesh.userData.blockType =
                typeName;


            mesh.userData.chunkX =
                chunkX;


            mesh.userData.chunkZ =
                chunkZ;


            scene.add(
                mesh
            );


            renderInfo.instancedMeshes.push(
                mesh
            );

        }
    );


    /* ==================================================
       BUILD SPECIAL BLOCKS
    ================================================== */

    renderInfo.specialKeys
        .forEach(
            blockKeyValue => {

                const parts =
                    blockKeyValue.split(
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


                const type =
                    world.get(
                        blockKeyValue
                    );


                if (!type) {

                    return;

                }


                createSpecialMeshFromData(

                    x,
                    y,
                    z,
                    type

                );

            }
        );


    /* ==================================================
       BUILD WATER
    ================================================== */

    /*
       Water is completely separate from block data.

       One instanced water surface is created for this
       entire chunk.
    */

    if (
        typeof buildWaterSurfaceForChunk ===
        "function"
    ) {

        renderInfo.waterMesh =
            buildWaterSurfaceForChunk(

                chunkX,

                chunkZ

            );

    }


    chunkRenderObjects.set(

        key,

        renderInfo

    );

}


/* ======================================================
   REFRESH CHUNK
====================================================== */

function refreshChunk(
    chunkX,
    chunkZ
) {

    if (
        !loadedChunks.has(
            chunkKey(
                chunkX,
                chunkZ
            )
        )
    ) {

        return;

    }


    buildChunkRender(

        chunkX,

        chunkZ

    );

}


/* ======================================================
   REFRESH CHUNK AROUND BLOCK
====================================================== */

function refreshChunkAroundBlock(
    x,
    y,
    z
) {

    const chunkX =
        getChunkCoordinate(
            x
        );


    const chunkZ =
        getChunkCoordinate(
            z
        );


    refreshChunk(

        chunkX,

        chunkZ

    );


    /*
       Update neighboring chunk boundaries.
    */

    if (
        x % CHUNK_SIZE === 0
    ) {

        refreshChunk(

            chunkX - 1,

            chunkZ

        );

    }


    if (
        x % CHUNK_SIZE ===
        CHUNK_SIZE - 1
    ) {

        refreshChunk(

            chunkX + 1,

            chunkZ

        );

    }


    if (
        z % CHUNK_SIZE === 0
    ) {

        refreshChunk(

            chunkX,

            chunkZ - 1

        );

    }


    if (
        z % CHUNK_SIZE ===
        CHUNK_SIZE - 1
    ) {

        refreshChunk(

            chunkX,

            chunkZ + 1

        );

    }

}


/* ======================================================
   LOAD CHUNK
====================================================== */

function loadChunk(
    chunkX,
    chunkZ
) {

    const key =
        chunkKey(
            chunkX,
            chunkZ
        );


    if (
        loadedChunks.has(
            key
        )
    ) {

        return;

    }


    let data =
        chunkStorage.get(
            key
        );


    /*
       New chunk.
    */

    if (!data) {

        data =
            generateChunkData(

                chunkX,

                chunkZ

            );

    }


    /*
       Put blocks into world.
    */

    const members =
        new Set();


    data.forEach(
        (
            type,
            blockKeyValue
        ) => {

            world.set(

                blockKeyValue,

                type

            );


            members.add(
                blockKeyValue
            );

        }
    );


    chunkMembers.set(

        key,

        members

    );


    loadedChunks.add(
        key
    );


    /*
       Build render.
    */

    buildChunkRender(

        chunkX,

        chunkZ

    );

}


/* ======================================================
   UNLOAD CHUNK
====================================================== */

function unloadChunk(
    chunkX,
    chunkZ
) {

    const key =
        chunkKey(
            chunkX,
            chunkZ
        );


    if (
        !loadedChunks.has(
            key
        )
    ) {

        return;

    }


    const members =
        chunkMembers.get(
            key
        );


    const savedData =
        new Map();


    if (members) {

        members.forEach(
            blockKeyValue => {

                if (
                    world.has(
                        blockKeyValue
                    )
                ) {

                    savedData.set(

                        blockKeyValue,

                        world.get(
                            blockKeyValue
                        )

                    );

                }

            }
        );

    }


    /*
       Remove rendering.
    */

    removeChunkRenderObjects(

        chunkX,

        chunkZ

    );


    /*
       Remove world blocks.
    */

    if (members) {

        members.forEach(
            blockKeyValue => {

                world.delete(
                    blockKeyValue
                );

            }
        );

    }


    /*
       Save chunk.
    */

    chunkStorage.set(

        key,

        savedData

    );


    chunkMembers.delete(
        key
    );


    loadedChunks.delete(
        key
    );

}


/* ======================================================
   DESIRED CHUNKS
====================================================== */

function getDesiredChunks(
    centerX,
    centerZ
) {

    const result = [];


    for (
        let dx =
            -CHUNK_RENDER_DISTANCE;

        dx <=
        CHUNK_RENDER_DISTANCE;

        dx++
    ) {

        for (
            let dz =
                -CHUNK_RENDER_DISTANCE;

            dz <=
            CHUNK_RENDER_DISTANCE;

            dz++
        ) {

            result.push({

                x:
                    centerX + dx,

                z:
                    centerZ + dz,

                distance:

                    Math.abs(
                        dx
                    ) +

                    Math.abs(
                        dz
                    )

            });

        }

    }


    result.sort(
        (
            a,
            b
        ) =>
            a.distance -
            b.distance
    );


    return result;

}


/* ======================================================
   UPDATE CHUNK SYSTEM
====================================================== */

function updateChunksAroundPlayer() {

    const playerChunkX =
        getChunkCoordinate(
            camera.position.x
        );


    const playerChunkZ =
        getChunkCoordinate(
            camera.position.z
        );


    /*
       Nothing changed.
    */

    if (

        playerChunkX ===
        currentChunkX &&

        playerChunkZ ===
        currentChunkZ

    ) {

        return;

    }


    currentChunkX =
        playerChunkX;


    currentChunkZ =
        playerChunkZ;


    const desired =
        getDesiredChunks(

            playerChunkX,

            playerChunkZ

        );


    const desiredKeys =
        new Set();


    desired.forEach(
        chunk => {

            desiredKeys.add(

                chunkKey(

                    chunk.x,

                    chunk.z

                )

            );

        }
    );


    /* ==================================================
       UNLOAD
    ================================================== */

    const unloadList = [];


    loadedChunks.forEach(
        key => {

            if (
                !desiredKeys.has(
                    key
                )
            ) {

                unloadList.push(
                    key
                );

            }

        }
    );


    unloadList.forEach(
        key => {

            const parts =
                key.split(
                    ","
                );


            unloadChunk(

                Number(
                    parts[0]
                ),

                Number(
                    parts[1]
                )

            );

        }
    );


    /* ==================================================
       QUEUE NEW CHUNKS
    ================================================== */

    chunkLoadQueue = [];


    desired.forEach(
        chunk => {

            const key =
                chunkKey(

                    chunk.x,

                    chunk.z

                );


            if (
                !loadedChunks.has(
                    key
                )
            ) {

                chunkLoadQueue.push({

                    x:
                        chunk.x,

                    z:
                        chunk.z

                });

            }

        }
    );

}


/* ======================================================
   PROCESS CHUNK QUEUE
====================================================== */

function processChunkLoadQueue() {

    let loadedThisFrame = 0;


    while (

        chunkLoadQueue.length >

        0 &&

        loadedThisFrame <

        CHUNKS_PER_FRAME

    ) {

        /*
           Closest first.
        */

        chunkLoadQueue.sort(
            (
                a,
                b
            ) => {

                const da =
                    Math.abs(

                        a.x -
                        currentChunkX

                    ) +

                    Math.abs(

                        a.z -
                        currentChunkZ

                    );


                const db =
                    Math.abs(

                        b.x -
                        currentChunkX

                    ) +

                    Math.abs(

                        b.z -
                        currentChunkZ

                    );


                return da - db;

            }
        );


        const next =
            chunkLoadQueue.shift();


        if (!next) {

            break;

        }


        const key =
            chunkKey(

                next.x,

                next.z

            );


        if (
            loadedChunks.has(
                key
            )
        ) {

            continue;

        }


        loadChunk(

            next.x,

            next.z

        );


        /*
           Refresh borders.
        */

        refreshChunk(

            next.x + 1,

            next.z

        );


        refreshChunk(

            next.x - 1,

            next.z

        );


        refreshChunk(

            next.x,

            next.z + 1

        );


        refreshChunk(

            next.x,

            next.z - 1

        );


        loadedThisFrame++;

    }

}


/* ======================================================
   ADD BLOCK
====================================================== */

addBlock =
    function(
        x,
        y,
        z,
        type
    ) {

        const key =
            blockKey(

                x,

                y,

                z

            );


        if (
            world.has(
                key
            )
        ) {

            return;

        }


        /*
           Normal terrain.

           Store in chunk data without creating
           an individual mesh.
        */

        if (
            isInstancedBlock(
                type
            )
        ) {

            world.set(

                key,

                type

            );


            const cx =
                getChunkCoordinate(
                    x
                );


            const cz =
                getChunkCoordinate(
                    z
                );


            const cKey =
                chunkKey(

                    cx,

                    cz

                );


            if (
                !chunkMembers.has(
                    cKey
                )
            ) {

                chunkMembers.set(

                    cKey,

                    new Set()

                );

            }


            chunkMembers
                .get(
                    cKey
                )
                .add(
                    key
                );


            refreshChunkAroundBlock(

                x,

                y,

                z

            );


            return;

        }


        /*
           Special blocks.
        */

        chunkOriginalAddBlock(

            x,

            y,

            z,

            type

        );


        if (
            !world.has(
                key
            )
        ) {

            return;

        }


        const cx =
            getChunkCoordinate(
                x
            );


        const cz =
            getChunkCoordinate(
                z
            );


        const cKey =
            chunkKey(

                cx,

                cz

            );


        if (
            !chunkMembers.has(
                cKey
            )
        ) {

            chunkMembers.set(

                cKey,

                new Set()

            );

        }


        chunkMembers
            .get(
                cKey
            )
            .add(
                key
            );


        refreshChunkAroundBlock(

            x,

            y,

            z

        );

    };


/* ======================================================
   COMPATIBILITY CULLING FUNCTION
====================================================== */

function updateCullingAround(
    x,
    y,
    z
) {

    refreshChunkAroundBlock(

        x,

        y,

        z

    );

}


/* ======================================================
   GENERATE WORLD
====================================================== */

generateWorld =
    function() {

        /*
           Remove old chunk renderer objects.
        */

        chunkRenderObjects.forEach(
            renderInfo => {

                renderInfo.instancedMeshes
                    .forEach(
                        mesh => {

                            scene.remove(
                                mesh
                            );

                        }
                    );


                renderInfo.specialKeys
                    .forEach(
                        key => {

                            removeSpecialMesh(
                                key
                            );

                        }
                    );


                if (
                    renderInfo.waterMesh
                ) {

                    scene.remove(
                        renderInfo.waterMesh
                    );

                }

            }
        );


        chunkRenderObjects.clear();


        world.clear();

        meshes.clear();

        loadedChunks.clear();

        chunkMembers.clear();

        chunkStorage.clear();

        chunkLoadQueue = [];


        currentChunkX = 0;

        currentChunkZ = 0;


        /*
           Initial 3 x 3 chunks.

           Generate all block data first so
           culling works correctly across borders.
        */

        const initialChunks = [];


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

                const cx =
                    dx;


                const cz =
                    dz;


                const data =
                    generateChunkData(

                        cx,

                        cz

                    );


                const key =
                    chunkKey(

                        cx,

                        cz

                    );


                const members =
                    new Set();


                data.forEach(

                    (
                        type,

                        blockKeyValue

                    ) => {

                        world.set(

                            blockKeyValue,

                            type

                        );


                        members.add(
                            blockKeyValue
                        );

                    }

                );


                chunkMembers.set(

                    key,

                    members

                );


                loadedChunks.add(
                    key
                );


                initialChunks.push([

                    cx,

                    cz

                ]);

            }

        }


        /*
           Render after all block data exists.
        */

        initialChunks.forEach(
            (
                [cx, cz]
            ) => {

                buildChunkRender(

                    cx,

                    cz

                );

            }
        );


        console.log(

            "Professional chunk renderer enabled!"

        );


        console.log(

            "Loaded chunks:",

            loadedChunks.size

        );

    };


console.log(

    "Chunk streaming + instanced rendering ready!"

);