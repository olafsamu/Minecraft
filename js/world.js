/*
=========================================================
BLOCKWORLD
World Generation + Block Rendering
=========================================================
*/


const world = new Map();

const meshes = new Map();


const WORLD_SIZE = 24;

const WORLD_DEPTH = 32;
/* ======================================================
   BLOCK KEY
====================================================== */

function blockKey(x, y, z) {

    return (
        x + "," +
        y + "," +
        z
    );

}


/* ======================================================
   TERRAIN HEIGHT
====================================================== */

function terrainHeight(x, z) {

    return Math.max(

        1,

        Math.min(

            6,

            Math.floor(

                3 +

                Math.sin(
                    x * 0.4
                ) +

                Math.cos(
                    z * 0.35
                ) +

                Math.sin(
                    (x + z) * 0.2
                )

            )

        )

    );

}


/* ======================================================
   CREATE CRAFTING TABLE TEXTURES
====================================================== */

function createCraftingTableMaterials() {

    /*
       BoxGeometry material order:

       0 = right
       1 = left
       2 = top
       3 = bottom
       4 = front
       5 = back
    */


    const materials = [];


    /* ==================================================
       CREATE SIDE TEXTURE
    ================================================== */

    function createSideTexture() {

        const canvas =
            document.createElement("canvas");

        canvas.width = 64;
        canvas.height = 64;


        const ctx =
            canvas.getContext("2d");


        /*
           Base wood.
        */

        ctx.fillStyle =
            "#7a4b25";

        ctx.fillRect(
            0,
            0,
            64,
            64
        );


        /*
           Wooden vertical boards.
        */

        ctx.fillStyle =
            "#8f5b2d";


        ctx.fillRect(
            4,
            0,
            18,
            64
        );


        ctx.fillRect(
            27,
            0,
            15,
            64
        );


        ctx.fillRect(
            47,
            0,
            13,
            64
        );


        /*
           Dark seams between boards.
        */

        ctx.fillStyle =
            "#543218";


        ctx.fillRect(
            22,
            0,
            4,
            64
        );


        ctx.fillRect(
            42,
            0,
            4,
            64
        );


        /*
           Horizontal wooden details.
        */

        ctx.fillStyle =
            "#68401f";


        ctx.fillRect(
            0,
            8,
            64,
            3
        );


        ctx.fillRect(
            0,
            52,
            64,
            3
        );


        /*
           Small tool-like markings.
        */

        ctx.fillStyle =
            "#3f2715";


        ctx.fillRect(
            8,
            19,
            8,
            3
        );


        ctx.fillRect(
            12,
            16,
            3,
            12
        );


        ctx.fillRect(
            34,
            29,
            10,
            3
        );


        ctx.fillRect(
            38,
            25,
            3,
            11
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.magFilter =
            THREE.NearestFilter;


        texture.minFilter =
            THREE.NearestFilter;


        return texture;

    }


    /* ==================================================
       CREATE TOP TEXTURE
    ================================================== */

    function createTopTexture() {

        const canvas =
            document.createElement("canvas");

        canvas.width = 64;
        canvas.height = 64;


        const ctx =
            canvas.getContext("2d");


        /*
           Wooden base.
        */

        ctx.fillStyle =
            "#9b6938";

        ctx.fillRect(
            0,
            0,
            64,
            64
        );


        /*
           Outer dark border.
        */

        ctx.fillStyle =
            "#4b2d18";

        ctx.fillRect(
            2,
            2,
            60,
            60
        );


        /*
           Inner wooden area.
        */

        ctx.fillStyle =
            "#b07a43";

        ctx.fillRect(
            6,
            6,
            52,
            52
        );


        /*
           Crafting grid background.
        */

        ctx.fillStyle =
            "#6e431f";


        /*
           Vertical grid lines.
        */

        ctx.fillRect(
            19,
            10,
            4,
            44
        );


        ctx.fillRect(
            37,
            10,
            4,
            44
        );


        /*
           Horizontal grid lines.
        */

        ctx.fillRect(
            10,
            19,
            44,
            4
        );


        ctx.fillRect(
            10,
            37,
            44,
            4
        );


        /*
           Lighter squares.
        */

        ctx.fillStyle =
            "#c28b50";


        ctx.fillRect(
            10,
            10,
            9,
            9
        );


        ctx.fillRect(
            23,
            10,
            14,
            9
        );


        ctx.fillRect(
            41,
            10,
            13,
            9
        );


        ctx.fillRect(
            10,
            23,
            9,
            14
        );


        ctx.fillRect(
            23,
            23,
            14,
            14
        );


        ctx.fillRect(
            41,
            23,
            13,
            14
        );


        ctx.fillRect(
            10,
            41,
            9,
            13
        );


        ctx.fillRect(
            23,
            41,
            14,
            13
        );


        ctx.fillRect(
            41,
            41,
            13,
            13
        );


        /*
           Tiny dark corners.
        */

        ctx.fillStyle =
            "#432817";


        ctx.fillRect(
            2,
            2,
            8,
            3
        );


        ctx.fillRect(
            2,
            2,
            3,
            8
        );


        ctx.fillRect(
            54,
            2,
            8,
            3
        );


        ctx.fillRect(
            59,
            2,
            3,
            8
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.magFilter =
            THREE.NearestFilter;


        texture.minFilter =
            THREE.NearestFilter;


        return texture;

    }


    /* ==================================================
       CREATE MATERIALS
    ================================================== */

    const sideTexture =
        createSideTexture();


    const topTexture =
        createTopTexture();


    const sideMaterial =
        new THREE.MeshLambertMaterial({
            map: sideTexture
        });


    const topMaterial =
        new THREE.MeshLambertMaterial({
            map: topTexture
        });


    /*
       Slightly darker bottom.
    */

    const bottomMaterial =
        new THREE.MeshLambertMaterial({
            color: 0x4b2d18
        });


    materials.push(
        sideMaterial
    );

    materials.push(
        sideMaterial.clone()
    );

    materials.push(
        topMaterial
    );

    materials.push(
        bottomMaterial
    );

    materials.push(
        sideMaterial.clone()
    );

    materials.push(
        sideMaterial.clone()
    );


    return materials;

}


/* ======================================================
   ADD BLOCK
====================================================== */

function addBlock(
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
        world.has(key)
    ) {

        return;

    }


    const geometry =
        new THREE.BoxGeometry(
            1,
            1,
            1
        );


    let material;


    /*
       Crafting table gets
       its special appearance.
    */

    if (
        type === BLOCKS.crafting_table
    ) {

        material =
            createCraftingTableMaterials();

    }

    else {

        material =
            new THREE.MeshLambertMaterial({
                color: type.color
            });

    }


    const cube =
        new THREE.Mesh(
            geometry,
            material
        );


    cube.position.set(
        x + 0.5,
        y + 0.5,
        z + 0.5
    );


    /*
       Store important information
       on the mesh.
    */

    cube.userData.key =
        key;


    cube.userData.type =
        type;


    scene.add(cube);


    world.set(
        key,
        type
    );


    meshes.set(
        key,
        cube
    );

}


/* ======================================================
   GENERATE WORLD
====================================================== */

function generateWorld() {

    /*
       Remove old blocks.
    */

    meshes.forEach(
        cube => {

            scene.remove(cube);

            cube.geometry.dispose();


            /*
               Dispose materials.
            */

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
                    cube.material.map
                ) {

                    cube.material.map.dispose();

                }

                cube.material.dispose();

            }

        }
    );


    world.clear();

    meshes.clear();


    /* ==================================================
       TERRAIN
    ================================================== */

    for (
        let x = 0;
        x < WORLD_SIZE;
        x++
    ) {

        for (
            let z = 0;
            z < WORLD_SIZE;
            z++
        ) {

            const height =
                terrainHeight(
                    x,
                    z
                );


            /*
               Generate the underground.

               The surface stays the same,
               but the world now goes 32 blocks down.
            */

            for (
                let y = -WORLD_DEPTH;
                y <= height;
                y++
            ) {

                let type;


                /*
                   Grass on the surface.
                */

                if (
                    y === height
                ) {

                    type =
                        BLOCKS.grass;

                }


                /*
                   Two layers of dirt.
                */

                else if (
                    y >= height - 2
                ) {

                    type =
                        BLOCKS.dirt;

                }


                /*
                   Everything deeper is stone.
                */

                else {

                    type =
                        BLOCKS.stone;

                }


                addBlock(
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

    const trees = [

        [4, 5],

        [10, 8],

        [17, 5],

        [18, 15],

        [7, 18]

    ];


    trees.forEach(
        ([x, z]) => {

            const ground =
                terrainHeight(
                    x,
                    z
                );


            /*
               Tree trunk.
            */

            for (
                let y = ground + 1;
                y <= ground + 4;
                y++
            ) {

                addBlock(
                    x,
                    y,
                    z,
                    BLOCKS.wood
                );

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
                        Math.abs(dz) <= 3
                    ) {

                        addBlock(
                            x + dx,
                            ground + 3,
                            z + dz,
                            BLOCKS.leaves
                        );

                    }

                }

            }

        }
    );

}