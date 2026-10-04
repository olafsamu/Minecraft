/*
=========================================================
BLOCKWORLD
Water System
=========================================================

IMPORTANT:

Water is stored as full blocks in world data.

However, water is NOT rendered as full cubes.

Only the TOPMOST water block in each vertical column
gets a visible water surface.

This prevents:

- Glass-wall effects
- Repeated transparent layers
- Visible water cube sides
- Weird transparent stacking

Water remains non-solid for the player.

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
   REGISTER WATER AS INSTANCED BLOCK
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
       Base water.
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
       Light reflections.
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
       Darker variation.
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
   CREATE SHARED WATER CUBE MATERIALS
====================================================== */

/*
   The chunk renderer expects water to have a normal
   shared material set.

   These materials are only used temporarily by the
   generic chunk builder before we replace the visual
   representation with the proper water surface.
*/

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
                    0.55,

                depthWrite:
                    false,

                side:
                    THREE.DoubleSide

            }

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
   WATER SURFACE GEOMETRY
====================================================== */

const WATER_SURFACE_GEOMETRY =
    new THREE.PlaneGeometry(
        1,
        1
    );


/* ======================================================
   WATER SURFACE MATERIAL
====================================================== */

let waterSurfaceMaterial =
    null;


function getWaterSurfaceMaterial() {

    if (
        waterSurfaceMaterial
    ) {

        return waterSurfaceMaterial;

    }


    const texture =
        createWaterTexture();


    waterSurfaceMaterial =
        new THREE.MeshLambertMaterial({

            map:
                texture,

            transparent:
                true,

            opacity:
                0.62,

            depthWrite:
                false,

            side:
                THREE.DoubleSide

        });


    /*
       Mark it as shared.

       Our other systems may call dispose()
       when a chunk is removed.
    */

    waterSurfaceMaterial
        .userData
        .sharedBlockMaterial =
        true;


    waterSurfaceMaterial
        .userData
        .sharedBlockTexture =
        true;


    const originalDispose =
        waterSurfaceMaterial.dispose;


    waterSurfaceMaterial.dispose =
        function() {

            /*
               The material belongs to the global
               water rendering system.

               Keep it alive while the game runs.
            */

        };


    return waterSurfaceMaterial;

}


/* ======================================================
   FIND TOP WATER BLOCKS
====================================================== */

function getWaterSurfaceBlocks(
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

        return [];

    }


    const surfaces = [];


    members.forEach(
        blockKeyValue => {

            const type =
                world.get(
                    blockKeyValue
                );


            if (!type) {

                return;

            }


            const name =
                normalizeChunkBlockName(
                    type
                );


            if (
                name !== "water"
            ) {

                return;

            }


            const parts =
                blockKeyValue.split(
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


            /*
               We ONLY render this water block if
               there is no water directly above it.

               This gives us exactly one surface per
               vertical water column.
            */

            const blockAbove =
                world.get(

                    blockKey(

                        x,

                        y + 1,

                        z

                    )

                );


            if (blockAbove) {

                const aboveName =
                    normalizeChunkBlockName(
                        blockAbove
                    );


                if (
                    aboveName ===
                    "water"
                ) {

                    return;

                }

            }


            /*
               There is a solid block above.

               No visible water surface belongs here.
            */

            if (
                blockAbove
            ) {

                return;

            }


            surfaces.push({

                x: x,

                y: y,

                z: z

            });

        }
    );


    return surfaces;

}


/* ======================================================
   BUILD WATER SURFACE
====================================================== */

function buildWaterSurface(
    chunkX,
    chunkZ
) {

    const surfaces =
        getWaterSurfaceBlocks(
            chunkX,
            chunkZ
        );


    if (
        surfaces.length === 0
    ) {

        return null;

    }


    const material =
        getWaterSurfaceMaterial();


    /*
       One InstancedMesh contains ALL water
       surfaces in this chunk.
    */

    const mesh =
        new THREE.InstancedMesh(

            WATER_SURFACE_GEOMETRY,

            material,

            surfaces.length

        );


    /*
       The plane initially faces +Z.

       Rotate it so it lies horizontally.
    */

    const matrix =
        new THREE.Matrix4();


    const rotation =
        new THREE.Matrix4();


    rotation.makeRotationX(
        -Math.PI / 2
    );


    const translation =
        new THREE.Matrix4();


    const finalMatrix =
        new THREE.Matrix4();


    surfaces.forEach(
        (
            water,
            index
        ) => {

            translation.makeTranslation(

                water.x +
                0.5,

                water.y +
                0.995,

                water.z +
                0.5

            );


            finalMatrix.multiplyMatrices(

                translation,

                rotation

            );


            matrix.copy(
                finalMatrix
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


    mesh.userData.blockType =
        "water";


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
   REPLACE GENERIC WATER RENDERING
====================================================== */

/*
   Save the original chunk renderer.
*/

const waterOriginalBuildChunkRender =
    buildChunkRender;


buildChunkRender =
    function(
        chunkX,
        chunkZ
    ) {

        /*
           Let the normal chunk renderer build the
           terrain first.
        */

        waterOriginalBuildChunkRender(

            chunkX,

            chunkZ

        );


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
           Find the generic water InstancedMesh.

           It exists because water is registered as
           an instanced block type.
        */

        const oldWaterMeshes = [];


        renderInfo.instancedMeshes
            .forEach(
                mesh => {

                    if (
                        mesh.userData &&
                        mesh.userData.blockType ===
                        "water"
                    ) {

                        oldWaterMeshes.push(
                            mesh
                        );

                    }

                }
            );


        /*
           Remove the old cube representation.
        */

        oldWaterMeshes.forEach(
            mesh => {

                scene.remove(
                    mesh
                );


                const index =
                    renderInfo
                        .instancedMeshes
                        .indexOf(
                            mesh
                        );


                if (
                    index !== -1
                ) {

                    renderInfo
                        .instancedMeshes
                        .splice(
                            index,
                            1
                        );

                }

            }
        );


        /*
           Create the proper flat water surface.
        */

        const waterSurface =
            buildWaterSurface(

                chunkX,

                chunkZ

            );


        if (
            waterSurface
        ) {

            renderInfo
                .instancedMeshes
                .push(
                    waterSurface
                );

        }

    };


/* ======================================================
   PREVENT TREES FROM SPAWNING INSIDE LAKES
====================================================== */

const waterOriginalShouldGenerateTree =
    shouldGenerateTree;


shouldGenerateTree =
    function(
        x,
        z
    ) {

        /*
           Don't generate trees in areas that
           will become flooded.
        */

        if (
            terrainHeight(
                x,
                z
            ) <
            WATER_LEVEL
        ) {

            return false;

        }


        return waterOriginalShouldGenerateTree(
            x,
            z
        );

    };


/* ======================================================
   LAKE GENERATION
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
       High ground stays land.
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
        )

        + 1

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
               Fill the entire basin with water data.

               Only the top block will be rendered.
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

        const data =
            waterOriginalGenerateChunkData(

                chunkX,

                chunkZ

            );


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
    "Professional water renderer enabled!"
);