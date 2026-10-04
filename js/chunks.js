/*
=========================================================
BLOCKWORLD
Chunk System
=========================================================

16 x 16 chunks
1 chunk render distance

The world can extend far beyond the original 24 x 24
area, while only nearby chunks are kept active.

=========================================================
*/


/* ======================================================
   CHUNK SETTINGS
====================================================== */

const CHUNK_SIZE = 16;


/*
   1 means:

       [chunk][chunk][chunk]
       [chunk][PLAYER][chunk]
       [chunk][chunk][chunk]

   9 chunks loaded at once.
*/

const CHUNK_RENDER_DISTANCE = 1;


/* ======================================================
   CHUNK STORAGE
====================================================== */

/*
   Loaded chunk keys.
*/

const loadedChunks =
    new Set();


/*
   Saved block data for chunks that have
   been unloaded.

   This means mining and placing blocks
   survives when leaving and returning.
*/

const chunkStorage =
    new Map();


/*
   Every currently loaded chunk keeps a Set
   of its block keys.

   This makes saving/unloading much faster.
*/

const chunkMembers =
    new Map();


let currentChunkX = 0;

let currentChunkZ = 0;


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
   WORLD → CHUNK
====================================================== */

function getChunkCoordinate(
    value
) {

    return Math.floor(
        value / CHUNK_SIZE
    );

}


/* ======================================================
   SIMPLE DETERMINISTIC HASH
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
        ) *
        43758.5453123;


    return (
        value -
        Math.floor(value)
    );

}


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
        ) *
        43758.5453123;


    return (
        value -
        Math.floor(value)
    );

}


/* ======================================================
   ADD BLOCK TO CHUNK DATA
====================================================== */

function addChunkDataBlock(
    data,
    x,
    y,
    z,
    type
) {

    /*
       Don't overwrite an existing block.
    */

    const key =
        blockKey(
            x,
            y,
            z
        );


    if (
        !data.has(key)
    ) {

        data.set(
            key,
            type
        );

    }

}


/* ======================================================
   GENERATE TREE
====================================================== */

