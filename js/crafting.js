/*
=========================================================
BLOCKWORLD
Crafting System
=========================================================
*/


/* ======================================================
   2x2 PLAYER CRAFTING
====================================================== */

const craftingGrid = [
    null,
    null,
    null,
    null
];

let craftingOpen = false;


/* ======================================================
   3x3 CRAFTING TABLE
====================================================== */

const tableCraftingGrid = [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null
];

let tableCraftingOpen = false;


/* ======================================================
   OPEN 2x2 CRAFTING
====================================================== */

function toggleCrafting() {

    if (tableCraftingOpen) {
        return;
    }


    craftingOpen =
        !craftingOpen;


    const menu =
        document.getElementById(
            "craftingMenu"
        );


    if (!menu) {
        return;
    }


    if (craftingOpen) {

        /*
           Release mouse.
        */

        if (
            document.pointerLockElement
        ) {

            document.exitPointerLock();

        }


        menu.style.display =
            "flex";

    }

    else {

        menu.style.display =
            "none";


        setTimeout(() => {

            const game =
                document.getElementById(
                    "game"
                );


            if (
                game &&
                !craftingOpen &&
                !tableCraftingOpen
            ) {

                game.requestPointerLock();

            }

        }, 100);

    }


    updateCraftingUI();

}


/* ======================================================
   OPEN 3x3 CRAFTING TABLE
====================================================== */

function openCraftingTable() {

    if (tableCraftingOpen) {
        return;
    }


    /*
       Close normal crafting if necessary.
    */

    craftingOpen = false;


    const normalMenu =
        document.getElementById(
            "craftingMenu"
        );


    if (normalMenu) {

        normalMenu.style.display =
            "none";

    }


    tableCraftingOpen =
        true;


    /*
       Release mouse.
    */

    if (
        document.pointerLockElement
    ) {

        document.exitPointerLock();

    }


    const menu =
        document.getElementById(
            "tableCraftingMenu"
        );


    if (!menu) {
        return;
    }


    menu.style.display =
        "flex";


    updateTableCraftingUI();

}


/* ======================================================
   CLOSE 3x3 CRAFTING TABLE
====================================================== */

function closeCraftingTable() {

    tableCraftingOpen =
        false;


    const menu =
        document.getElementById(
            "tableCraftingMenu"
        );


    if (menu) {

        menu.style.display =
            "none";

    }


    /*
       Return mouse to game.
    */

    setTimeout(() => {

        const game =
            document.getElementById(
                "game"
            );


        if (
            game &&
            !tableCraftingOpen &&
            !craftingOpen
        ) {

            game.requestPointerLock();

        }

    }, 100);

}


/* ======================================================
   COUNT 2x2 ITEMS
====================================================== */

function countCraftingItem(type) {

    let count = 0;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        if (
            craftingGrid[i] === type
        ) {

            count++;

        }

    }


    return count;

}


/* ======================================================
   2x2 CRAFTING RECIPE
====================================================== */

