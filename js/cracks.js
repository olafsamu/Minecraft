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


    /*
       All crack patterns are deliberately
       centered around approximately 64,64.

       This prevents the cracks from looking
       shifted toward one corner of the block.
    */

    const cracks = [

        /*
        Stage 0
        No cracks yet.
        */
        [],


        /*
        Stage 1
        Small central crack.
        */
        [
            [
                [42,32],
                [64,64],
                [56,92]
            ]
        ],


        /*
        Stage 2
        Central crack + upper-right branch.
        */
        [
            [
                [42,32],
                [64,64],
                [56,92]
            ],

            [
                [64,64],
                [88,48],
                [106,58]
            ]
        ],


        /*
        Stage 3
        More branches spreading from the center.
        */
        [
            [
                [42,32],
                [64,64],
                [56,92]
            ],

            [
                [64,64],
                [88,48],
                [106,58]
            ],

            [
                [64,64],
                [74,82],
                [92,106]
            ],

            [
                [56,92],
                [34,108]
            ]
        ],


        /*
        Stage 4
        Full crack pattern.
        */
        [
            [
                [42,32],
                [64,64],
                [56,92]
            ],

            [
                [64,64],
                [88,48],
                [106,58]
            ],

            [
                [64,64],
                [74,82],
                [92,106]
            ],

            [
                [56,92],
                [34,108]
            ],

            [
                [88,48],
                [82,22]
            ],

            [
                [74,82],
                [108,82]
            ],

            [
                [88,48],
                [104,28]
            ],

            [
                [64,64],
                [36,52],
                [20,68]
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
       Start exactly at the center
       of the selected block.
    */

    crackOverlay.position.copy(
        block.position
    );


    const normal =
        faceNormal
            .clone()
            .normalize();


    /*
       Move a tiny amount toward the
       block face so the crack is visible
       without floating noticeably.
    */

    crackOverlay.position.add(
        normal.clone()
            .multiplyScalar(
                0.503
            )
    );


    /*
       PlaneGeometry normally faces +Z.

       Rotate it so +Z points exactly
       along the selected face normal.
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
