/*
=========================================================
BLOCKWORLD
Ore Generation
=========================================================
*/


/* ======================================================
   ORE BLOCKS
====================================================== */

BLOCKS.coal_ore = {

    name: "coal_ore",

    color: 0x303030,

    breakTime: 700,

    requiresTool: true,

    requiredTool: "pickaxe"

};


BLOCKS.iron_ore = {

    name: "iron_ore",

    color: 0xb8a99a,

    breakTime: 800,

    requiresTool: true,

    requiredTool: "pickaxe"

};


BLOCKS.diamond_ore = {

    name: "diamond_ore",

    color: 0x29d8e8,

    breakTime: 1000,

    requiresTool: true,

    requiredTool: "pickaxe"

};


/* ======================================================
   GENERATE ORES
====================================================== */

function generateOres() {

    const blocksToReplace = [];


    world.forEach(
        (blockType, key) => {

            /*
               Only replace stone.
            */

            if (
                blockType !== BLOCKS.stone &&
                blockType?.name !== BLOCKS.stone.name
            ) {

                return;

            }


            /*
               Get coordinates.
            */

            const numbers =
                String(key).match(
                    /-?\d+/g
                );


            if (
                !numbers ||
                numbers.length < 3
            ) {

                return;

            }


            const x =
                Number(numbers[0]);

            const y =
                Number(numbers[1]);

            const z =
                Number(numbers[2]);


            let ore = null;


            /* ==================================================
               DIAMOND
               Very deep and very rare.
               ================================================== */

            if (
                y <= -15 &&
                Math.random() < 0.035
            ) {

                ore =
                    BLOCKS.diamond_ore;

            }


            /* ==================================================
               IRON
               Medium/deep underground.
               ================================================== */

            else if (
                y <= -5 &&
                Math.random() < 0.055
            ) {

                ore =
                    BLOCKS.iron_ore;

            }


            /* ==================================================
               COAL
               Common throughout underground.
               ================================================== */

            else if (
                Math.random() < 0.075
            ) {

                ore =
                    BLOCKS.coal_ore;

            }


            if (ore) {

                blocksToReplace.push({

                    key: key,

                    x: x,

                    y: y,

                    z: z,

                    type: ore

                });

            }

        }
    );


    /* ======================================================
       REPLACE STONE
====================================================== */

    blocksToReplace.forEach(
        block => {

            const oldMesh =
                meshes.get(
                    block.key
                );


            if (oldMesh) {

                scene.remove(
                    oldMesh
                );

            }


            meshes.delete(
                block.key
            );


            world.delete(
                block.key
            );


            addBlock(
                block.x,
                block.y,
                block.z,
                block.type
            );

        }
    );


    console.log(
        "Generated " +
        blocksToReplace.length +
        " ore blocks!"
    );

}