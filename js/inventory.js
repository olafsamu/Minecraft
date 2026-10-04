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

function addItem(type, amount = 1) {

    const normalizedType =
        normalizeItemName(type);


    /*
       Add to an existing stack.
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

function removeItem(type, amount = 1) {

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


            const itemIcon =
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

                if (itemIcon) {

                    itemIcon.className =
                        "item-icon";

                }


                if (amount) {

                    amount.textContent =
                        "";

                }


                return;

            }


            /*
               Keep the icon that belongs
               to this slot.
            */

            if (itemIcon) {

                if (
                    item.type === "grass"
                ) {

                    itemIcon.className =
                        "item-icon grass-icon";

                }

                else if (
                    item.type === "dirt"
                ) {

                    itemIcon.className =
                        "item-icon dirt-icon";

                }

                else if (
                    item.type === "stone"
                ) {

                    itemIcon.className =
                        "item-icon stone-icon";

                }

                else if (
                    item.type === "wood"
                ) {

                    itemIcon.className =
                        "item-icon wood-icon";

                }

                else if (
                    item.type === "leaves"
                ) {

                    itemIcon.className =
                        "item-icon leaves-icon";

                }

                else if (
                    item.type === "planks"
                ) {

                    itemIcon.className =
                        "item-icon planks-icon";

                }

                else if (
                    item.type === "crafting_table"
                ) {

                    itemIcon.className =
                        "item-icon crafting-table-icon";

                }

            }


            /*
               Amount.
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