function getCraftingResult() {

    const wood =
        countCraftingItem(
            "wood"
        );


    const planks =
        countCraftingItem(
            "planks"
        );


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
       2 PLANKS
       =
       4 STICKS
    */


    if (
        planks === 2 &&
        wood === 0
    ) {


        /*
           Horizontal:

           P P
           _ _

           OR

           _ _
           P P
        */

        if (
            (
                craftingGrid[0] === "planks" &&
                craftingGrid[1] === "planks"
            )
            ||
            (
                craftingGrid[2] === "planks" &&
                craftingGrid[3] === "planks"
            )
        ) {

            return {
                type: "sticks",
                amount: 4
            };

        }


        /*
           Vertical:

           P _
           P _

           OR

           _ P
           _ P
        */

        if (
            (
                craftingGrid[0] === "planks" &&
                craftingGrid[2] === "planks"
            )
            ||
            (
                craftingGrid[1] === "planks" &&
                craftingGrid[3] === "planks"
            )
        ) {

            return {
                type: "sticks",
                amount: 4
            };

        }

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
   PUT ITEM INTO 2x2
====================================================== */

function putCraftingItem(slot) {

    if (
        slot < 0 ||
        slot >= 4
    ) {

        return;

    }


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
       Only these items can currently
       go into the 2x2 crafting grid.
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
   REMOVE ITEM FROM 2x2
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


    if (!item) {
        return;
    }


    const added =
        addItem(
            item,
            1
        );


    if (!added) {
        return;
    }


    craftingGrid[slot] =
        null;


    updateCraftingUI();

}


/* ======================================================
   TAKE 2x2 RESULT
====================================================== */

function takeCraftingResult() {

    const result =
        getCraftingResult();


    if (!result) {
        return;
    }


    const added =
        addItem(
            result.type,
            result.amount
        );


    if (!added) {
        return;
    }


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        craftingGrid[i] =
            null;

    }


    updateCraftingUI();

}


/* ======================================================
   UPDATE 2x2 UI
====================================================== */

function updateCraftingUI() {

    for (
        let i = 0;
        i < 4;
        i++
    ) {

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

            slot.textContent =
                "🪵";

        }

        else if (
            craftingGrid[i] === "planks"
        ) {

            slot.textContent =
                "🟫";

        }

        else {

            slot.textContent =
                "";

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
            result.type === "sticks"
        ) {

            resultSlot.textContent =
                "🪵 × 4";

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

        resultSlot.textContent =
            "";

        resultSlot.classList.remove(
            "crafting-result-ready"
        );

    }

}


/* ======================================================
   GET 3x3 CRAFTING TABLE RESULT
====================================================== */

function getTableCraftingResult() {

    /*
       Wooden pickaxe recipe:

       P P P
       _ S _
       _ S _

       P = planks
       S = sticks

       Result = 1 wooden pickaxe
    */


    if (
        tableCraftingGrid[0] === "planks" &&
        tableCraftingGrid[1] === "planks" &&
        tableCraftingGrid[2] === "planks" &&

        tableCraftingGrid[3] === null &&
        tableCraftingGrid[4] === "sticks" &&
        tableCraftingGrid[5] === null &&

        tableCraftingGrid[6] === null &&
        tableCraftingGrid[7] === "sticks" &&
        tableCraftingGrid[8] === null
    ) {

        return {
            type: "pickaxe",
            amount: 1
        };

    }


    return null;

}


/* ======================================================
   PUT ITEM INTO 3x3
====================================================== */

function putTableCraftingItem(slot) {

    if (
        slot < 0 ||
        slot >= 9
    ) {

        return;

    }


    /*
       Don't overwrite an occupied slot.
    */

    if (
        tableCraftingGrid[slot] !== null
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
       The pickaxe recipe uses
       planks and sticks.
    */

    if (
        selected.type !== "planks" &&
        selected.type !== "sticks"
    ) {

        return;

    }


    tableCraftingGrid[slot] =
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

    updateTableCraftingUI();

}


/* ======================================================
   REMOVE ITEM FROM 3x3
====================================================== */

function removeTableCraftingItem(slot) {

    if (
        slot < 0 ||
        slot >= 9
    ) {

        return;

    }


    const item =
        tableCraftingGrid[slot];


    if (!item) {
        return;
    }


    /*
       Return item to hotbar.
    */

    const added =
        addItem(
            item,
            1
        );


    if (!added) {

        return;

    }


    tableCraftingGrid[slot] =
        null;


    updateTableCraftingUI();

}


/* ======================================================
   TAKE 3x3 RESULT
====================================================== */

function takeTableCraftingResult() {

    const result =
        getTableCraftingResult();


    if (!result) {
        return;
    }


    /*
       Add the pickaxe to inventory.
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
       Consume recipe ingredients.
    */

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        tableCraftingGrid[i] =
            null;

    }


    updateTableCraftingUI();

}


/* ======================================================
   UPDATE 3x3 UI
====================================================== */

function updateTableCraftingUI() {

    for (
        let i = 0;
        i < 9;
        i++
    ) {

        const slot =
            document.getElementById(
                "table-crafting-slot-" + i
            );


        if (!slot) {
            continue;
        }


        if (
            tableCraftingGrid[i] === "wood"
        ) {

            slot.textContent =
                "🪵";

        }

        else if (
            tableCraftingGrid[i] === "planks"
        ) {

            slot.textContent =
                "🟫";

        }

        else if (
            tableCraftingGrid[i] === "sticks"
        ) {

            slot.textContent =
                "🪵";

        }

        else {

            slot.textContent =
                "";

        }

    }


    /*
       Update result.
    */

    const resultSlot =
        document.getElementById(
            "table-crafting-result"
        );


    if (!resultSlot) {
        return;
    }


    const result =
        getTableCraftingResult();


    if (result) {

        resultSlot.textContent =
            "⛏️ × 1";

        resultSlot.classList.add(
            "crafting-result-ready"
        );

    }

    else {

        resultSlot.textContent =
            "";

        resultSlot.classList.remove(
            "crafting-result-ready"
        );

    }

}


/* ======================================================
   CLICK EVENTS
====================================================== */

document.addEventListener(
    "click",
    event => {

        const target =
            event.target;


        /* ==============================================
           2x2 CRAFTING
        ============================================== */

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

                removeCraftingItem(
                    slot
                );

            }

            else {

                putCraftingItem(
                    slot
                );

            }


            return;

        }


        if (
            target.id ===
            "crafting-result"
        ) {

            takeCraftingResult();

            return;

        }


        /* ==============================================
           3x3 CRAFTING TABLE
        ============================================== */

        if (
            target.classList.contains(
                "table-crafting-slot"
            )
        ) {

            const slot =
                parseInt(
                    target.dataset.slot
                );


            if (
                tableCraftingGrid[slot] !== null
            ) {

                removeTableCraftingItem(
                    slot
                );

            }

            else {

                putTableCraftingItem(
                    slot
                );

            }


            return;

        }


        if (
            target.id ===
            "table-crafting-result"
        ) {

            takeTableCraftingResult();

            return;

        }

    }
);


/* ======================================================
   KEYBOARD
====================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.repeat
        ) {

            return;

        }


        /*
           C opens/closes normal crafting
           and closes the crafting table.
        */

        if (
            event.key.toLowerCase() === "c"
        ) {

            if (
                tableCraftingOpen
            ) {

                closeCraftingTable();

                return;

            }


            toggleCrafting();

        }

    }
);