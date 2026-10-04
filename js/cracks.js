/*
=========================================================
BLOCKWORLD
Mining Crack Visuals
=========================================================
*/

let crackOverlay = null;


/* ======================================================
   CREATE CRACK TEXTURE
====================================================== */

function createCrackTexture(stage) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 128;

    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        128,
        128
    );


    /*
       Crack appearance
    */

    ctx.strokeStyle =
        "rgba(15, 15, 15, 0.95)";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";


    /*
       Crack stages
    */

    const cracks = [

        /* Stage 0 */

        [],


        /* Stage 1 */

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ]
        ],


        /* Stage 2 */

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [78, 30],
                [108, 45]
            ]
        ],


        /* Stage 3 */

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [78, 30],
                [108, 45]
            ],

            [
                [48, 48],
                [63, 75],
                [92, 108]
            ],

            [
                [35, 75],
                [15, 108]
            ]
        ],


        /* Stage 4 */

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [78, 30],
                [108, 45]
            ],

            [
                [48, 48],
                [63, 75],
                [92, 108]
            ],

            [
                [35, 75],
                [15, 108]
            ],

            [
                [78, 30],
                [68, 8]
            ],

            [
                [63, 75],
                [112, 75]
            ],

            [
                [78, 30],
                [98, 8]
            ]
        ]

    ];


    const selectedCracks =
        cracks[
            Math.min(
                stage,
                cracks.length - 1
            )
        ];


    /*
       Draw cracks.
    */

    selectedCracks.forEach(
        crack => {

            ctx.beginPath();

            crack.forEach(
                (
                    point,
                    index
                ) => {

                    if (
                        index === 0
                    ) {

                        ctx.moveTo(
                            point[0],
                            point[1]
                        );

                    } else {

                        ctx.lineTo(
                            point[0],
                            point[1]
                        );

                    }

                }
            );

            ctx.stroke();

        }
    );


    return new THREE.CanvasTexture(
        canvas
    );

}


/* ======================================================
   CREATE CRACK OVERLAY
====================================================== */

function createCrackOverlay(block) {

    removeCrackOverlay();


    /*
       Create a group containing
       six crack planes.

       This makes cracks visible
       from every side of the block.
    */

    crackOverlay =
        new THREE.Group();


    const texture =
        createCrackTexture(0);


    /*
       Front / Back
    */

    const front =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    front.position.z =
        0.506;


    crackOverlay.add(front);


    const back =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    back.position.z =
        -0.506;


    back.rotation.y =
        Math.PI;


    crackOverlay.add(back);


    /*
       Left / Right
    */

    const right =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    right.position.x =
        0.506;


    right.rotation.y =
        Math.PI / 2;


    crackOverlay.add(right);


    const left =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    left.position.x =
        -0.506;


    left.rotation.y =
        -Math.PI / 2;


    crackOverlay.add(left);


    /*
       Top / Bottom
    */

    const top =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    top.position.y =
        0.506;


    top.rotation.x =
        -Math.PI / 2;


    crackOverlay.add(top);


    const bottom =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.01,
                1.01
            ),
            new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );


    bottom.position.y =
        -0.506;


    bottom.rotation.x =
        Math.PI / 2;


    crackOverlay.add(bottom);


    /*
       Put the entire crack system
       on the block.
    */

    crackOverlay.position.copy(
        block.position
    );


    scene.add(
        crackOverlay
    );

}


/* ======================================================
   UPDATE CRACKS
====================================================== */

function updateCrackOverlay(progress) {

    if (!crackOverlay) {
        return;
    }


    let stage =
        Math.floor(
            progress * 5
        );


    stage =
        Math.min(
            stage,
            4
        );


    const texture =
        createCrackTexture(stage);


    /*
       Give every face the new texture.
    */

    crackOverlay.children.forEach(
        face => {

            if (
                face.material.map
            ) {

                face.material.map.dispose();

            }


            face.material.map =
                texture;

            face.material.needsUpdate =
                true;

        }
    );

}


/* ======================================================
   REMOVE CRACKS
====================================================== */

function removeCrackOverlay() {

    if (!crackOverlay) {
        return;
    }


    scene.remove(
        crackOverlay
    );


    crackOverlay.children.forEach(
        face => {

            if (
                face.material.map
            ) {

                face.material.map.dispose();

            }


            face.geometry.dispose();

            face.material.dispose();

        }
    );


    crackOverlay = null;

}