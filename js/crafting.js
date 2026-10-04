/*
=========================================================
BLOCKWORLD
2x2 Crafting System
=========================================================
*/

const craftingGrid = [
    null,
    null,
    null,
    null
];

let craftingOpen = false;


/* ======================================================
   OPEN / CLOSE CRAFTING
====================================================== */

function toggleCrafting() {

    craftingOpen = !craftingOpen;

    const menu =
        document.getElementById("craftingMenu");

    if (!menu) {
        return;
    }


    if (craftingOpen) {

        /*
           Release the mouse from the game
           so we can click the crafting menu.
        */

        if (
            document.pointerLockElement
        ) {

            document.exitPointerLock();

        }


        /*
           Tell the rest of the game
           that the mouse is no longer locked.
        */

        if (
            typeof mouseLocked !== "undefined"
        ) {

            mouseLocked = false;

        }


        menu.style.display = "flex";

    }

    else {

        menu.style.display = "none";

    }


    updateCraftingUI();
}


/* ======================================================
   CHECK RECIPE
====================================================== */

function getCraftingResult() {

    /*
       Recipe:

       WOOD | WOOD
       WOOD | WOOD

       =
       4 PLANKS
    */

    for (let i = 0; i < 4; i++) {

        if (
            craftingGrid[i] !== "wood"
        ) {

            return null;

        }

    }


    return {
        type: "planks",
        amount: 4
    };

}


/* ======================================================
   PUT ITEM INTO CRAFTING SLOT
====================================================== */

function putCraftingItem(slot) {

    if (
        slot < 0 ||
        slot >= 4
    ) {
        return;
    }


    const selected =
        getSelectedItem();


    if (!selected) {
        return;
    }


    if (
        selected.amount <= 0
    ) {
        return;
    }


    /*
       Only wood is allowed for
       our first recipe.
    */

    if (
        selected.type !== "wood"
    ) {
        return;
    }


    if (
        craftingGrid[slot] !== null
    ) {
        return;
    }


    craftingGrid[slot] =
        "wood";


    selected.amount--;


    if (
        selected.amount <= 0
    ) {

        hotbar[
            selectedHotbarSlot
        ] = null;

    }


    updateHotbarUI();

    updateCraftingUI();

}


/* ======================================================
   TAKE CRAFTING RESULT
====================================================== */

function takeCraftingResult() {

    const result =
        getCraftingResult();


    if (!result) {
        return;
    }


    /*
       Add the planks to the inventory.
    */

    addItem(
        result.type,
        result.amount
    );


    /*
       Clear the crafting grid.
    */

    for (let i = 0; i < 4; i++) {

        craftingGrid[i] = null;

    }


    updateCraftingUI();

}


/* ======================================================
   UPDATE CRAFTING UI
====================================================== */

function updateCraftingUI() {

    for (let i = 0; i < 4; i++) {

        const slot =
            document.getElementById(
                "crafting-slot-" + i
            );


        if (!slot) {
            continue;
        }


        if (
            craftingGrid[i] === "wood"
        ) {

            slot.textContent = "🪵";

        }

        else {

            slot.textContent = "";

        }

    }


    const result =
        getCraftingResult();


    const resultSlot =
        document.getElementById(
            "crafting-result"
        );


    if (!resultSlot) {
        return;
    }


    if (result) {

        resultSlot.textContent =
            "🪵 × " + result.amount;

        resultSlot.classList.add(
            "crafting-result-ready"
        );

    }

    else {

        resultSlot.textContent = "";

        resultSlot.classList.remove(
            "crafting-result-ready"
        );

    }

}


/* ======================================================
   CRAFTING MENU CLICKING
====================================================== */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        /*
           Click a crafting slot.
        */

        if (
            target.classList.contains(
                "crafting-slot"
            )
        ) {

            const slot =
                parseInt(
                    target.dataset.slot
                );


            putCraftingItem(slot);

            return;

        }


        /*
           Click the result.
        */

        if (
            target.id ===
            "crafting-result"
        ) {

            takeCraftingResult();

        }

    }
);


/* ======================================================
   C KEY
====================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key.toLowerCase() !== "c"
        ) {

            return;

        }


        if (
            event.repeat
        ) {

            return;

        }


        toggleCrafting();

    }
);