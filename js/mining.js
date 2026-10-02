/*
=========================================================
BLOCKWORLD
Mining System

Left click = break block
=========================================================
*/


const REACH_DISTANCE = 6;

let targetedBlock = null;


/* ======================================================
   FIND BLOCK THE PLAYER IS LOOKING AT
====================================================== */

function getTargetBlock() {

    const raycaster =
        new THREE.Raycaster();

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        camera
    );

    const blockMeshes = [];

    meshes.forEach(mesh => {
        blockMeshes.push(mesh);
    });

    const hits =
        raycaster.intersectObjects(
            blockMeshes
        );

    if (hits.length === 0) {

        targetedBlock = null;

        return null;
    }


    const hit = hits[0];


    if (
        hit.distance >
        REACH_DISTANCE
    ) {

        targetedBlock = null;

        return null;
    }


    targetedBlock =
        hit.object;

    return hit.object;
}


/* ======================================================
   BREAK BLOCK
====================================================== */

function breakBlock() {

    const block =
        getTargetBlock();


    if (!block) {
        return;
    }


    const key =
        block.userData.key;


    if (!key) {
        return;
    }


    /*
       Remove the block from
       the world data.
    */

    world.delete(key);


    /*
       Remove the block visually.
    */

    scene.remove(block);


    /*
       Remove the mesh from
       the mesh collection.
    */

    meshes.delete(key);


    /*
       Free Three.js memory.
    */

    block.geometry.dispose();

    block.material.dispose();


    targetedBlock = null;

}


/* ======================================================
   LEFT CLICK
====================================================== */

document.addEventListener(
    "mousedown",
    event => {

        if (
            event.button !== 0
        ) {
            return;
        }


        if (!mouseLocked) {
            return;
        }


        breakBlock();

    }
);