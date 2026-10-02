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

    /*
       First try to find an existing
       stack of the same item.
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
            slot.type === type
        ) {

            slot.amount += amount;

            updateHotbarUI();

            return true;
        }

    }


    /*
       If no existing stack was found,
       find an empty slot.
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
                type: type,
                amount: amount
            };

            updateHotbarUI();

            return true;
        }

    }


    /*
       Inventory is full.
    */

    return false;

}


/* ======================================================
   REMOVE ITEM
====================================================== */

function removeItem(type, amount = 1) {

    const item =
        hotbar.find(
            slot =>
                slot &&
                slot.type === type
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
        (slot, index) => {

            slot.classList.toggle(
                "selected",
                index === selectedHotbarSlot
            );


            const item =
                hotbar[index];


            const itemName =
                slot.querySelector(
                    ".item-name"
                );


            const amount =
                slot.querySelector(
                    ".item-amount"
                );


            if (!item) {

                if (itemName) {
                    itemName.textContent = "";
                }

                if (amount) {
                    amount.textContent = "";
                }

                return;
            }


            if (itemName) {

                itemName.textContent =
                    item.type;

            }


            if (amount) {

                amount.textContent =
                    item.amount;

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