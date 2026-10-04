/*
=========================================================
BLOCKWORLD
Inventory + Hotbar
=========================================================
*/

const HOTBAR_SIZE = 9;

const hotbar = [

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
       First add to an existing stack.
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


    /*
       No inventory space.
    */

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

function getIconClass(type) {

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

        case "sticks":
            return "sticks-icon";

        case "pickaxe":
            return "pickaxe-icon";

        case "coal_ore":
            return "coal-ore-icon";

        case "iron_ore":
            return "iron-ore-icon";

        case "diamond_ore":
            return "diamond-ore-icon";

        default:
            return "";

    }

}


/* ======================================================
   UPDATE HOTBAR UI
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
               Highlight selected slot.
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
               Set icon.
            */

            if (icon) {

                icon.className =
                    "item-icon " +
                    getIconClass(
                        item.type
                    );

            }


            /*
               Set item amount.
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
   NUMBER KEY SELECTION
====================================================== */

document.addEventListener(
    "keydown",
    event => {

        let slot = -1;


        switch (event.code) {

            case "Digit1":
            case "Numpad1":
                slot = 0;
                break;

            case "Digit2":
            case "Numpad2":
                slot = 1;
                break;

            case "Digit3":
            case "Numpad3":
                slot = 2;
                break;

            case "Digit4":
            case "Numpad4":
                slot = 3;
                break;

            case "Digit5":
            case "Numpad5":
                slot = 4;
                break;

            case "Digit6":
            case "Numpad6":
                slot = 5;
                break;

            case "Digit7":
            case "Numpad7":
                slot = 6;
                break;

            case "Digit8":
            case "Numpad8":
                slot = 7;
                break;

            case "Digit9":
            case "Numpad9":
                slot = 8;
                break;

        }


        if (
            slot !== -1
        ) {

            event.preventDefault();

            selectHotbarSlot(slot);

        }

    }
);


/* ======================================================
   MOUSE WHEEL SELECTION
====================================================== */

document.addEventListener(
    "wheel",
    event => {

        /*
           Don't change selection while
           a crafting menu is open.
        */

        if (
            typeof craftingOpen !== "undefined" &&
            craftingOpen
        ) {

            return;

        }


        if (
            typeof tableCraftingOpen !== "undefined" &&
            tableCraftingOpen
        ) {

            return;

        }


        if (
            event.deltaY > 0
        ) {

            selectedHotbarSlot++;


            if (
                selectedHotbarSlot >= HOTBAR_SIZE
            ) {

                selectedHotbarSlot = 0;

            }

        }

        else if (
            event.deltaY < 0
        ) {

            selectedHotbarSlot--;


            if (
                selectedHotbarSlot < 0
            ) {

                selectedHotbarSlot =
                    HOTBAR_SIZE - 1;

            }

        }


        updateHotbarUI();

    }
);


/* ======================================================
   HOTBAR CLICK SELECTION
====================================================== */

document.querySelectorAll(
    ".hotbar-slot"
).forEach(
    (
        slot,
        index
    ) => {

        slot.addEventListener(
            "mousedown",
            event => {

                if (
                    event.button !== 0
                ) {

                    return;

                }


                event.stopPropagation();


                selectHotbarSlot(
                    index
                );

            }
        );

    }
);


/* ======================================================
   INITIAL UI UPDATE
====================================================== */

updateHotbarUI();