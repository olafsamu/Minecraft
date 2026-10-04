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
        "rgba(20, 20, 20, 0.9)";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";


    /*
       Crack patterns
    */

    const cracks = [

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ]
        ],

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [75, 30],
                [105, 45]
            ]
        ],

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [75, 30],
                [105, 45]
            ],

            [
                [48, 48],
                [62, 75],
                [90, 105]
            ],

            [
                [35, 75],
                [18, 105]
            ]
        ],

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [75, 30],
                [105, 45]
            ],

            [
                [48, 48],
                [62, 75],
                [90, 105]
            ],

            [
                [35, 75],
                [18, 105]
            ],

            [
                [75, 30],
                [68, 10]
            ],

            [
                [62, 75],
                [110, 75]
            ]
        ],

        [
            [
                [20, 15],
                [48, 48],
                [35, 75]
            ],

            [
                [48, 48],
                [75, 30],
                [105, 45]
            ],

            [
                [48, 48],
                [62, 75],
                [90, 105]
            ],

            [
                [35, 75],
                [18, 105]
            ],

            [
                [75, 30],
                [68, 10]
            ],

            [
                [62, 75],
                [110, 75]
            ],

            [
                [75, 30],
                [95, 8]
            ],

            [
                [90, 105],
                [112, 118]
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
       Draw each crack
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


    const geometry =
        new THREE.PlaneGeometry(
            1.01,
            1.01
        );


    const material =
        new THREE.MeshBasicMaterial({
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide
        });


    crackOverlay =
        new THREE.Mesh(
            geometry,
            material
        );


    crackOverlay.position.copy(
        block.position
    );


    crackOverlay.material.map =
        createCrackTexture(0);


    crackOverlay.material.needsUpdate =
        true;


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


    if (
        crackOverlay.material.map
    ) {

        crackOverlay.material.map.dispose();

    }


    crackOverlay.material.map =
        createCrackTexture(
            stage
        );


    crackOverlay.material.needsUpdate =
        true;

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


    if (
        crackOverlay.material.map
    ) {

        crackOverlay.material.map.dispose();

    }


    crackOverlay.geometry.dispose();

    crackOverlay.material.dispose();


    crackOverlay = null;

}