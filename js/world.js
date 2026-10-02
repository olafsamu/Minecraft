const world = new Map();
const meshes = new Map();

const WORLD_SIZE = 24;

function blockKey(x, y, z) {
    return x + "," + y + "," + z;
}

function terrainHeight(x, z) {
    return Math.max(
        1,
        Math.min(
            6,
            Math.floor(
                3 +
                Math.sin(x * 0.4) +
                Math.cos(z * 0.35) +
                Math.sin((x + z) * 0.2)
            )
        )
    );
}

function addBlock(x, y, z, type) {
    const key = blockKey(x, y, z);

    if (world.has(key)) {
        return;
    }

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    const material = new THREE.MeshLambertMaterial({
        color: type.color
    });

    const cube = new THREE.Mesh(
        geometry,
        material
    );

    cube.position.set(
        x + 0.5,
        y + 0.5,
        z + 0.5
    );

    cube.userData.key = key;
    cube.userData.type = type;

    scene.add(cube);

    world.set(key, type);
    meshes.set(key, cube);
}

function generateWorld() {

    meshes.forEach(cube => {
        scene.remove(cube);

        cube.geometry.dispose();
        cube.material.dispose();
    });

    world.clear();
    meshes.clear();

    for (let x = 0; x < WORLD_SIZE; x++) {

        for (let z = 0; z < WORLD_SIZE; z++) {

            const height = terrainHeight(x, z);

            for (let y = 0; y <= height; y++) {

                let type;

                if (y === height) {
                    type = BLOCKS.grass;
                } else if (y >= height - 2) {
                    type = BLOCKS.dirt;
                } else {
                    type = BLOCKS.stone;
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

    const trees = [
        [4, 5],
        [10, 8],
        [17, 5],
        [18, 15],
        [7, 18]
    ];

    trees.forEach(([x, z]) => {

        const ground =
            terrainHeight(x, z);

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
    });
}