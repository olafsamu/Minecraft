/*
=========================================================
BLOCKWORLD
Mining Crack Visuals
=========================================================
*/

let crackOverlay = null;

const crackTextures = [];


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

    ctx.strokeStyle =
        "rgba(15,15,15,0.95)";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";


    const cracks = [

        [],

        [
            [
                [20,15],
                [48,48],
                [35,75]
            ]
        ],

        [
            [
                [20,15],
                [48,48],
                [35,75]
            ],
            [
                [48,48],
                [78,30],
                [108,45]
            ]
        ],

        [
            [
                [20,15],
                [48,48],
                [35,75]
            ],
            [
                [48,48],
                [78,30],
                [108,45]
            ],
            [
                [48,48],
                [63,75],
                [92,108]
            ],
            [
                [35,75],
                [15,108]
            ]
        ],

        [
            [
                [20,15],
                [48,48],
                [35,75]
            ],
            [
                [48,48],
                [78,30],
                [108,45]
            ],
            [
                [48,48],
                [63,75],
                [92,108]
            ],
            [
                [35,75],
                [15,108]
            ],
            [
                [78,30],
                [68,8]
            ],
            [
                [63,75],
                [112,75]
            ],
            [
                [78,30],
                [98,8]
            ]
        ]

    ];


    const selected =
        cracks[
            Math.min(
                stage,
                cracks.length - 1
            )
        ];


    selected.forEach(
        crack => {

            ctx.beginPath();

            crack.forEach(
                (point, index) => {

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


    const texture =
        new THREE.CanvasTexture(
            canvas
        );

    texture.needsUpdate = true;

    return texture;
}


/* ======================================================
   INITIALIZE TEXTURES
====================================================== */

function initCrackTextures() {

    if (
        crackTextures.length > 0
    ) {

        return;

    }

    for (
        let i = 0;
        i < 5;
        i++
    ) {

        crackTextures.push(
            createCrackTexture(i)
        );

    }
}


/* ======================================================
   CREATE CRACK OVERLAY
====================================================== */

function createCrackOverlay(
    block,
    faceNormal
) {

    removeCrackOverlay();

    initCrackTextures();


    if (
        !block ||
        !faceNormal
    ) {

        return;

    }


    crackOverlay =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.002,
                1.002
            ),
            new THREE.MeshBasicMaterial({

                map:
                    crackTextures[0],

                transparent:
                    true,

                depthWrite:
                    false,

                depthTest:
                    true,

                side:
                    THREE.DoubleSide,

                polygonOffset:
                    true,

                polygonOffsetFactor:
                    -2,

                polygonOffsetUnits:
                    -2

            })
        );


    /*
       Put the crack exactly on the
       selected block face.
    */

    const normal =
        faceNormal
            .clone()
            .normalize();


    crackOverlay.position.copy(
        block.position
    );


    crackOverlay.position.add(
        normal.clone()
            .multiplyScalar(
                0.503
            )
    );


    /*
       PlaneGeometry faces +Z by default.

       Rotate that +Z normal so it points
       in exactly the direction of the block face.
    */

    crackOverlay.quaternion.setFromUnitVectors(
        new THREE.Vector3(
            0,
            0,
            1
        ),
        normal
    );


    scene.add(
        crackOverlay
    );

}


/* ======================================================
   UPDATE CRACK
====================================================== */

function updateCrackOverlay(
    progress
) {

    if (
        !crackOverlay
    ) {

        return;

    }


    let stage =
        Math.floor(
            progress * 5
        );


    stage =
        Math.max(
            0,
            Math.min(
                4,
                stage
            )
        );


    crackOverlay.material.map =
        crackTextures[stage];

    crackOverlay.material.needsUpdate =
        true;

}


/* ======================================================
   REMOVE CRACK
====================================================== */

function removeCrackOverlay() {

    if (
        !crackOverlay
    ) {

        return;

    }


    if (
        crackOverlay.parent
    ) {

        crackOverlay.parent.remove(
            crackOverlay
        );

    }


    if (
        crackOverlay.geometry
    ) {

        crackOverlay.geometry.dispose();

    }


    if (
        crackOverlay.material
    ) {

        crackOverlay.material.dispose();

    }


    crackOverlay =
        null;

}
