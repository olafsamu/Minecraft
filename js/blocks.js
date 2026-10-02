const BLOCKS = {
    grass: {
        name: "Grass",
        color: 0x62b84b,
        breakTime: 500,
        requiresTool: false
    },

    dirt: {
        name: "Dirt",
        color: 0x8b5a2b,
        breakTime: 500,
        requiresTool: false
    },

    stone: {
        name: "Stone",
        color: 0x888888,
        breakTime: 500,
        requiresTool: true,
        requiredTool: "pickaxe"
    },

    wood: {
        name: "Wood",
        color: 0x9b6b30,
        breakTime: 500,
        requiresTool: false
    },

    leaves: {
        name: "Leaves",
        color: 0x4c9f4c,
        breakTime: 500,
        requiresTool: false
    },

    planks: {
        name: "Planks",
        color: 0xb98245,
        breakTime: 500,
        requiresTool: false
    },

    crafting_table: {
        name: "Crafting Table",
        color: 0x8b5a2b,
        breakTime: 500,
        requiresTool: false
    }
};