/*
=========================================================
BLOCKWORLD
Mining Crack Visuals
=========================================================

Creates a Minecraft-style crack overlay on the
EXACT FACE of the block being mined.

Only one face is drawn at a time.
=========================================================
*/


/* ======================================================
   STATE
====================================================== */

let crackOverlay = null;


/* ======================================================
   CRACK TEXTURES
====================================================== */

const crackTextures = [];


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


    const selectedCracks =
        cracks[
            Math.min(
                stage,
                cracks.length - 1
            )
        ];


    selectedCracks.forEach(
        crack => {

            ctx.beginPath();


            crack.forEach(
                (point,index) => {

                    if (
                        index === 0
                    ) {

                        ctx.moveTo(
                            point[0],
                            point[1]
                        );

                    }

                    else {

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
   BUILD TEXTURE CACHE
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
        !block
    ) {

        return;

    }


    if (
        !faceNormal
    ) {

        return;

    }


    crackOverlay =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                1.006,
                1.006
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
                    THREE.FrontSide,

                polygonOffset:
                    true,

                polygonOffsetFactor:
                    -1,

                polygonOffsetUnits:
                    -1

            })
        );


    /*
       Put crack plane directly on the
       selected face.
    */

    crackOverlay.position.copy(
        block.position
    );


    const normal =
        faceNormal.clone().normalize();


    const offset =
        0.504;


    crackOverlay.position.add(
        normal.clone().multiplyScalar(
            offset
        )
    );


    /*
       Rotate the plane to the correct face.
    */

    if (
        Math.abs(normal.x) > 0.5
    ) {

        crackOverlay.rotation.y =
            normal.x > 0
                ? Math.PI / 2
                : -Math.PI / 2;

    }

    else if (
        Math.abs(normal.y) > 0.5
    ) {

        crackOverlay.rotation.x =
            normal.y > 0
                ? -Math.PI / 2
                : Math.PI / 2;

    }

    else {

        crackOverlay.rotation.y =
            normal.z > 0
                ? 0
                : Math.PI;

    }


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
                stage,
                4
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
