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
        "rgba(10,10,10,0.95)";

    ctx.lineWidth = 5;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";


    /*
       THE EXACT CENTER OF THE BLOCK
    */

    const cx = 64;
    const cy = 64;


    /*
       Every crack starts from the exact
       center of the texture.

       This keeps the visual center
       locked to the center of the block.
    */

    const cracks = [

        /* ==================================================
           STAGE 0
        ================================================== */

        [],


        /* ==================================================
           STAGE 1
        ================================================== */

        [
            [
                [cx, cy],
                [45, 43],
                [35, 25]
            ],

            [
                [cx, cy],
                [80, 45],
                [94, 28]
            ]
        ],


        /* ==================================================
           STAGE 2
        ================================================== */

        [
            [
                [cx, cy],
                [45, 43],
                [35, 25]
            ],

            [
                [cx, cy],
                [80, 45],
                [94, 28]
            ],

            [
                [cx, cy],
                [47, 73],
                [29, 91]
            ],

            [
                [cx, cy],
                [80, 75],
                [98, 94]
            ]
        ],


        /* ==================================================
           STAGE 3
        ================================================== */

        [
            [
                [cx, cy],
                [45, 43],
                [35, 25]
            ],

            [
                [cx, cy],
                [80, 45],
                [94, 28]
            ],

            [
                [cx, cy],
                [47, 73],
                [29, 91]
            ],

            [
                [cx, cy],
                [80, 75],
                [98, 94]
            ],

            [
                [45, 43],
                [24, 52],
                [14, 38]
            ],

            [
                [80, 45],
                [104, 55],
                [114, 41]
            ],

            [
                [47, 73],
                [42, 102],
                [28, 113]
            ],

            [
                [80, 75],
                [86, 102],
                [100, 114]
            ]
        ],


        /* ==================================================
           STAGE 4
        ================================================== */

        [
            [
                [cx, cy],
                [45, 43],
                [35, 25]
            ],

            [
                [cx, cy],
                [80, 45],
                [94, 28]
            ],

            [
                [cx, cy],
                [47, 73],
                [29, 91]
            ],

            [
                [cx, cy],
                [80, 75],
                [98, 94]
            ],

            [
                [45, 43],
                [24, 52],
                [14, 38]
            ],

            [
                [80, 45],
                [104, 55],
                [114, 41]
            ],

            [
                [47, 73],
                [42, 102],
                [28, 113]
            ],

            [
                [80, 75],
                [86, 102],
                [100, 114]
            ],

            [
                [cx, cy],
                [64, 36],
                [53, 18]
            ],

            [
                [cx, cy],
                [64, 91],
                [76, 110]
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
                1.001,
                1.001
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
       The target proxy is positioned at the
       exact CENTER of the block.
    */

    crackOverlay.position.copy(
        block.position
    );


    /*
       Move directly toward the selected face.
    */

    const normal =
        faceNormal
            .clone()
            .normalize();


    crackOverlay.position.add(
        normal.multiplyScalar(
            0.501
        )
    );


    /*
       PlaneGeometry faces +Z by default.

       Rotate +Z directly into the face normal.
    */

    crackOverlay.quaternion.setFromUnitVectors(
        new THREE.Vector3(
            0,
            0,
            1
        ),
        faceNormal
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
