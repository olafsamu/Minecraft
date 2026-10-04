```js
/*
=========================================================
BLOCKWORLD
Inventory + Hotbar
=========================================================
*/

const HOTBAR_SIZE = 9;

const hotbar = [

    {
        type: "grass",
        amount: 0
    },

    {
        type: "dirt",
        amount: 10
    },

    {
        type: "stone",
        amount: 0
    },

    {
        type: "wood",
        amount: 0
    },

    {
        type: "leaves",
        amount: 0
    },

    {
        type: "planks",
        amount: 0
    },

    {
        type: "crafting_table",
        amount: 0
    },

    null,

    null

];


let selectedHotbarSlot = 0;


/* ======================================================
   NORMALIZE ITEM NAME
====================================================== */

function normalizeItemName(type) {

    if (!type) {
        return "";
    }

    return String(type)
        .toLowerCase()
        .replaceAll(" ", "_")
        .replaceAll("-", "_");

}


/* ======================================================
   SELECT HOTBAR SLOT
====================================================== */

function selectHotbarSlot(slot) {

    if (
        slot < 0 ||
        slot >= HOTBAR_SIZE
    ) {
        return;
    }

    selectedHotbarSlot = slot;

    updateHotbarUI();

}


/* ======================================================
   GET SELECTED ITEM
====================================================== */

function getSelectedItem() {

    return hotbar[
        selectedHotbarSlot
    ];

}


/* ======================================================
   ADD ITEM
====================================================== */

function addItem(
    type,
    amount = 1
) {

    const normalizedType =
        normalizeItemName(type);


    /*
       First try to add to an
       existing stack.
    */

    for (
        let i = 0;
        i < HOTBAR_SIZE;
        i++
    ) {

        const slot =
            hotbar[i];


        if (
            slot &&
            normalizeItemName(
                slot.type
            ) === normalizedType
        ) {

            slot.amount += amount;

            updateHotbarUI();

            return true;

        }

    }


    /*
       Otherwise find an empty slot.
    */

    for (
        let i = 0;
        i < HOTBAR_SIZE;
        i++
    ) {

        if (
            hotbar[i] === null
        ) {

            hotbar[i] = {

                type: normalizedType,

                amount: amount

            };

            updateHotbarUI();

            return true;

        }

    }


    return false;

}


/* ======================================================
   REMOVE ITEM
====================================================== */

function removeItem(
    type,
    amount = 1
) {

    const normalizedType =
        normalizeItemName(type);


    const item =
        hotbar.find(
            slot =>
                slot &&
                normalizeItemName(
                    slot.type
                ) === normalizedType
        );


    if (!item) {
        return false;
    }


    if (
        item.amount < amount
    ) {
        return false;
    }


    item.amount -= amount;


    if (
        item.amount <= 0
    ) {

        const index =
            hotbar.indexOf(item);

        hotbar[index] = null;

    }


    updateHotbarUI();

    return true;

}


/* ======================================================
   GET ICON CLASS
====================================================== */

function getItemIconClass(type) {

    switch (
        normalizeItemName(type)
    ) {

        case "grass":
            return "grass-icon";

        case "dirt":
            return "dirt-icon";

        case "stone":
            return "stone-icon";

        case "wood":
            return "wood-icon";

        case "leaves":
            return "leaves-icon";

        case "planks":
            return "planks-icon";

        case "crafting_table":
            return "crafting-table-icon";

        default:
            return "";

    }

}


/* ======================================================
   HOTBAR UI
====================================================== */

function updateHotbarUI() {

    const slots =
        document.querySelectorAll(
            ".hotbar-slot"
        );


    slots.forEach(
        (
            slot,
            index
        ) => {

            /*
               Selected slot.
            */

            slot.classList.toggle(
                "selected",
                index === selectedHotbarSlot
            );


            const item =
                hotbar[index];


            const icon =
                slot.querySelector(
                    ".item-icon"
                );


            const amount =
                slot.querySelector(
                    ".item-amount"
                );


            /*
               Empty slot.
            */

            if (!item) {

                if (icon) {

                    icon.className =
                        "item-icon";

                }

                if (amount) {

                    amount.textContent =
                        "";

                }

                return;

            }


            /*
               Set the correct icon.
            */

            if (icon) {

                icon.className =
                    "item-icon " +
                    getItemIconClass(
                        item.type
                    );

            }


            /*
               Set amount.
            */

            if (amount) {

                if (
                    item.amount > 0
                ) {

                    amount.textContent =
                        item.amount;

                }

                else {

                    amount.textContent =
                        "";

                }

            }

        }
    );

}


/* ======================================================
   NUMBER KEYS
====================================================== */

document.addEventListener(
    "keydown",
    event => {

        const number =
            parseInt(
                event.key
            );


        if (
            number >= 1 &&
            number <= 9
        ) {

            selectHotbarSlot(
                number - 1
            );

        }

    }
);


/* ======================================================
   INITIAL UI UPDATE
====================================================== */

updateHotbarUI();
```
