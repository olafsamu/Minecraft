/*
=========================================================
BLOCKWORLD
Crafting System
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

        if (
            document.pointerLockElement
        ) {

            document.exitPointerLock();

        }

        menu.style.display = "flex";

    }

    else {

        menu.style.display = "none";


        setTimeout(() => {

            const game =
                document.getElementById("game");

            if (
                game &&
                !craftingOpen
            ) {

                game.requestPointerLock();

            }

        }, 100);

    }


    updateCraftingUI();

}


/* ======================================================
   COUNT ITEMS
====================================================== */

function countCraftingItem(type) {

    let count = 0;


    for (let i = 0; i < 4; i++) {

        if (
            craftingGrid[i] === type
        ) {

            count++;

        }

    }


    return count;

}


/* ======================================================
   CHECK CRAFTING RECIPE
====================================================== */

function getCraftingResult() {

    const wood =
        countCraftingItem("wood");

    const planks =
        countCraftingItem("planks");


    /*
       1 WOOD
       =
       4 PLANKS
    */

    if (
        wood === 1 &&
        planks === 0
    ) {

        return {
            type: "planks",
            amount: 4
        };

    }


    /*
       4 PLANKS
       =
       1 CRAFTING TABLE
    */

    if (
        planks === 4 &&
        wood === 0
    ) {

        return {
            type: "crafting_table",
            amount: 1
        };

    }


    return null;

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


    /*
       Don't put anything into an
       already occupied slot.
    */

    if (
        craftingGrid[slot] !== null
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
       Only wood and planks can
       currently be crafted.
    */

    if (
        selected.type !== "wood" &&
        selected.type !== "planks"
    ) {

        return;

    }


    craftingGrid[slot] =
        selected.type;


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
   TAKE ITEM OUT OF CRAFTING SLOT
====================================================== */

function removeCraftingItem(slot) {

    if (
        slot < 0 ||
        slot >= 4
    ) {

        return;

    }


    const item =
        craftingGrid[slot];


    /*
       Nothing in this slot.
    */

    if (!item) {
        return;
    }


    /*
       Return the item to the hotbar.
    */

    const added =
        addItem(
            item,
            1
        );


    /*
       Only remove it from the
       crafting grid if the inventory
       actually accepted it.
    */

    if (!added) {

        return;

    }


    craftingGrid[slot] = null;


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
       Make sure the result can
       actually fit in the inventory.
    */

    const added =
        addItem(
            result.type,
            result.amount
        );


    if (!added) {

        return;

    }


    /*
       Clear the ingredients.
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

        else if (
            craftingGrid[i] === "planks"
        ) {

            slot.textContent = "🟫";

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

        if (
            result.type === "planks"
        ) {

            resultSlot.textContent =
                "🟫 × 4";

        }

        else if (
            result.type === "crafting_table"
        ) {

            resultSlot.textContent =
                "🧱 × 1";

        }


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
   CRAFTING CLICK EVENTS
====================================================== */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        /*
           Clicking an occupied crafting
           slot takes the item back.
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


            if (
                craftingGrid[slot] !== null
            ) {

                removeCraftingItem(slot);

            }

            else {

                putCraftingItem(slot);

            }


            return;

        }


        /*
           Click crafting result.
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