function addTreeToChunkData(
    data,
    chunkX,
    chunkZ,
    treeX,
    treeZ
) {

    const chunkMinX =
        chunkX *
        CHUNK_SIZE;


    const chunkMaxX =
        chunkMinX +
        CHUNK_SIZE -
        1;


    const chunkMinZ =
        chunkZ *
        CHUNK_SIZE;


    const chunkMaxZ =
        chunkMinZ +
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
            treeX >= chunkMinX &&
            treeX <= chunkMaxX &&
            treeZ >= chunkMinZ &&
            treeZ <= chunkMaxZ
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
                Math.abs(dz) >
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
                ground + 3;


            /*
               Don't put leaves inside another
               column's terrain.
            */

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
                leafX >= chunkMinX &&
                leafX <= chunkMaxX &&
                leafZ >= chunkMinZ &&
                leafZ <= chunkMaxZ
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
   TREE DECISION
====================================================== */

function shouldGenerateTree(
    x,
    z
) {

    /*
       Keep your original trees.
    */

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


    /*
       Rare procedural trees for the
       newly generated world.
    */

    return (
        chunkHash2D(
            x,
            z
        ) > 0.992
    );

}


/* ======================================================
   GENERATE CHUNK DATA
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
                   Surface.
                */

                if (
                    y === height
                ) {

                    type =
                        BLOCKS.grass;

                }


                /*
                   Two dirt layers.
                */

                else if (
                    y >=
                    height - 2
                ) {

                    type =
                        BLOCKS.dirt;

                }


                /*
                   Underground stone.
                */

                else {

                    type =
                        BLOCKS.stone;


                    /*
                       Deterministic ores.

                       These are generated per chunk,
                       so newly discovered chunks get
                       ores without needing generateOres().
                    */

                    const oreRoll =
                        chunkHash3D(
                            x,
                            y,
                            z
                        );


                    /*
                       Diamond.
                    */

                    if (
                        BLOCKS.diamond_ore &&
                        y <= -15 &&
                        oreRoll < 0.02
                    ) {

                        type =
                            BLOCKS.diamond_ore;

                    }


                    /*
                       Iron.
                    */

                    else if (
                        BLOCKS.iron_ore &&
                        y <= -5 &&
                        oreRoll < 0.055
                    ) {

                        type =
                            BLOCKS.iron_ore;

                    }


                    /*
                       Coal.
                    */

                    else if (
                        BLOCKS.coal_ore &&
                        oreRoll < 0.09
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

    /*
       Search slightly outside the chunk so leaves
       and trunks that cross chunk boundaries are
       generated in the correct chunk.
    */

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
   LOAD CHUNK DATA INTO WORLD
====================================================== */

function populateWorldFromChunk(
    chunkX,
    chunkZ,
    data
) {

    const key =
        chunkKey(
            chunkX,
            chunkZ
        );


    const members =
        new Set();


    data.forEach(
        (
            type,
            blockKeyValue
        ) => {

            /*
               Do not create duplicate world blocks.
            */

            if (
                !world.has(
                    blockKeyValue
                )
            ) {

                world.set(
                    blockKeyValue,
                    type
                );

            }


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

        return false;

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


    populateWorldFromChunk(
        chunkX,
        chunkZ,
        data
    );


    return true;

}


/* ======================================================
   UPDATE ONE MESH
====================================================== */

function refreshBlockMeshFromKey(
    key
) {

    const parts =
        String(
            key
        ).split(
            ","
        );


    if (
        parts.length !== 3
    ) {

        return;

    }


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


    updateCulledBlock(
        x,
        y,
        z
    );

}


/* ======================================================
   BUILD VISIBLE MESHES FOR CHUNK
====================================================== */

function buildVisibleMeshesForChunk(
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
       All required world data is already present.

       Hidden blocks will not get a mesh.
    */

    members.forEach(
        blockKeyValue => {

            refreshBlockMeshFromKey(
                blockKeyValue
            );

        }
    );

}


/* ======================================================
   REFRESH LOADED CHUNK FACE
====================================================== */

function refreshChunkFace(
    chunkX,
    chunkZ,
    directionX,
    directionZ
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


    members.forEach(
        blockKeyValue => {

            const parts =
                String(
                    blockKeyValue
                ).split(
                    ","
                );


            if (
                parts.length !== 3
            ) {

                return;

            }


            const x =
                Number(
                    parts[0]
                );


            const z =
                Number(
                    parts[2]
                );


            /*
               X face.
            */

            if (
                directionX !== 0
            ) {

                if (
                    directionX > 0 &&
                    x !== maxX
                ) {

                    return;

                }


                if (
                    directionX < 0 &&
                    x !== minX
                ) {

                    return;

                }

            }


            /*
               Z face.
            */

            if (
                directionZ !== 0
            ) {

                if (
                    directionZ > 0 &&
                    z !== maxZ
                ) {

                    return;

                }


                if (
                    directionZ < 0 &&
                    z !== minZ
                ) {

                    return;

                }

            }


            refreshBlockMeshFromKey(
                blockKeyValue
            );

        }
    );

}


/* ======================================================
   REFRESH SHARED BOUNDARY
====================================================== */

function refreshSharedBoundary(
    chunkX,
    chunkZ,
    neighborX,
    neighborZ
) {

    const dx =
        neighborX -
        chunkX;


    const dz =
        neighborZ -
        chunkZ;


    /*
       Current chunk face.
    */

    refreshChunkFace(
        chunkX,
        chunkZ,
        dx,
        dz
    );


    /*
       Neighbor's opposite face.
    */

    refreshChunkFace(
        neighborX,
        neighborZ,
        -dx,
        -dz
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

                /*
                   Save the latest world state.
                */

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


                /*
                   Remove its visible mesh.
                */

                if (
                    meshes.has(
                        blockKeyValue
                    )
                ) {

                    removeCulledMesh(
                        blockKeyValue
                    );

                }


                /*
                   Remove from world.
                */

                world.delete(
                    blockKeyValue
                );

            }
        );

    }


    /*
       Save the chunk for later.
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

function getDesiredChunkKeys(
    centerX,
    centerZ
) {

    const keys =
        new Set();


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

            keys.add(
                chunkKey(
                    centerX + dx,
                    centerZ + dz
                )
            );

        }

    }


    return keys;

}


/* ======================================================
   UPDATE CHUNKS AROUND PLAYER
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
        playerChunkX === currentChunkX &&
        playerChunkZ === currentChunkZ &&
        loadedChunks.size > 0
    ) {

        return;

    }


    currentChunkX =
        playerChunkX;


    currentChunkZ =
        playerChunkZ;


    const desired =
        getDesiredChunkKeys(
            playerChunkX,
            playerChunkZ
        );


    /* ==================================================
       UNLOAD DISTANT CHUNKS
    ================================================== */

    const chunksToUnload = [];


    loadedChunks.forEach(
        key => {

            if (
                !desired.has(
                    key
                )
            ) {

                chunksToUnload.push(
                    key
                );

            }

        }
    );


    chunksToUnload.forEach(
        key => {

            const parts =
                key.split(
                    ","
                );


            unloadChunk(
                Number(parts[0]),
                Number(parts[1])
            );

        }
    );


    /* ==================================================
       LOAD NEW CHUNKS
    ================================================== */

    const newlyLoaded = [];


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

            const cx =
                playerChunkX +
                dx;


            const cz =
                playerChunkZ +
                dz;


            const key =
                chunkKey(
                    cx,
                    cz
                );


            if (
                !loadedChunks.has(
                    key
                )
            ) {

                loadChunk(
                    cx,
                    cz
                );


                newlyLoaded.push([
                    cx,
                    cz
                ]);

            }

        }

    }


    /* ==================================================
       BUILD NEW VISIBLE MESHES
    ================================================== */

    newlyLoaded.forEach(
        ([cx, cz]) => {

            buildVisibleMeshesForChunk(
                cx,
                cz
            );

        }
    );


    /* ==================================================
       REFRESH SHARED BOUNDARIES
    ================================================== */

    newlyLoaded.forEach(
        ([cx, cz]) => {

            const directions = [

                [1, 0],

                [-1, 0],

                [0, 1],

                [0, -1]

            ];


            directions.forEach(
                ([dx, dz]) => {

                    const neighborKey =
                        chunkKey(
                            cx + dx,
                            cz + dz
                        );


                    if (
                        loadedChunks.has(
                            neighborKey
                        )
                    ) {

                        refreshSharedBoundary(

                            cx,
                            cz,

                            cx + dx,
                            cz + dz

                        );

                    }

                }
            );

        }
    );

}


/* ======================================================
   INITIAL WORLD GENERATION
====================================================== */

/*
   The old world.js still contains generateWorld().

   We replace it here with the chunk-based version.

   main.js can continue calling generateWorld()
   exactly as before.
*/

generateWorld =
    function() {

        /*
           Remove any existing meshes.

           IMPORTANT:
           Do not dispose BLOCK_GEOMETRY.
        */

        meshes.forEach(
            (
                cube,
                key
            ) => {

                scene.remove(
                    cube
                );


                if (
                    Array.isArray(
                        cube.material
                    )
                ) {

                    cube.material.forEach(
                        material => {

                            if (
                                material.map
                            ) {

                                material.map.dispose();

                            }


                            material.dispose();

                        }
                    );

                }

                else {

                    if (
                        cube.material &&
                        cube.material.map
                    ) {

                        cube.material.map.dispose();

                    }


                    if (
                        cube.material
                    ) {

                        cube.material.dispose();

                    }

                }

            }
        );


        world.clear();

        meshes.clear();

        loadedChunks.clear();

        chunkMembers.clear();

        chunkStorage.clear();


        currentChunkX = 0;

        currentChunkZ = 0;


        /*
           Initial 3 x 3 chunk area.
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

                loadChunk(
                    dx,
                    dz
                );


                initialChunks.push([
                    dx,
                    dz
                ]);

            }

        }


        /*
           Build visible blocks only after ALL
           nine chunks exist in world data.

           This means chunk boundaries are correctly
           culled from the beginning.
        */

        initialChunks.forEach(
            ([cx, cz]) => {

                buildVisibleMeshesForChunk(
                    cx,
                    cz
                );

            }
        );


        console.log(
            "Chunk system loaded!"
        );

        console.log(
            "Loaded chunks:",
            loadedChunks.size
        );

    };


/* ======================================================
   TRACK NEW BLOCKS
====================================================== */

const chunkOriginalAddBlock =
    addBlock;


addBlock =
    function(
        x,
        y,
        z,
        type
    ) {

        chunkOriginalAddBlock(
            x,
            y,
            z,
            type
        );


        const key =
            blockKey(
                x,
                y,
                z
            );


        /*
           Only track blocks that actually exist.
        */

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
            .get(cKey)
            .add(key);

    };


/* ======================================================
   TRACK BROKEN BLOCKS
====================================================== */

const chunkOriginalBreakBlock =
    breakBlock;


breakBlock =
    function(
        cube
    ) {

        if (!cube) {

            return;

        }


        const key =
            cube.userData.key;


        /*
           Run normal mining/culling logic.
        */

        chunkOriginalBreakBlock(
            cube
        );


        if (!key) {

            return;

        }


        const parts =
            String(
                key
            ).split(
                ","
            );


        if (
            parts.length !== 3
        ) {

            return;

        }


        const x =
            Number(
                parts[0]
            );


        const z =
            Number(
                parts[2]
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


        const members =
            chunkMembers.get(
                cKey
            );


        if (members) {

            members.delete(
                key
            );

        }

    };


/* ======================================================
   STARTUP
====================================================== */

console.log(
    "Chunk manager ready!"
);