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
   REPLACE STONE WITH ORES
====================================================== */

function generateOres() {

    const blocksToReplace = [];


    /*
       Look through every block in the world.
    */

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
               Read the coordinates from the key.

               This works with common separators such as
               commas, spaces, or pipes.
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


            /*
               Only generate ores underground.
            */

            if (
                y < 1
            ) {

                return;

            }


            let ore = null;


            /* =========================================
               DIAMOND
               Very rare and mostly deep underground.
               ========================================= */

            if (
                y <= 3 &&
                Math.random() < 0.035
            ) {

                ore =
                    BLOCKS.diamond_ore;

            }


            /* =========================================
               IRON
               ========================================= */

            else if (
                y <= 5 &&
                Math.random() < 0.055
            ) {

                ore =
                    BLOCKS.iron_ore;

            }


            /* =========================================
               COAL
               Most common ore.
               ========================================= */

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


    /*
       Replace the selected stone blocks.
    */

    blocksToReplace.forEach(
        block => {

            const oldMesh =
                meshes.get(
                    block.key
                );


            /*
               Remove the old stone visually.
            */

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


            /*
               Add the ore block.
            */

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