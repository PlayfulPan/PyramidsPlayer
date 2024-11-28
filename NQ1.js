// ==UserScript==
// @name         NeoQuest.Guide's NeoQuest 1 Helper
// @namespace    NeoQuest.Guide
// @author       NeoQuest.Guide
// @version      20240819
// @description  Keyboard movement and actions, adds detailed info to fight pages
// @match        https://www.neopets.com/games/neoquest/neoquest.phtml*
// @icon         https://neoquest.guide/favicon.png
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

var autoReload = GM_getValue('autoReload', false);
var reloadTimeout = null;

const minClickTiming = 250;
const maxClickTiming = 750;

const defaultActionKeys = ["KeyA", "KeyF", "Space"]; //to disable keyboard actions, set this value to []
//const defaultActionKeys = [];

const gameObjects = {
    monsters: {
        "fire imp": {
            id: 400000,
            image: "./images/png/monsters/400000_afireimp.png",
            level: 1,
            heat: 10,
            damage: 1,
            powers: [],
            drops: [
                ["small yellow gem", 333]
            ],
            map: ["world_crop_1"]
        },
        "snow imp": {
            id: 400001,
            image: "./images/png/monsters/400001_asnowimp.png",
            level: 1,
            cold: 10,
            damage: 1,
            powers: [],
            drops: [
                ["chunk of metal", 333],
                ["blue thread", 333]
            ],
            map: ["world_crop_1"]
        },
        "plains lupe": {
            id: 400002,
            image: "./images/png/monsters/400002_aplainswolf.png",
            level: 2,
            damage: 1,
            powers: [],
            drops: [
                ["glowing stone", 333],
                ["plains lupe pelt", 333]
            ],
            map: ["world_crop_1"]
        },
        "plains aisha": {
            id: 400003,
            image: "./images/png/monsters/400003_aplainscougar.png",
            level: 2,
            damage: 1,
            powers: [],
            drops: [
                ["glowing stone", 333]
            ],
            map: ["world_crop_1"]
        },
        "grey lupe": {
            id: 400004,
            image: "./images/png/monsters/400004_agraywolf.png",
            level: 3,
            damage: 1,
            powers: [],
            drops: [
                ["grey lupe fang", 400]
            ],
            map: []
        },
        "black bearog": {
            id: 400005,
            image: "./images/png/monsters/400005_ablackbear.png",
            level: 3,
            damage: 1,
            cold: 5,
            powers: [],
            drops: [
                ["black bearog paw", 400]
            ],
            map: []
        },
        "grizzly bearog": {
            id: 400006,
            image: "./images/png/monsters/400006_agrizzlybear.png",
            level: 4,
            damage: 1,
            powers: [],
            drops: [
                ["grizzly bearog tooth", 500]
            ],
            map: []
        },
        "dire lupe": {
            id: 400007,
            image: "./images/png/monsters/400007_adirewolf.png",
            level: 4,
            damage: 1,
            heat: 5,
            powers: [],
            drops: [
                ["dire lupe pelt", 500]
            ],
            map: []
        },
        "cave imp": {
            id: 400008,
            image: "./images/png/monsters/400008_acaveimp.png",
            level: 2,
            powers: [],
            drops: [],
            map: []
        },
        "cave slug": {
            id: 400009,
            image: "./images/png/monsters/400009_acaveslug.png",
            level: 3,
            powers: [],
            drops: [],
            map: []
        },
        "cave lupe": {
            id: 400010,
            image: "./images/png/monsters/400010_acavewolf.png",
            level: 4,
            powers: [],
            drops: [
                ["cave lupe pelt", 300]
            ],
            map: []
        },
        "cave troll": {
            id: 400011,
            image: "./images/png/monsters/400011_acavetroll.png",
            level: 5,
            stun: 10,
            powers: [],
            drops: [
                ["tiny garnet", 75],
                ["tiny amber", 75],
                ["tiny beryl", 75],
            ],
            map: []
        },
        "cave ghoul": {
            id: 400012,
            image: "./images/png/monsters/400012_acaveghoul.png",
            level: 5,
            powers: [],
            drops: [
                ["tiny lapis", 75],
                ["tiny obsidian", 100],
                ["lodestone", 100],
            ],
            map: []
        },
        "broken skeleton": {
            id: 400013,
            image: "./images/png/monsters/400013_abrokenskeleton.png",
            level: 6,
            powers: [],
            drops: [
                ["tiny garnet", 75],
                ["tiny amber", 75],
                ["tiny beryl", 75],
                ["tiny lapis", 75],
                ["tiny obsidian", 75],
            ],
            map: []
        },
        "burned skeleton": {
            id: 400014,
            image: "./images/png/monsters/400014_aburnedskeleton.png",
            level: 7,
            heat: 10,
            powers: [],
            drops: [
                ["tiny garnet", 100],
                ["tiny amber", 100],
                ["tiny beryl", 100],
                ["tiny lapis", 100],
                ["tiny obsidian", 150],
            ],
            map: []
        },
        "frozen skeleton": {
            id: 400015,
            image: "./images/png/monsters/400015_afrozenskeleton.png",
            level: 7,
            cold: 10,
            powers: [],
            drops: [
                ["tiny garnet", 100],
                ["tiny amber", 100],
                ["tiny beryl", 100],
                ["tiny lapis", 100],
                ["tiny obsidian", 150],
            ],
            map: []
        },
        "metal devourer": {
            id: 400016,
            image: "./images/png/monsters/400016_ametaldevourer.png",
            level: 8,
            damage: -1,
            heat: 10,
            cold: 10,
            stun: 10,
            powers: ["$MSPW_POISON|P|5|3,3|5|10"],
            maxHitPotential: "m+3",
            drops: [
                ["corroded pyrite rod", 200],
                ["corroded pewter rod", 200],
                ["corroded copper rod", 200],
                ["corroded ore rod", 200],
                ["corroded aluminum rod", 200],
                ["lodestone", 300],
            ],
            map: []
        },
        "cave ogre": {
            id: 400017,
            image: "./images/png/monsters/400017_acaveogre.png",
            level: 8,
            stun: 15,
            powers: ["$MSPW_STUN|P|10|1|0|5"],
            drops: [
                ["tiny garnet", 150],
                ["tiny amber", 150],
                ["tiny beryl", 150],
                ["tiny lapis", 150],
                ["tiny obsidian", 150],
            ],
            map: []
        },
        "skeleton guard": {
            id: 400018,
            image: "./images/png/monsters/400018_askeletonguard.png",
            level: 9,
            powers: [],
            drops: [
                ["piece of smooth glass", 200],
                ["stretch of rotted cloth", 200],
            ],
            map: []
        },
        "xantan the foul": {
            id: 400019,
            image: "./images/png/monsters/400019_zBNtr_XantantheFoul.png",
            level: 10,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 25,
            cold: 25,
            stun: 25,
            xp: 500,
            np: { normal: 500, evil: 750, insane: 1000 },
            maxHitPotential: "m|20",
            powers: ["$MSPW_FIREBLAST|P|10|20|0|10", "$MSPW_ICEBLAST|P|10|20|0|10"],
            drops: [
                ["Xantan's Ring", 1000]
            ],
            hpNormal: 80
        },
        "rotting skeleton": {
            id: 400020,
            image: "./images/png/monsters/400020_arottingskeleton.png",
            level: 5,
            powers: [],
            drops: [],
            map: []
        },
        "shadow knight": {
            id: 400021,
            image: "./images/png/monsters/400021_ashadowknight.png",
            level: 6,
            stun: 10,
            powers: [],
            drops: [],
            map: []
        },
        "koi ghost": {
            id: 400022,
            image: "./images/png/monsters/400022_aghost.png",
            level: 7,
            powers: [],
            drops: [],
            map: []
        },
        "eerie spectre": {
            id: 400023,
            image: "./images/png/monsters/400023_aspectre.png",
            level: 7,
            attack: 1,
            defence: 1,
            damage: 1,
            heat: -5,
            powers: [],
            drops: [],
            map: []
        },
        "wight": {
            id: 400024,
            image: "./images/png/monsters/400024_awight.png",
            level: 8,
            powers: [],
            drops: [],
            map: []
        },
        "kacheek zombie": {
            id: 400025,
            image: "./images/png/monsters/400025_azombie.png",
            level: 8,
            attack: 2,
            defence: 2,
            damage: 2,
            powers: [],
            drops: [],
            map: []
        },
        "jubjub ghoul": {
            id: 400026,
            image: "./images/png/monsters/400026_aghoul.png",
            level: 9,
            defence: 1,
            powers: [],
            drops: [],
            map: []
        },
        "poogle vampire": {
            id: 400027,
            image: "./images/png/monsters/400027_avampire.png",
            level: 10,
            attack: 1,
            defence: 1,
            heat: -10,
            powers: ["$MSPW_STUNBLAST|P|10|10,2|0|8", "$MSPW_LIFETAP|P|10|10|0|8"],
            maxHitPotential: "10,m|10,m",
            drops: [],
            map: []
        },
        "pygmy": {
            id: 400028,
            image: "./images/png/monsters/400028_apygmy.png",
            level: 5,
            heat: 5,
            powers: [],
            drops: [],
            map: []
        },
        "jungle zafara": {
            id: 400029,
            image: "./images/png/monsters/400029_ajunglepanther.png",
            level: 6,
            heat: 5,
            powers: [],
            drops: [],
            map: []
        },
        "angry buzz": {
            id: 400030,
            image: "./images/png/monsters/400030_agiantmosquito.png",
            level: 7,
            heat: 5,
            powers: [],
            drops: [],
            map: []
        },
        "jungle beast": {
            id: 400031,
            image: "./images/png/monsters/400031_ajunglebeast.png",
            level: 10,
            attack: 1,
            heat: 5,
            powers: [],
            drops: [
                ["jungle beast claw", 500]
            ],
            map: []
        },
        "shaman": {
            id: 400032,
            image: "./images/png/monsters/400032_ashaman.png",
            level: 11,
            heat: 10,
            powers: ["$MSPW_FIREBLAST|P|10|15|0|6", "$MSPW_HEAL|P|10|P,20|0|5"],
            maxHitPotential: "m|15",
            drops: [
                ["shamanistic totem", 500],
            ],
            map: []
        },
        "scorpion": {
            id: 400033,
            image: "./images/png/monsters/400033_ascorpion.png",
            level: 11,
            powers: ["$MSPW_POISON|P|10|8,3|0|10"],
            maxHitPotential: "m+8",
            drops: [
                ["scorpion carapace", 500]
            ],
            map: []
        },
        "greater shaman": {
            id: 400034,
            image: "./images/png/monsters/400034_agreatershaman.png",
            level: 12,
            powers: ["$MSPW_ICEBLAST|P|10|20|0|6", "$MSPW_HEAL|P|10|P,20|0|5"],
            maxHitPotential: "m|20",
            drops: [
                ["shamanistic totem", 500],
                ["wooden shield", 500]
            ],
            map: [],
        },
        "killer buzz": {
            id: 400035,
            image: "./images/png/monsters/400035_akillermosquito.png",
            level: 12,
            powers: [],
            drops: [
                ["buzz wing", 500]
            ],
            map: [],
        },
        "armored scorpion": {
            id: 400036,
            image: "./images/png/monsters/400036_anarmoredscorpion.png",
            level: 13,
            defence: 1,
            stun: 20,
            powers: [],
            drops: [
                ["armored stinger", 500]
            ],
            map: []
        },
        "huge skeith": {
            id: 400037,
            image: "./images/png/monsters/400037_ahugeiguana.png",
            level: 13,
            attack: 1,
            powers: [],
            drops: [
                ["skeith fang", 500]
            ],
            map: []
        },
        "giant wadjet": {
            id: 400038,
            image: "./images/png/monsters/400038_agiantpython.png",
            level: 14,
            attack: 1,
            powers: [],
            drops: [
                ["wadjet skin", 500]
            ],
            map: []
        },
        "noil": {
            id: 400039,
            image: "./images/png/monsters/400039_alion.png",
            level: 14,
            attack: 1,
            defence: 1,
            powers: [],
            drops: [
                ["noils tooth", 500],
                ["noils mane", 500]
            ],
            map: []
        },
        "kreai": {
            id: 400040,
            image: "./images/png/monsters/400040_rUmqD_Kreai.png",
            level: 15,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            xp: 700,
            np: { normal: 700, evil: 1000, insane: 1300 },
            powers: ["$MSPW_FIREBLAST|P|10|40|0|10", "$MSPW_ICEBLAST|P|10|40|0|10", "$MSPW_STUN|P|25|2|0|5"],
            maxHitPotential: "m|40,m|40",
            drops: [
                ["rotting wooden key", 1000]
            ],
            hpNormal: 130
        },
        "pygmy warrior": {
            id: 400041,
            image: "./images/png/monsters/400041_apygmywarrior.png",
            level: 15,
            powers: [],
            drops: [],
            map: []
        },
        "jungle knight": {
            id: 400042,
            image: "./images/png/monsters/400042_ajungleknight.png",
            level: 15,
            powers: [],
            drops: [
                ["jungle gauntlet", 50],
                ["jungle vambrace", 50],
                ["jungle breastplate", 50],
                ["jungle helm", 50],
                ["jungle pauldrons", 50],
            ],
            map: []
        },
        "pygmy chief": {
            id: 400043,
            image: "./images/png/monsters/400043_apygmychief.png",
            level: 16,
            powers: [],
            drops: [],
            map: []
        },
        "jungle lord": {
            id: 400044,
            image: "./images/png/monsters/400044_ajunglelord.png",
            level: 16,
            attack: 1,
            defence: 1,
            damage: 1,
            powers: [],
            drops: [
                ["jungle gauntlet", 100],
                ["jungle vambrace", 100],
                ["jungle breastplate", 100],
                ["jungle helm", 100],
                ["jungle pauldrons", 100],
            ],
            map: []
        },
        "pygmy sage": {
            id: 400045,
            image: "./images/png/monsters/400045_apygmysage.png",
            level: 17,
            powers: ["$MSPW_FIREBLAST|P|10|15|0|5", "$MSPW_ICEBLAST|P|10|15|0|5", "$MSPW_HEAL|P|10|P,15|0|5"],
            maxHitPotential: "m|15",
            drops: [],
            map: []
        },
        "jungle battle lord": {
            id: 400046,
            image: "./images/png/monsters/400046_ajunglebattlelord.png",
            level: 17,
            attack: 1,
            defence: 1,
            damage: 1,
            powers: [],
            drops: [
                ["jungle gauntlet", 150],
                ["jungle vambrace", 150],
                ["jungle breastplate", 150],
                ["jungle helm", 150],
                ["jungle pauldrons", 150],
            ],
            map: []
        },
        "pygmy elder": {
            id: 400047,
            image: "./images/png/monsters/400047_apygmyelder.png",
            level: 18,
            powers: ["$MSPW_FIRESTUN|P|10|15,1|0|5", "$MSPW_ICESTUN|P|10|15,1|0|5", "$MSPW_HEAL|P|10|P,15|0|5"],
            maxHitPotential: "15,15,m",
            drops: [],
            map: []
        },
        "jungle death knight": {
            id: 400048,
            image: "./images/png/monsters/400048_ajungledeathknight.png",
            level: 18,
            attack: 1,
            defence: 1,
            damage: 1,
            powers: [],
            drops: [
                ["jungle gauntlet", 200],
                ["jungle vambrace", 200],
                ["jungle breastplate", 200],
                ["jungle helm", 200],
                ["jungle pauldrons", 200],
            ],
            map: []
        },
        "skeletal guardian": {
            id: 400049,
            image: "./images/png/monsters/400049_askeletalguardian.png",
            level: 19,
            attack: 1,
            defence: 1,
            damage: 1,
            powers: [],
            drops: [
                ["jungle gauntlet", 250],
                ["jungle vambrace", 250],
                ["jungle breastplate", 250],
                ["jungle helm", 250],
                ["jungle pauldrons", 250],
            ],
            map: []
        },
        "skeletal shaman": {
            id: 400050,
            image: "./images/png/monsters/400050_askeletalshaman.png",
            level: 19,
            powers: ["$MSPW_FIREBLAST|P|10|20|0|8", "$MSPW_ICEBLAST|P|10|20|0|8", "$MSPW_STUN|P|10|2|15|8", "$MSPW_HEAL|P|10|P,15|0|8"],
            maxHitPotential: "m|20,m|20",
            drops: [],
            map: []
        },
        "gors the mighty": {
            id: 400051,
            image: "./images/png/monsters/400051_pLOIa_GorstheMighty.png",
            level: 20,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            xp: 850,
            np: { normal: 850, evil: 1275, insane: 1700 },
            powers: ["$MSPW_FIRESTUN|P|10|30,2|0|10", "$MSPW_ICESTUN|P|10|30,2|0|10", "$MSPW_POISON|P|15|15,5|0|10", "$MSPW_HEAL|P|5|P,20|0|8"],
            maxHitPotential: "45,m+15,45,m+15,m+15",
            drops: [
                ["Staff of Ni-tas", 1000],
                ["silvered horn key", 1000]
            ],
            hpNormal: 150
        },
        "fire lizard": {
            id: 400052,
            image: "./images/png/monsters/400052_afirelizard.png",
            level: 20,
            heat: 20,
            cold: -20,
            powers: ["$MSPW_FIREBLAST|P|20|20|0|7"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "ice lizard": {
            id: 400053,
            image: "./images/png/monsters/400053_anicelizard.png",
            level: 20,
            heat: -20,
            cold: 20,
            powers: ["$MSPW_ICEBLAST|P|20|20|0|7"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "shock lizard": {
            id: 400054,
            image: "./images/png/monsters/400054_ashocklizard.png",
            level: 20,
            stun: 20,
            def: -1,
            powers: ["$MSPW_STUN|P|20|1|0|7"],
            drops: [],
            map: []
        },
        "flame lizard": {
            id: 400055,
            image: "./images/png/monsters/400055_aflamelizard.png",
            level: 21,
            heat: 20,
            cold: -10,
            powers: ["$MSPW_FIREBLAST|P|25|20|0|6"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "frost lizard": {
            id: 400056,
            image: "./images/png/monsters/400056_afrostlizard.png",
            level: 21,
            heat: -10,
            cold: 20,
            powers: ["$MSPW_ICEBLAST|P|25|20|0|6"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "lightning lizard": {
            id: 400057,
            image: "./images/png/monsters/400057_alightninglizard.png",
            level: 21,
            stun: 20,
            def: -1,
            powers: ["$MSPW_STUN|P|25|1|0|6"],
            drops: [],
            map: []
        },
        "inferno lizard": {
            id: 400058,
            image: "./images/png/monsters/400058_aninfernolizard.png",
            level: 22,
            heat: 20,
            cold: -10,
            powers: ["$MSPW_FIREBLAST|P|25|30|0|6"],
            maxHitPotential: "m|30",
            drops: [],
            map: []
        },
        "blizzard lizard": {
            id: 400059,
            image: "./images/png/monsters/400059_ablizzardlizard.png",
            level: 22,
            heat: -10,
            cold: 20,
            powers: ["$MSPW_ICEBLAST|P|25|30|0|6"],
            maxHitPotential: "m|30",
            drops: [],
            map: []
        },
        "thunder lizard": {
            id: 400060,
            image: "./images/png/monsters/400060_athunderlizard.png",
            level: 22,
            stun: 20,
            def: -1,
            powers: ["$MSPW_STUN|P|25|2|0|6"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "fiery lizard": {
            id: 400061,
            image: "./images/png/monsters/400061_afierylizard.png",
            level: 23,
            heat: 20,
            cold: -10,
            powers: ["$MSPW_FIREBLAST|P|25|30|0|5"],
            maxHitPotential: "m|30",
            drops: [],
            map: []
        },
        "frozen lizard": {
            id: 400062,
            image: "./images/png/monsters/400062_afrozenlizard.png",
            level: 23,
            heat: -10,
            cold: 20,
            powers: ["$MSPW_ICEBLAST|P|25|30|0|5"],
            maxHitPotential: "m|30",
            drops: [],
            map: []
        },
        "electro lizard": {
            id: 400063,
            image: "./images/png/monsters/400063_anelectrolizard.png",
            level: 23,
            stun: 20,
            def: -1,
            powers: ["$MSPW_STUN|P|25|2|0|5"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "fire lizard guardian": {
            id: 400064,
            image: "./images/png/monsters/400064_afirelizardguardian.png",
            level: 24,
            heat: 30,
            powers: ["$MSPW_FIRESTUN|P|15|20,2|0|7"],
            maxHitPotential: "20,m,m",
            drops: [],
            map: []
        },
        "ice lizard guardian": {
            id: 400065,
            image: "./images/png/monsters/400065_anicelizardguardian.png",
            level: 24,
            cold: 30,
            powers: ["$MSPW_ICESTUN|P|15|20,2|0|7"],
            maxHitPotential: "20,m,m",
            drops: [],
            map: []
        },
        "shock lizard guardian": {
            id: 400066,
            image: "./images/png/monsters/400066_ashocklizardguardian.png",
            level: 24,
            stun: 30,
            powers: ["$MSPW_STUN|P|15|3|0|10"],
            maxHitPotential: "m,m,m",
            drops: [],
            map: []
        },
        "rollay scaleback": {
            id: 400067,
            image: "./images/png/monsters/400067_rbbZZ_RollayScaleback.png",
            level: 25,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            xp: 1000,
            np: { normal: 1000, evil: 1500, insane: 2000 },
            powers: ["$MSPW_STUN|P|15|3|0|10", "$MSPW_HEAL|P|15|P,25|0|8"],
            maxHitPotential: "m,m,m",
            drops: [
                ["Rusty Medallion", 1000],
                ["Jeweled Crystal Key", 1000]
            ],
            hpNormal: 180
        },
        "swamp lupe": {
            id: 400068,
            image: "./images/png/monsters/400068_aswampwolf.png",
            level: 11,
            powers: [],
            drops: [],
            map: []
        },
        "krawk": {
            id: 400069,
            image: "./images/png/monsters/400069_analligator.png",
            level: 11,
            powers: [],
            drops: [],
            map: []
        },
        "brown wadjet": {
            id: 400070,
            image: "./images/png/monsters/400070_abrownpython.png",
            level: 12,
            powers: [],
            drops: [],
            map: []
        },
        "swamp krawk": {
            id: 400071,
            image: "./images/png/monsters/400071_aswampalligator.png",
            level: 12,
            powers: [],
            drops: [],
            map: []
        },
        "black wadjet": {
            id: 400072,
            image: "./images/png/monsters/400072_ablackpython.png",
            level: 13,
            powers: [],
            drops: [],
            map: []
        },
        "vicious vine": {
            id: 400073,
            image: "./images/png/monsters/400073_aviciousvine.png",
            level: 13,
            powers: ["$MSPW_POISON|P|10|10,3|0|10"],
            maxHitPotential: "m+10",
            drops: [],
            map: []
        },
        "giant krawk": {
            id: 400074,
            image: "./images/png/monsters/400074_agiantalligator.png",
            level: 14,
            powers: [],
            drops: [],
            map: []
        },
        "crushing vine": {
            id: 400075,
            image: "./images/png/monsters/400075_acrushingvine.png",
            level: 14,
            powers: ["$MSPW_POISON|P|10|12,3|0|10"],
            maxHitPotential: "m+12",
            drops: [],
            map: []
        },
        "swamp dire lupe": {
            id: 400076,
            image: "./images/png/monsters/400076_aswampdirewolf.png",
            level: 15,
            powers: [],
            drops: [],
            map: []
        },
        "deadly vine": {
            id: 400077,
            image: "./images/png/monsters/400077_adeadlyvine.png",
            level: 15,
            powers: ["$MSPW_POISON|P|10|14,3|0|10"],
            maxHitPotential: "m+14",
            drops: [],
            map: []
        },
        "plains ogre": {
            id: 400078,
            image: "./images/png/monsters/400078_aplainsogre.png",
            level: 16,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "lupe warrior": {
            id: 400079,
            image: "./images/png/monsters/400079_awolfman.png",
            level: 16,
            attack: 1,
            powers: [],
            drops: [],
            map: []
        },
        "ghastly meerca": {
            id: 400080,
            image: "./images/png/monsters/400080_aghast.png",
            level: 17,
            powers: ["$MSPW_LIFETAP|P|10|20|0|10"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "lupe mage": {
            id: 400081,
            image: "./images/png/monsters/400081_awolfmage.png",
            level: 17,
            powers: ["$MSPW_FIREBLAST|P|10|20|0|6", "$MSPW_ICEBLAST|P|10|20|0|6"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "giant sand spyder": {
            id: 400082,
            image: "./images/png/monsters/400082_agiantsandspider.png",
            level: 18,
            powers: [],
            drops: [
                ["giant spider leg", 500],
                ["drop of giant spider blood", 500]
            ],
            map: []
        },
        "desert cobrall": {
            id: 400083,
            image: "./images/png/monsters/400083_adesertcobra.png",
            level: 18,
            powers: ["$MSPW_POISON|P|15|20,2|0|6"],
            maxHitPotential: "m+20",
            drops: [
                ["drop of desert cobra venom", 500],
                ["desert cobra fang", 500]
            ],
            map: []
        },
        "sand skeith": {
            id: 400084,
            image: "./images/png/monsters/400084_asandiguana.png",
            level: 19,
            powers: [],
            drops: [
                ["sand iguana eye", 500],
                ["glob of dried iguana spit", 500]
            ],
            map: []
        },
        "dust mummy": {
            id: 400085,
            image: "./images/png/monsters/400085_adustmummy.png",
            level: 19,
            powers: [],
            drops: [],
            map: []
        },
        "giant dust spyder": {
            id: 400086,
            image: "./images/png/monsters/400086_agiantdustspider.png",
            level: 20,
            powers: ["$MSPW_STUN|P|15|2|10|10"],
            maxHitPotential: "m,m",
            drops: [
                ["dust spider pincer", 500]
            ],
            map: []
        },
        "desert zombie": {
            id: 400087,
            image: "./images/png/monsters/400087_adesertzombie.png",
            level: 20,
            powers: ["$MSPW_LIFETAP|P|10|25|0|8"],
            maxHitPotential: "m|25",
            drops: [
                ["pinch of crystallized sand", 500]
            ],
            map: []
        },
        "young hill giant": {
            id: 400088,
            image: "./images/png/monsters/400088_ayounghillgiant.png",
            level: 19,
            defence: 1,
            powers: [],
            drops: [],
            map: []
        },
        "dirt golem": {
            id: 400089,
            image: "./images/png/monsters/400089_adirtgolem.png",
            level: 19,
            defence: 1,
            heat: 3,
            cold: 3,
            stun: 3,
            powers: [],
            drops: [
                ["glowing stone", 500]
            ],
            map: []
        },
        "hill giant": {
            id: 400090,
            image: "./images/png/monsters/400090_ahillgiant.png",
            level: 20,
            damage: 2,
            powers: [],
            drops: [],
            map: []
        },
        "rock golem": {
            id: 400091,
            image: "./images/png/monsters/400091_arockgolem.png",
            level: 20,
            defence: 1,
            heat: 6,
            cold: 6,
            stun: 6,
            powers: [],
            drops: [
                ["glowing stone", 500]
            ],
            map: []
        },
        "young plains grarrl": {
            id: 400092,
            image: "./images/png/monsters/400092_ayoungplainsgiant.png",
            level: 20,
            damage: 1,
            powers: [],
            drops: [
                ["carved oak staff", 500]
            ],
            map: []
        },
        "stone golem": {
            id: 400093,
            image: "./images/png/monsters/400093_astonegolem.png",
            level: 21,
            defence: 2,
            heat: 9,
            cold: 9,
            stun: 9,
            powers: [],
            drops: [
                ["glowing stone", 500]
            ],
            map: []
        },
        "plains grarrl": {
            id: 400094,
            image: "./images/png/monsters/400094_aplainsgiant.png",
            level: 21,
            damage: 2,
            powers: [],
            drops: [
                ["carved oak staff", 500]
            ],
            map: []
        },
        "iron golem": {
            id: 400095,
            image: "./images/png/monsters/400095_anirongolem.png",
            level: 22,
            defence: 2,
            heat: 12,
            cold: 12,
            stun: 12,
            powers: [],
            drops: [
                ["glowing stone", 500]
            ],
            map: []
        },
        "elder plains grarrl": {
            id: 400096,
            image: "./images/png/monsters/400096_anelderplainsgiant.png",
            level: 22,
            damage: 2,
            attack: 1,
            powers: [],
            drops: [
                ["carved oak staff", 500]
            ],
            map: []
        },
        "steel golem": {
            id: 400097,
            image: "./images/png/monsters/400097_asteelgolem.png",
            level: 23,
            defence: 2,
            heat: 15,
            cold: 15,
            stun: 15,
            powers: [],
            drops: [
                ["glowing stone", 500]
            ],
            map: []
        },
        "ancient plains grarrl": {
            id: 400098,
            image: "./images/png/monsters/400098_anancientplainsgiant.png",
            level: 23,
            damage: 2,
            attack: 2,
            powers: [],
            drops: [
                ["carved oak staff", 500]
            ],
            map: []
        },
        "cave scorpion": {
            id: 400099,
            image: "./images/png/monsters/400099_acavescorpion.png",
            level: 20,
            powers: [],
            drops: [],
            map: []
        },
        "giant cave lizard": {
            id: 400100,
            image: "./images/png/monsters/400100_agiantcavelizard.png",
            level: 21,
            powers: [],
            drops: [],
            map: []
        },
        "desert khonsu": {
            id: 400101,
            image: "./images/png/monsters/400101_adesertmummy.png",
            level: 22,
            powers: ["$MSPW_LIFETAP|P|15|25|0|10"],
            maxHitPotential: "m|25",
            drops: [],
            map: []
        },
        "temple guardian": {
            id: 400102,
            image: "./images/png/monsters/400102_atempleguardian.png",
            level: 23,
            powers: [],
            drops: [],
            map: []
        },
        "sand golem": {
            id: 400103,
            image: "./images/png/monsters/400103_asandgolem.png",
            level: 24,
            defence: 2,
            heat: 25,
            cold: 5,
            powers: [],
            drops: [],
            map: []
        },
        "greater temple guardian": {
            id: 400104,
            image: "./images/png/monsters/400104_agreatertempleguardian.png",
            level: 24,
            powers: [],
            drops: [],
            map: []
        },
        "glass golem": {
            id: 400105,
            image: "./images/png/monsters/400105_aglassgolem.png",
            level: 25,
            defence: 2,
            heat: 5,
            cold: 25,
            powers: [],
            drops: [],
            map: []
        },
        "temple watchman": {
            id: 400106,
            image: "./images/png/monsters/400106_atemplewatchman.png",
            level: 25,
            powers: [],
            drops: [],
            map: []
        },
        "crystal golem": {
            id: 400107,
            image: "./images/png/monsters/400107_acrystalgolem.png",
            level: 26,
            defence: 3,
            heat: 25,
            cold: 25,
            powers: [],
            drops: [
                ["piece of living crystal", 500]
            ],
            map: []
        },
        "temple sentinel": {
            id: 400108,
            image: "./images/png/monsters/400108_atemplesentinel.png",
            level: 26,
            attack: 2,
            damage: 2,
            powers: [],
            drops: [],
            map: []
        },
        "ghastly guard": {
            id: 400109,
            image: "./images/png/monsters/400109_aghastlyguard.png",
            level: 27,
            powers: ["$MSPW_LIFETAP|P|15|30|0|10"],
            maxHitPotential: "m|30",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly initiate": {
            id: 400110,
            image: "./images/png/monsters/400110_aghastlyinitiate.png",
            level: 28,
            powers: ["$MSPW_LIFETAP|P|15|35|0|8"],
            maxHitPotential: "m|35",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["copper-plated key", 1000]
            ],
            map: []
        },
        "ghastly guardian": {
            id: 400111,
            image: "./images/png/monsters/400111_aghastlyguardian.png",
            level: 27,
            powers: ["$MSPW_LIFETAP|P|15|30|0|9"],
            maxHitPotential: "m|30",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly sentry": {
            id: 400112,
            image: "./images/png/monsters/400112_aghastlysentry.png",
            level: 28,
            powers: ["$MSPW_LIFETAP|P|15|35|0|8"],
            maxHitPotential: "m|35",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly adept": {
            id: 400113,
            image: "./images/png/monsters/400113_aghastlyadept.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["bronze-plated key", 1000]
            ],
            map: []
        },
        "ghastly priest": {
            id: 400114,
            image: "./images/png/monsters/400114_aghastlypriest.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["silver-plated key", 1000]
            ],
            map: []
        },
        "ghastly master": {
            id: 400115,
            image: "./images/png/monsters/400115_aghastlymaster.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["gold-plated key", 1000]
            ],
            map: []
        },
        "ghastly protector": {
            id: 400116,
            image: "./images/png/monsters/400116_aghastlyprotector.png",
            level: 28,
            powers: ["$MSPW_LIFETAP|P|15|35|0|8"],
            maxHitPotential: "m|35",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly sentinel": {
            id: 400117,
            image: "./images/png/monsters/400117_aghastlysentinel.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly archon": {
            id: 400118,
            image: "./images/png/monsters/400118_aghastlyarchon.png",
            level: 30,
            powers: ["$MSPW_LIFETAP|P|15|45|0|6"],
            maxHitPotential: "m|45",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["platinum-plated key", 1000]
            ],
            map: []
        },
        "ghastly templar": {
            id: 400119,
            image: "./images/png/monsters/400119_aghastlytemplar.png",
            level: 30,
            powers: ["$MSPW_LIFETAP|P|15|45|0|6"],
            maxHitPotential: "m|45",
            drops: [
                ["emerald", 200],
                ["onyx", 200],
                ["ruby", 200],
                ["sapphire", 200],
                ["topaz", 200],
                ["crystalline key", 1000]
            ],
            map: []
        },
        "ghastly defender": {
            id: 400120,
            image: "./images/png/monsters/400120_aghastlydefender.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly champion": {
            id: 400121,
            image: "./images/png/monsters/400121_aghastlychampion.png",
            level: 29,
            powers: ["$MSPW_LIFETAP|P|15|40|0|7"],
            maxHitPotential: "m|40",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "ghastly warder": {
            id: 400122,
            image: "./images/png/monsters/400122_aghastlywarder.png",
            level: 30,
            powers: ["$MSPW_LIFETAP|P|20|45|0|6"],
            maxHitPotential: "m|45",
            drops: [
                ["emerald", 100],
                ["onyx", 100],
                ["ruby", 100],
                ["sapphire", 100],
                ["topaz", 100],
            ],
            map: []
        },
        "the archmagus of roo": {
            id: 400123,
            image: "./images/png/monsters/400123_GLkAS_theArchmagusofRoo.png",
            level: 31,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            xp: 1200,
            np: { normal: 1200, evil: 1800, insane: 2400 },
            powers: ["$MSPW_HEAL|P|20|P,40|20|10", "$MSPW_FIREBLAST|P|20|50|0|5", "$MSPW_ICEBLAST|P|20|50|0|5", "$MSPW_FIRESTUN|P|20|40,3|20|15", "$MSPW_ICESTUN|P|20|40,3|20|15", "$MSPW_LIFETAP|P|15|50|0|7"],
            maxHitPotential: "40,m|50,m|50,40,m|50,m,m",
            drops: [
                ["Clouded Gem", 1000]
            ],
            hpNormal: 200
        },
        "hatchling drakonid": {
            id: 400124,
            image: "./images/png/monsters/400124_ahatchlingdrakonid.png",
            level: 27,
            powers: ["$MSPW_FIREBLAST|P|5|30|0|15"],
            maxHitPotential: "m|30",
            drops: [
                ["drakonid eye", 250],
            ],
            map: []
        },
        "agate dervish": {
            id: 400125,
            image: "./images/png/monsters/400125_anagatedervish.png",
            level: 27,
            defence: 1,
            powers: ["$MSPW_STUN|P|5|2|20|10"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of agate", 250]
            ],
            map: []
        },
        "juvenile drakonid": {
            id: 400126,
            image: "./images/png/monsters/400126_ajuveniledrakonid.png",
            level: 28,
            powers: ["$MSPW_FIREBLAST|P|5|35|0|12"],
            maxHitPotential: "m|35",
            drops: [
                ["drakonid eye", 250],
                ["drakonid hide", 250],
            ],
            map: []
        },
        "greater agate dervish": {
            id: 400127,
            image: "./images/png/monsters/400127_agreateragatedervish.png",
            level: 28,
            defence: 1,
            powers: ["$MSPW_STUN|P|5|2|17|9"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of agate", 250]
            ],
            map: []
        },
        "rock scorchio": {
            id: 400128,
            image: "./images/png/monsters/400128_arockdragon.png",
            level: 29,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "chrysolite dervish": {
            id: 400129,
            image: "./images/png/monsters/400129_achrysolitedervish.png",
            level: 29,
            defence: 1,
            powers: ["$MSPW_STUN|P|8|2|14|9"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of chrysolite", 250]
            ],
            map: []
        },
        "adult drakonid": {
            id: 400130,
            image: "./images/png/monsters/400130_anadultdrakonid.png",
            level: 30,
            powers: ["$MSPW_FIREBLAST|P|10|35|0|10"],
            maxHitPotential: "m|35",
            drops: [
                ["drakonid heart", 250],
                ["drakonid hide", 250],
            ],
            map: []
        },
        "tempus rock scorchio": {
            id: 400131,
            image: "./images/png/monsters/400131_atempusrockdragon.png",
            level: 30,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "morgus rock scorchio": {
            id: 400132,
            image: "./images/png/monsters/400132_amorgusrockdragon.png",
            level: 31,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "greater chrysolite dervish": {
            id: 400133,
            image: "./images/png/monsters/400133_agreaterchrysolitedervish.png",
            level: 31,
            defence: 1,
            powers: ["$MSPW_STUN|P|11|2|14|8"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of chrysolite", 250]
            ],
            map: []
        },
        "mature drakonid": {
            id: 400134,
            image: "./images/png/monsters/400134_amaturedrakonid.png",
            level: 32,
            powers: ["$MSPW_FIREBLAST|P|10|45|-20|8"],
            maxHitPotential: "m|45",
            drops: [
                ["drakonid eye", 250],
                ["drakonid heart", 250],
                ["drakonid hide", 250],
            ],
            map: []
        },
        "serpentine dervish": {
            id: 400135,
            image: "./images/png/monsters/400135_aserpentinedervish.png",
            level: 32,
            defence: 1,
            powers: ["$MSPW_STUN|P|14|2|14|8"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of serpentine", 250]
            ],
            map: []
        },
        "fumit rock scorchio": {
            id: 400136,
            image: "./images/png/monsters/400136_afumitrockdragon.png",
            level: 33,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "greater serpentine dervish": {
            id: 400137,
            image: "./images/png/monsters/400137_agreaterserpentinedervish.png",
            level: 33,
            defence: 1,
            powers: ["$MSPW_STUN|P|14|2|10|8"],
            maxHitPotential: "m,m",
            drops: [
                ["piece of serpentine", 250]
            ],
            map: []
        },
        "elder drakonid": {
            id: 400138,
            image: "./images/png/monsters/400138_anelderdrakonid.png",
            level: 34,
            powers: ["$MSPW_FIREBLAST|P|15|50|-30|8"],
            maxHitPotential: "m|50",
            drops: [
                ["drakonid eye", 250],
                ["drakonid heart", 250],
                ["drakonid hide", 250],
            ],
            map: []
        },
        "lazulite dervish": {
            id: 400139,
            image: "./images/png/monsters/400139_alazulitedervish.png",
            level: 34,
            defence: 1,
            powers: ["$MSPW_STUN|P|15|2|7|8"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "tolbas rock scorchio": {
            id: 400140,
            image: "./images/png/monsters/400140_atolbasrockdragon.png",
            level: 35,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "melatite dervish": {
            id: 400141,
            image: "./images/png/monsters/400141_amelatitedervish.png",
            level: 35,
            defence: 1,
            powers: ["$MSPW_STUN|P|15|2|4|7"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "praetus rock scorchio": {
            id: 400142,
            image: "./images/png/monsters/400142_apraetusrockdragon.png",
            level: 36,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "greater melatite dervish": {
            id: 400143,
            image: "./images/png/monsters/400143_agreatermelatitedervish.png",
            level: 36,
            defence: 1,
            powers: ["$MSPW_STUN|P|15|2|0|7"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "giant drakonid": {
            id: 400144,
            image: "./images/png/monsters/400144_agiantdrakonid.png",
            level: 37,
            powers: ["$MSPW_FIREBLAST|P|15|50|-30|6"],
            maxHitPotential: "m|50",
            drops: [
                ["drakonid eye", 250],
                ["drakonid heart", 250],
                ["drakonid hide", 250],
            ],
            map: []
        },
        "granite dervish": {
            id: 400145,
            image: "./images/png/monsters/400145_agranitedervish.png",
            level: 37,
            defence: 1,
            powers: ["$MSPW_STUN|P|15|2|0|7"],
            maxHitPotential: "m,m",
            drops: [],
            map: []
        },
        "mountain guardian": {
            id: 400146,
            image: "./images/png/monsters/400146_amountainguardian.png",
            level: 38,
            attack: 1,
            defence: 2,
            powers: ["$MSPW_HEAL|P|15|P,20|0|7"],
            drops: [
                ["Inferno Robe", 50],
                ["Evening Sun Energy Shield", 50]
            ],
            map: []
        },
        "mountain protector": {
            id: 400147,
            image: "./images/png/monsters/400147_amountainprotector.png",
            level: 38,
            attack: 1,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_HEAL|P|15|P,20|0|7"],
            drops: [
                ["Inferno Robe", 50],
                ["Evening Sun Energy Shield", 50]
            ],
            map: []
        },
        "greater spirit": {
            id: 400148,
            image: "./images/png/monsters/400148_agreaterspirit.png",
            level: 38,
            attack: 2,
            defence: 2,
            powers: [],
            drops: [
                ["Inferno Robe", 50],
                ["Evening Sun Energy Shield", 50]
            ],
            map: []
        },
        "shock elemental": {
            id: 400149,
            image: "./images/png/monsters/400149_ashockelemental.png",
            level: 39,
            attack: 2,
            defence: 2,
            stun: 30,
            powers: ["$MSPW_STUN|P|20|3|0|6"],
            maxHitPotential: "m,m,m",
            drops: [
                ["Evening Sun Energy Shield", 100]
            ],
            map: []
        },
        "spectral elemental": {
            id: 400150,
            image: "./images/png/monsters/400150_aspectralelemental.png",
            level: 39,
            attack: 2,
            defence: 4,
            heat: 10,
            cold: 10,
            stun: 10,
            powers: ["$MSPW_DISABLE|P|20|10,4|0|10"],
            drops: [
                ["Evening Sun Energy Shield", 100]
            ],
            map: []
        },
        "fire elemental": {
            id: 400151,
            image: "./images/png/monsters/400151_afireelemental.png",
            level: 39,
            attack: 2,
            defence: 2,
            heat: 30,
            powers: ["$MSPW_FIREBLAST|P|20|100|0|6"],
            maxHitPotential: "m|100",
            drops: [
                ["Inferno Robe", 100]
            ],
            map: []
        },
        "life elemental": {
            id: 400152,
            image: "./images/png/monsters/400152_alifeelemental.png",
            level: 39,
            attack: 2,
            defence: 2,
            hpNormal: 300,
            powers: ["$MSPW_HEAL|P|20|P,20|0|7"],
            drops: [
                ["Inferno Robe", 50],
                ["Evening Sun Energy Shield", 50]
            ],
            map: []
        },
        "ice elemental": {
            id: 400153,
            image: "./images/png/monsters/400153_aniceelemental.png",
            level: 39,
            attack: 2,
            defence: 2,
            cold: 30,
            powers: ["$MSPW_ICEBLAST|P|20|80|0|5"],
            maxHitPotential: "m|80",
            drops: [
                ["Inferno Robe", 100]
            ],
            map: []
        },
        "the guardian of shock magic": {
            id: 400154,
            image: "./images/png/monsters/400154_VnaeF_theGuardianofShockMagic.png",
            level: 40,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 200,
            xp: 500,
            np: { normal: 500, evil: 1000, insane: 1500 },
            powers: ["$MSPW_STUN|P|40|4|10|15", "$MSPW_LIFETAP|P|15|70|0|7"],
            maxHitPotential: "m|70,m,m,m",
            drops: [
                ["Thunderstar Staff", 1000]
            ],
            hpNormal: 320
        },
        "the guardian of spectral magic": {
            id: 400155,
            image: "./images/png/monsters/400155_AasWK_theGuardianofSpectralMagic.png",
            level: 40,
            attack: 3,
            defence: 6,
            damage: 3,
            heat: 50,
            cold: 50,
            stun: 50,
            xp: 500,
            np: { normal: 500, evil: 1000, insane: 1500 },
            powers: ["$MSPW_DISABLE|P|40|30,5|10|12", "$MSPW_LIFETAP|P|15|70|0|7"],
            maxHitPotential: "m|70",
            drops: [
                ["Shadowgem Staff", 1000]
            ],
            hpNormal: 320
        },
        "the guardian of fire magic": {
            id: 400156,
            image: "./images/png/monsters/400156_NQRQW_theGuardianofFireMagic.png",
            level: 40,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 200,
            cold: 30,
            stun: 30,
            xp: 500,
            np: { normal: 500, evil: 1000, insane: 1500 },
            powers: ["$MSPW_FIREBLAST|P|40|90|0|5", "$MSPW_LIFETAP|P|15|70|0|7"],
            maxHitPotential: "m|90",
            drops: [
                ["Firedrop Staff", 1000]
            ],
            hpNormal: 320
        },
        "the guardian of life magic": {
            id: 400157,
            image: "./images/png/monsters/400157_qlfCy_theGuardianofLifeMagic.png",
            level: 40,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            xp: 500,
            np: { normal: 500, evil: 1000, insane: 1500 },
            powers: ["$MSPW_HEAL|P|40|A,75|0|8", "$MSPW_LIFETAP|P|15|70|0|7"],
            maxHitPotential: "m|70",
            drops: [
                ["Moonstone Staff", 1000]
            ],
            hpNormal: 450
        },
        "the guardian of ice magic": {
            id: 400158,
            image: "./images/png/monsters/400158_iYhMr_theGuardianofIceMagic.png",
            level: 40,
            attack: 3,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 200,
            stun: 30,
            xp: 500,
            np: { normal: 500, evil: 1000, insane: 1500 },
            powers: ["$MSPW_ICEBLAST|P|40|70|0|4", "$MSPW_LIFETAP|P|15|70|0|7"],
            maxHitPotential: "m|70",
            drops: [
                ["Iceheart Staff", 1000]
            ],
            hpNormal: 320
        },
        "storm chia giant": {
            id: 400159,
            image: "./images/png/monsters/400159_astormgiant.png",
            level: 35,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_STUN|P|20|1|0|8"],
            drops: [],
            map: []
        },
        "shadow kougra": {
            id: 400160,
            image: "./images/png/monsters/400160_ashadowbeast.png",
            level: 35,
            attack: 2,
            powers: ["$MSPW_LIFETAP|P|20|35|0|7"],
            maxHitPotential: "m|35",
            drops: [],
            map: []
        },
        "thunder chia giant": {
            id: 400161,
            image: "./images/png/monsters/400161_athundergiant.png",
            level: 36,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_STUNBLAST|P|10|40,1|0|8"],
            maxHitPotential: "40,m",
            drops: [],
            map: []
        },
        "vapour kougra": {
            id: 400162,
            image: "./images/png/monsters/400162_avaporbeast.png",
            level: 36,
            attack: 2,
            powers: ["$MSPW_LIFETAP|P|20|40|0|7"],
            maxHitPotential: "m|40",
            drops: [],
            map: []
        },
        "lightning chia giant": {
            id: 400163,
            image: "./images/png/monsters/400163_alightninggiant.png",
            level: 37,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_STUNBLAST|P|15|45,1|0|7"],
            maxHitPotential: "45,m",
            drops: [],
            map: []
        },
        "mist kougra": {
            id: 400164,
            image: "./images/png/monsters/400164_amistbeast.png",
            level: 37,
            attack: 2,
            powers: ["$MSPW_LIFETAP|P|20|45|0|6"],
            maxHitPotential: "m|45",
            drops: [],
            map: []
        },
        "frost chia giant": {
            id: 400165,
            image: "./images/png/monsters/400165_afrostgiant.png",
            level: 38,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_ICESTUN|P|15|45,1|-20|7"],
            maxHitPotential: "45,m",
            drops: [],
            map: []
        },
        "blizzard kougra": {
            id: 400166,
            image: "./images/png/monsters/400166_ablizzardbeast.png",
            level: 38,
            attack: 2,
            powers: ["$MSPD_ICEBLAST|P|20|60|-10|7"],
            maxHitPotential: "m|60",
            drops: [],
            map: []
        },
        "reaver chia giant": {
            id: 400167,
            image: "./images/png/monsters/400167_areavergiant.png",
            level: 38,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_LIFETAP|P|15|50|0|8"],
            maxHitPotential: "m|50",
            drops: [],
            map: []
        },
        "gloom kougra": {
            id: 400168,
            image: "./images/png/monsters/400168_agloombeast.png",
            level: 38,
            attack: 2,
            powers: ["$MSPW_DISABLE|P|20|20,4|0|8", "$MSPW_LIFETAP|P|10|30|0|8"],
            maxHitPotential: "m|30",
            drops: [],
            map: []
        },
        "chaos giant": {
            id: 400169,
            image: "./images/png/monsters/400169_achaosgiant.png",
            level: 39,
            defence: 1,
            damage: 1,
            powers: ["$MSPW_LIFETAP|P|15|50|0|7", "$MSPW_STUNBLAST|P|15|60,1|0|6"],
            maxHitPotential: "60,m|50",
            drops: [],
            map: []
        },
        "dusk kougra": {
            id: 400170,
            image: "./images/png/monsters/400170_aduskbeast.png",
            level: 39,
            attack: 2,
            powers: ["$MSPW_DISABLE|P|20|20,5|0|8", "$MSPW_LIFETAP|P|10|40|0|7"],
            maxHitPotential: "m|40",
            drops: [],
            map: []
        },
        "undead moehog": {
            id: 400171,
            image: "./images/png/monsters/400171_anundeadfarmer.png",
            level: 39,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|50|0|7"],
            maxHitPotential: "m|50",
            drops: [],
            map: []
        },
        "undead patrolman": {
            id: 400172,
            image: "./images/png/monsters/400172_anundeadpatrolman.png",
            level: 39,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|50|-10|7"],
            maxHitPotential: "m|50",
            drops: [],
            map: []
        },
        "undead cybunny": {
            id: 400173,
            image: "./images/png/monsters/400173_anundeadcitizen.png",
            level: 40,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|55|-10|7"],
            maxHitPotential: "m|55",
            drops: [],
            map: []
        },
        "undead city guard": {
            id: 400174,
            image: "./images/png/monsters/400174_anundeadcityguard.png",
            level: 40,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|55|-20|7"],
            maxHitPotential: "m|55",
            drops: [],
            map: []
        },
        "undead grundo shopkeeper": {
            id: 400175,
            image: "./images/png/monsters/400175_anundeadshopkeeper.png",
            level: 41,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|20|60|-20|7"],
            maxHitPotential: "m|60",
            drops: [],
            map: []
        },
        "undead guard captain": {
            id: 400176,
            image: "./images/png/monsters/400176_anundeadguardcaptain.png",
            level: 41,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|20|60|-30|7"],
            maxHitPotential: "m|60",
            drops: [],
            map: []
        },
        "undead council member": {
            id: 400177,
            image: "./images/png/monsters/400177_anundeadcouncilmember.png",
            level: 42,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|70|-30|6"],
            maxHitPotential: "m|70",
            drops: [],
            map: []
        },
        "undead guard commander": {
            id: 400178,
            image: "./images/png/monsters/400178_anundeadguardcommander.png",
            level: 42,
            heat: 50,
            cold: 50,
            stun: 50,
            powers: ["$MSPW_LIFETAP|P|15|70|-40|6"],
            maxHitPotential: "m|70",
            drops: [],
            map: []
        },
        "two rings knight": {
            id: 400180,
            image: "./images/png/monsters/400180_atworingsknight.png",
            level: 41,
            attack: 1,
            defence: 1,
            powers: [],
            drops: [],
            map: []
        },
        "two rings wizard": {
            id: 400181,
            image: "./images/png/monsters/400181_atworingswizard.png",
            level: 41,
            powers: ["$MSPW_FIREBLAST|P|20|100|20|8"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "two rings cavalier": {
            id: 400182,
            image: "./images/png/monsters/400182_atworingscavalier.png",
            level: 42,
            attack: 1,
            defence: 2,
            powers: [],
            drops: [],
            map: []
        },
        "two rings sorcerer": {
            id: 400183,
            image: "./images/png/monsters/400183_atworingssorcerer.png",
            level: 42,
            powers: ["$MSPW_ICEBLAST|P|20|100|20|8"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "two rings paladin": {
            id: 400184,
            image: "./images/png/monsters/400184_atworingspaladin.png",
            level: 43,
            attack: 2,
            defence: 2,
            damage: 1,
            powers: [],
            drops: [],
            map: []
        },
        "two rings warlock": {
            id: 400185,
            image: "./images/png/monsters/400185_atworingswarlock.png",
            level: 43,
            powers: ["$MSPW_FIRESTUN|P|20|80,1|20|8"],
            maxHitPotential: "80,m",
            drops: [],
            map: []
        },
        "two rings crusader": {
            id: 400186,
            image: "./images/png/monsters/400186_atworingscrusader.png",
            level: 44,
            attack: 2,
            defence: 2,
            damage: 2,
            powers: [],
            drops: [],
            map: []
        },
        "two rings archmagus": {
            id: 400187,
            image: "./images/png/monsters/400187_atworingsarchmagus.png",
            level: 44,
            powers: ["$MSPW_ICESTUN|P|20|80,1|20|8"],
            maxHitPotential: "80,m",
            drops: [],
            map: []
        },
        "palace guard": {
            id: 400188,
            image: "./images/png/monsters/400188_apalaceguard.png",
            level: 45,
            attack: 10,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: [],
            drops: [],
            map: []
        },
        "palace servant": {
            id: 400189,
            image: "./images/png/monsters/400189_apalaceservant.png",
            level: 45,
            attack: 5,
            defence: 2,
            damage: 1,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "palace guardian": {
            id: 400190,
            image: "./images/png/monsters/400190_apalaceguardian.png",
            level: 46,
            attack: 10,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "palace gardener": {
            id: 400191,
            image: "./images/png/monsters/400191_apalacegardener.png",
            level: 46,
            attack: 5,
            defence: 2,
            damage: 1,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "palace sentry": {
            id: 400192,
            image: "./images/png/monsters/400192_apalacesentry.png",
            level: 47,
            attack: 10,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: [],
            drops: [],
            map: []
        },
        "palace groundskeeper": {
            id: 400193,
            image: "./images/png/monsters/400193_apalacegroundskeeper.png",
            level: 47,
            attack: 5,
            defence: 2,
            damage: 1,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "palace captain": {
            id: 400194,
            image: "./images/png/monsters/400194_apalacecaptain.png",
            level: 48,
            attack: 10,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: [],
            drops: [],
            map: []
        },
        "palace clerk": {
            id: 400195,
            image: "./images/png/monsters/400195_apalaceclerk.png",
            level: 48,
            attack: 5,
            defence: 2,
            damage: 1,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "palace commander": {
            id: 400196,
            image: "./images/png/monsters/400196_apalacecommander.png",
            level: 49,
            attack: 10,
            defence: 3,
            damage: 3,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: [],
            drops: [],
            map: []
        },
        "palace major domo": {
            id: 400197,
            image: "./images/png/monsters/400197_apalacemajordomo.png",
            level: 49,
            attack: 5,
            defence: 2,
            damage: 2,
            heat: 30,
            cold: 30,
            stun: 30,
            powers: ["$MSPW_LIFETAP|P|20|100|0|10"],
            maxHitPotential: "m|100",
            drops: [],
            map: []
        },
        "mummy": {
            id: 4000821,
            image: "./images/png/monsters/4000821_amummy.png",
            level: 18,
            powers: ["$MSPW_LIFETAP|P|10|20|0|8"],
            maxHitPotential: "m|20",
            drops: [],
            map: []
        },
        "faleinn": {
            id: 400179,
            image: "./images/png/monsters/400179_DpvXh_Faleinn.png",
            level: 45,
            attack: 5,
            defence: 5,
            damage: 3,
            heat: 60,
            cold: 60,
            stun: 60,
            xp: 1500,
            np: { normal: 1500, evil: 1500, insane: 1500 },
            powers: ["$MSPW_STUNBLAST|P|40|70,3|0|5", "$MSPW_FIREBLAST|P|40|70|0|5", "$MSPW_ICEBLAST|P|40|70|0|5", "$MSPW_LIFETAP|P|40|90|0|5"],
            maxHitPotential: "70,m|70,m|70,m|90",
            drops: [
                ["The Key to the Two Rings", 1000]
            ],
            hpNormal: 500,
        },
        "jahbal": {
            id: 400198,
            image: "./images/png/monsters/400198_VRhlK_Jahbal.png",
            level: 50,
            attack: 10,
            defence: 5,
            damage: 5,
            heat: 50,
            cold: 50,
            stun: 50,
            xp: 5000,
            np: { normal: 5000, evil: 5000, insane: 5000 },
            powers: ["$MSPW_POISON|P|6|50,5|0|8", "$MSPW_STUNBLAST|P|6|70,3|0|8", "$MSPW_FIREBLAST|P|6|90|0|8", "$MSPW_ICEBLAST|P|6|90|0|8", "$MSPW_HEAL|P|6|A,150|0|10", "$MSPW_LIFETAP|P|6|100|0|8", "$MSPW_DISABLE|P|6|30,5|0|8"],
            maxHitPotential: "270,m|90,m|100,m|90",
            drops: [],
            hpNormal: 700,
        },
        "mastermind": {
            id: 400199,
            image: "./images/png/monsters/400199_GWcxJ_Mastermind.png",
            level: 50,
            attack: 10,
            defence: 5,
            damage: 10,
            heat: 60,
            cold: 60,
            stun: 60,
            xp: 7500,
            np: { normal: 7500, evil: 7500, insane: 7500 },
            powers: ["$MSPW_LIFEDRAIN|P|20|50,3|0|20", "$MSPW_FIREBLAST|P|5|120|0|15", "$MSPW_ICEBLAST|P|5|120|0|15"],
            maxHitPotential: "170",
            drops: [],
            hpNormal: 0,
            hpEvil: 1000
        },
        "xantan reborn": {
            id: 400200,
            image: "./images/png/monsters/400200_aeluC_XantanReborn.png",
            level: 50,
            attack: 10000,
            defence: -10000,
            fixeddamage: 50,
            maxHitPotential: "50",
            heat: 5,
            cold: 5,
            stun: 5,
            xp: 10000,
            np: { normal: 10000, evil: 10000, insane: 10000 },
            powers: [],
            drops: [],
            hpNormal: 0,
            hpEvil: 1000
        }
    },
    //https://images.neopets .com/nq/n/
    npcs: {
        "Eleus Batrin": {
            image: "./images/png/npcs/npc_eleus.png",
            mapImage: "",
            mapName: "world_crop_1",
            canGive: ["Gold Wand", "Steel Wand", "Bronze Wand", "Iron Wand", "Silver Wand",],
        },
        "Boraxis the Healer": {
            image: "./images/png/npcs/npc_boraxis.png",
            mapImage: "",
            canGive: [],
        },
        "Lummock Sendent": {
            image: "./images/png/npcs/npc_lummock.png",
            mapImage: "",
            canGive: ["Red Wand", "Blue Wand", "Yellow Wand", "Black Wand", "White Wand",],
        },
        "Morax Dorangis": {
            image: "./images/png/npcs/npc_morax.png",
            mapImage: "",
            canGive: ["Energy Shield", "Cloth Robe"],
        },
        "Choras Tillie": {
            image: "./images/png/npcs/npc_choras.png",
            mapImage: "",
            canGive: ["Mirrored Force Field", "Magic Robe"],
        },
        "Rikti": {
            image: "./images/png/npcs/npc_rikti.png",
            mapImage: "./images/png/tiles/npc_rikti.png",
            canGive: [],
        },
        "Margoreth": {
            image: "./images/png/npcs/npc_margoreth.png",
            mapImage: "./images/png/tiles/npc_margoreth.png",
            canGive: [],
        },
        "Tylix": {
            image: "./images/png/npcs/npc_tylix.png",
            mapImage: "./images/png/tiles/npc_tylix.png",
            canGive: [],
        },
        "Pomanna": {
            image: "./images/png/npcs/npc_pomanna.png",
            mapImage: "./images/png/tiles/npc_pomanna.png",
            canGive: [],
        },
        "Denethrir": {
            image: "./images/png/npcs/npc_denethrir.png",
            mapImage: "./images/png/tiles/npc_denethrir.png",
            canGive: ["Volcano Wand", "Glacier Wand", "Storm Wand", "Mountain Wand", "Nature Wand",],
        },
        "Korabric": {
            image: "./images/png/npcs/npc_korabric.png",
            mapImage: "./images/png/tiles/npc_korabric.png",
            canGive: [],
        },
        "Mokti": {
            image: "./images/png/npcs/npc_mokti.png",
            mapImage: "",
            canGive: ["Dawnshine Generator Shield"],
        },
        "Leirobas": {
            image: "./images/png/npcs/npc_leirobas.png",
            mapImage: "",
            canGive: ["Sorcerous Robe", "Blazing Jewel", "Chilling Jewel", "Stunning Jewel", "Radiant Jewel", "Growing Jewel",],
        },
        "Erick": {
            image: "./images/png/npcs/npc_erick.png",
            mapImage: "./images/png/tiles/npc_erick.png",
            canGive: ["Coruscating Gem", "Fire Staff", "Ice Staff", "Shock Staff", "Spectral Staff", "Life Staff",],
        },
        "A Note": {
            image: "./images/png/npcs/npc_note.png",
            mapImage: "",
            canGive: [],
        },
        "Mr Irgo": {
            image: "./images/png/npcs/npc_irgo.png",
            mapImage: "./images/png/tiles/npc_irgo.png",
            canGive: ["Energy Absorber", "Robe of Protection"],
        },
        "Gali Yoj": {
            image: "./images/png/npcs/npc_galiyoj.png",
            mapImage: "",
            canGive: ["Keladrian Medallion"],
        },
        "Faleinn": {
            image: "./images/png/npcs/npc_faleinn.png",
            mapImage: "",
            canGive: ["The Key to the Two Rings"],
        },
        "The Gatekeeper": {
            image: "./images/png/npcs/npc_gatekeeper.png",
            mapImage: "./images/png/tiles/npc_gatekeeper.png",
            canGive: [],
        },
    },
    items: {
        "glowing stone": {
            maxqty: 20,
            usedfor: "energy shield, cloth robe, mirrored force field, magic robe, gold wand, steel wand, bronze wand, iron wand, silver wand, volcano wand, glacier wand, storm wand, mountain wand, nature wand, blazing jewel, chilling jewel, stunning jewel, radiant jewel, growing jewel",
        },
        "chunk of metal": {
            maxqty: 1,
            usedfor: "energy shield",
        },
        "small yellow gem": {
            maxqty: 1,
            usedfor: "energy shield",
        },
        "plains lupe pelt": {
            maxqty: 1,
            usedfor: "cloth robe",
        },
        "blue thread": {
            maxqty: 1,
            usedfor: "magic robe",
        },
        "cave lupe pelt": {
            maxqty: 1,
            usedfor: "magic robe",
        },
        "tiny amber": {
            maxqty: 5,
            usedfor: "bronze wand, stunning jewel",
        },
        "tiny obsidian": {
            maxqty: 5,
            usedfor: "iron wand, radiant jewel",
        },
        "tiny beryl": {
            maxqty: 5,
            usedfor: "silver wand, growing jewel",
        },
        "corroded pyrite rod": {
            maxqty: 1,
            usedfor: "gold wand",
        },
        "corroded pewter rod": {
            maxqty: 1,
            usedfor: "steel wand",
        },
        "corroded copper rod": {
            maxqty: 1,
            usedfor: "bronze wand",
        },
        "corroded ore rod": {
            maxqty: 1,
            usedfor: "iron wand",
        },
        "corroded aluminum rod": {
            maxqty: 1,
            usedfor: "silver wand",
        },
        "grey lupe fang": {
            maxqty: 5,
            usedfor: "red wand, blue wand",
        },
        "black bearog paw": {
            maxqty: 5,
            usedfor: "red wand, black wand, white wand",
        },
        "grizzly bearog tooth": {
            maxqty: 5,
            usedfor: "red wand, yellow wand",
        },
        "dire lupe pelt": {
            maxqty: 5,
            usedfor: "blue wand, black wand",
        },
        "piece of smooth glass": {
            maxqty: 1,
            usedfor: "mirrored force field",
        },
        "lodestone": {
            maxqty: 1,
            usedfor: "mirrored force field",
        },
        "stretch of rotted cloth": {
            maxqty: 1,
            usedfor: "magic robe",
        },
        "armored stinger": {
            maxqty: 1,
            usedfor: "volcano wand",
        },
        "noils mane": {
            maxqty: 1,
            usedfor: "volcano wand",
        },
        "shamanistic totem": {
            maxqty: 1,
            usedfor: "glacier wand",
        },
        "skeith fang": {
            maxqty: 1,
            usedfor: "glacier wand",
        },
        "buzz wing": {
            maxqty: 1,
            usedfor: "storm wand",
        },
        "wadjet skin": {
            maxqty: 1,
            usedfor: "storm wand",
        },
        "scorpion carapace": {
            maxqty: 1,
            usedfor: "mountain wand",
        },
        "wooden shield": {
            maxqty: 1,
            usedfor: "mountain wand",
        },
        "jungle beast claw": {
            maxqty: 1,
            usedfor: "nature wand",
        },
        "noils tooth": {
            maxqty: 1,
            usedfor: "nature wand",
        },
        "jungle gauntlet": {
            maxqty: 1,
            usedfor: "volcano wand",
        },
        "jungle vambrace": {
            maxqty: 1,
            usedfor: "glacier wand",
        },
        "jungle breastplate": {
            maxqty: 1,
            usedfor: "storm wand",
        },
        "jungle helm": {
            maxqty: 1,
            usedfor: "mountain wand",
        },
        "jungle pauldrons": {
            maxqty: 1,
            usedfor: "nature wand",
        },
        "giant spider leg": {
            maxqty: 1,
            usedfor: "dawnshine generator shield",
        },
        "desert cobra fang": {
            maxqty: 1,
            usedfor: "dawnshine generator shield",
        },
        "sand iguana eye": {
            maxqty: 1,
            usedfor: "dawnshine generator shield",
        },
        "dust spider pincer": {
            maxqty: 1,
            usedfor: "dawnshine generator shield",
        },
        "drop of giant spider blood": {
            maxqty: 1,
            usedfor: "sorcerous robe",
        },
        "drop of desert cobra venom": {
            maxqty: 1,
            usedfor: "sorcerous robe",
        },
        "glob of dried iguana spit": {
            maxqty: 1,
            usedfor: "sorcerous robe",
        },
        "pinch of crystallized sand": {
            maxqty: 1,
            usedfor: "sorcerous robe",
        },
        "copper-plated key": {
            maxqty: 1,
            usedfor: "opens the first locked door inside Temple of Roo",
        },
        "bronze-plated key": {
            maxqty: 1,
            usedfor: "opens the second locked door inside Temple of Roo",
        },
        "silver-plated key": {
            maxqty: 1,
            usedfor: "opens the third locked door inside Temple of Roo",
        },
        "gold-plated key": {
            maxqty: 1,
            usedfor: "opens the fourth locked door inside Temple of Roo",
        },
        "platinum-plated key": {
            maxqty: 1,
            usedfor: "opens the fifth locked door inside Temple of Roo",
        },
        "crystalline key": {
            maxqty: 1,
            usedfor: "opens the sixth locked door inside Temple of Roo",
        },
        "ruby": {
            maxqty: 5,
            usedfor: "blazing jewel",
        },
        "sapphire": {
            maxqty: 5,
            usedfor: "chilling jewel",
        },
        "topaz": {
            maxqty: 5,
            usedfor: "stunning jewel",
        },
        "onyx": {
            maxqty: 5,
            usedfor: "radiant jewel",
        },
        "emerald": {
            maxqty: 5,
            usedfor: "growing jewel",
        },
        "carved oak staff": {
            maxqty: 5,
            usedfor: "fire staff, ice staff, shock staff, spectral staff, life staff",
        },
        "piece of living crystal": {
            maxqty: 1,
            usedfor: "Leirobas",
        },
        "piece of agate": {
            maxqty: 1,
            usedfor: "energy absorber",
        },
        "piece of chrysolite": {
            maxqty: 1,
            usedfor: "energy absorber",
        },
        "piece of serpentine": {
            maxqty: 1,
            usedfor: "energy absorber",
        },
        "drakonid eye": {
            maxqty: 1,
            usedfor: "robe of protection",
        },
        "drakonid hide": {
            maxqty: 1,
            usedfor: "robe of protection",
        },
        "drakonid heart": {
            maxqty: 1,
            usedfor: "robe of protection",
        },
        // "growing jewel": {
        //  maxqty: 1,
        //  usedfor: "",
        // },
        "energy shield": {
            itemtype: "armour",
            armour: "energy",
            points: 3,
            special: "none",
            materials: [],
        },
        "mirrored force field": {
            itemtype: "armour",
            armour: "energy",
            points: 6,
            special: "none",
        },
        "dawnshine generator shield": {
            itemtype: "armour",
            armour: "energy",
            points: 10,
            special: "2% chance to reflect a regular enemy attack",
        },
        "energy absorber": {
            itemtype: "armour",
            armour: "energy",
            points: 14,
            special: "5% chance for a regular enemy attack to heal you",
        },
        "evening sun energy shield": {
            itemtype: "armour",
            armour: "energy",
            points: 18,
            special: "15% chance to inflict 20 damage when a regular enemy attack damages you",
        },
        "cloth robe": {
            itemtype: "armour",
            armour: "magical",
            points: 3,
            special: "none",
        },
        "magic robe": {
            itemtype: "armour",
            armour: "magical",
            points: 6,
            special: "none",
        },
        "sorcerous robe": {
            itemtype: "armour",
            armour: "magical",
            points: 10,
            special: "increases your attack stat by 5% (which increases your chance to hit)",
        },
        "robe of protection": {
            itemtype: "armour",
            armour: "magical",
            points: 14,
            special: "10% chance for a regular enemy attack to do 0 damage",
        },
        "inferno robe": {
            itemtype: "armour",
            armour: "magical",
            points: 18,
            special: "adds 1-10 damage to your regular attack",
        },
        //weapons
        "white wand": {
            itemtype: "weapon",
            weapon: "life",
            points: 3,
            special: "",
        },
        "silver wand": {
            itemtype: "weapon",
            weapon: "life",
            points: 6,
            special: "",
        },
        "nature wand": {
            itemtype: "weapon",
            weapon: "life",
            points: 10,
            special: "6% chance each turn to heal 25 health",
        },
        "life staff": {
            itemtype: "weapon",
            weapon: "life",
            points: 15,
            special: "can cast Spirit of Growth: heals 100 health; 20 turn cooldown",
        },
        "moonstone staff": {
            itemtype: "weapon",
            weapon: "life",
            points: 20,
            special: "heals 4 health each turn and 10% chance each turn to heal 30 health",
        },
        "yellow wand": {
            itemtype: "weapon",
            weapon: "shock",
            points: 3,
            special: "",
        },
        "bronze wand": {
            itemtype: "weapon",
            weapon: "shock",
            points: 6,
            special: "",
        },
        "storm wand": {
            itemtype: "weapon",
            weapon: "shock",
            points: 10,
            special: "3% chance to stun an enemy for 1 turn",
        },
        "shock staff": {
            itemtype: "weapon",
            weapon: "shock",
            points: 15,
            special: "can cast Weakness: lowers an enemy's defence by 5 for 3 turns; 8 turn cooldown",
        },
        "thunderstar staff": {
            itemtype: "weapon",
            weapon: "shock",
            points: 20,
            special: "8% chance to stun an enemy for 2 turns",
        },
        "red wand": {
            itemtype: "weapon",
            weapon: "fire",
            points: 3,
            special: "",
        },
        "gold wand": {
            itemtype: "weapon",
            weapon: "fire",
            points: 6,
            special: "",
        },
        "volcano wand": {
            itemtype: "weapon",
            weapon: "fire",
            points: 10,
            special: "3% chance to add 20 fire damage to your normal attack",
        },
        "fire staff": {
            itemtype: "weapon",
            weapon: "fire",
            points: 15,
            special: "can cast Magma Blast: inflicts 40 fire damage; 10 turn cooldown",
        },
        "firedrop staff": {
            itemtype: "weapon",
            weapon: "fire",
            points: 20,
            heat: 10,
            special: "8% chance to inflict 30 fire damage for 2 turns when using a normal attack",
        },
        "blue wand": {
            itemtype: "weapon",
            weapon: "ice",
            points: 3,
            special: "",
        },
        "steel wand": {
            itemtype: "weapon",
            weapon: "ice",
            points: 6,
            special: "",
        },
        "glacier wand": {
            itemtype: "weapon",
            weapon: "ice",
            points: 10,
            special: "3% chance to add 20 ice damage to your normal attack",
        },
        "ice staff": {
            itemtype: "weapon",
            weapon: "ice",
            points: 15,
            special: "can cast Ice Shield: an enemy takes 10 damage when you are hit with a normal attack; 12 turn cooldown",
        },
        "iceheart staff": {
            itemtype: "weapon",
            weapon: "ice",
            points: 20,
            cold: 10,
            special: "can cast Ice Wind: on each turn, for the next 5 turns, 40% chance an enemy cannot move; 10 turn cooldown",
        },
        "black wand": {
            itemtype: "weapon",
            weapon: "spectral",
            points: 3,
            special: "",
        },
        "iron wand": {
            itemtype: "weapon",
            weapon: "spectral",
            points: 6,
            special: "",
        },
        "mountain wand": {
            itemtype: "weapon",
            weapon: "spectral",
            points: 10,
            special: "when you use a normal attack, 4% chance to activate Absorbing Stone: you can absorb up to 15 damage from an enemy's normal attack, when 15 damage is absorbed, the effect ends and may activate again",
        },
        "spectral staff": {
            itemtype: "weapon",
            weapon: "spectral",
            points: 15,
            special: "can cast Rage of Light: for 5 turns, you gain 3 attack and 3 defence; 10 turn cooldown",
        },
        "shadowgem staff": {
            itemtype: "weapon",
            weapon: "spectral",
            points: 20,
            special: "+3 defence bonus; can cast Elemental Resistance: for 4 turns, you gain 12 in these stats: heat, cold, and stun; 9 turn cooldown",
        },
        "weak healing potion": {
            maxqty: 30,
            heals: 10,
            dropLevelRange: [-2, 15]
        },
        "standard healing potion": {
            maxqty: 20,
            heals: 30,
            dropLevelRange: [5, 21]
        },
        "strong healing potion": {
            maxqty: 20,
            heals: 60,
            dropLevelRange: [16, 30]
        },
        "greater healing potion": {
            maxqty: 15,
            heals: 90,
            dropLevelRange: [22, 35]
        },
        "superior healing potion": {
            maxqty: 15,
            heals: 120,
            dropLevelRange: [31, 50]
        },
        "spirit healing potion": {
            maxqty: 10,
            heals: 150,
            dropLevelRange: [45, 50]
        },
    },
    skills: {
        s1001: {
            type: "fire",
            name: "Fire Weapons",
            desc: "May add fire damage to your attack. When not using a fire-type weapon, this damage is halved, rounded up.",
            prob: [3, 5, 7, 10, 14, 18, 23, 28, 33, 40],
            dmg: [2, 3, 3, 4, 5, 6, 6, 7, 8, 9],
            reduced: [1, 2, 2, 2, 3, 3, 3, 4, 4, 5]
        },
        s1002: {
            type: "fire",
            name: "Firepower",
            desc: "Increases fire damage for Fire Weapons and Fire Ball by a percentage. This skill has no effect on Wall of Flame.",
            dmg: [4, 8, 12, 16, 20, 24, 28, 32, 36, 40]
        },
        s1003: {
            type: "fire",
            name: "Fire Ball",
            desc: "Cast to inflict fire damage.",
            dmg: [4, 6, 8, 10, 13, 16, 20, 24, 28, 32],
            cd: [8, 7, 6, 6, 5, 5, 4, 4, 4, 4]
        },
        s1004: {
            type: "fire",
            name: "Wall of Flame",
            desc: "Enemies take fire damage when attacking.",
            dmg: [1, 2, 3, 4, 6, 8, 11, 14, 18, 22]
        },
        s2001: {
            type: "ice",
            name: "Ice Weapons",
            desc: "May add ice damage to your normal attack. When not using an ice-type weapon, this damage is halved, rounded up.",
            prob: [3, 5, 7, 10, 14, 18, 23, 28, 33, 40],
            dmg: [4, 5, 6, 7, 8, 9, 11, 12, 13, 14],
            reduced: [2, 3, 3, 4, 4, 5, 6, 6, 7, 7]
        },
        s2002: {
            type: "ice",
            name: "Heart of Ice",
            desc: "Your normal attack may freeze an enemy for 1 turn. The enemy cannot use its normal attack, but may use its abilities. When not using an ice-type weapon, this skill does nothing!",
            prob: [7, 10, 13, 15, 18, 20, 23, 25, 28, 30]
        },
        s2003: {
            type: "ice",
            name: "Snowball",
            desc: "Cast to inflict ice damage.",
            dmg: [5, 7, 10, 12, 16, 20, 26, 32, 38, 45],
            cd: [9, 8, 7, 6, 5, 5, 4, 4, 3, 3]
        },
        s2004: {
            type: "ice",
            name: "Glacier Strike",
            desc: "Cast to begin charging an ice attack for 3 turns. On the 3rd turn, you have a 60% at every level to inflict 3.7x your normal damage. If the attack fails, you do no damage. This skill is cancelled if you use your normal attack or become stunned. You may still use other skills or potions. A higher level in this skill does nothing!"
        },
        s3001: {
            type: "shock",
            name: "Shock Weapons",
            desc: "Your regular attack has a chance to stun an enemy for 1 turn. The enemy may resist. If not using a shock-type weapon, this probability is halved, rounded up.",
            prob: [5, 8, 9, 11, 12, 13, 14, 16, 17, 19],
            reduced: [3, 4, 5, 6, 6, 7, 7, 8, 9, 10]
        },
        s3002: {
            type: "shock",
            name: "Disable",
            desc: "Your regular attack has a chance lower an enemy's defence by a set amount. The defence reduction lasts for your next two attacks. The monster's defence cannot be lower than 0.",
            prob: [8, 15, 16, 18, 19, 21, 22, 24, 25, 27],
            def: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            rounds: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
        },
        s3003: {
            type: "shock",
            name: "Fortitude",
            desc: "Increases resistance to enemy special attacks (fire, ice, poison, stun, lifetap).",
            resist: [2, 3, 4, 6, 7, 9, 10, 12, 13, 15]
        },
        s3004: {
            type: "shock",
            name: "Shockwave",
            desc: "Your regular attack has a chance to add extra damage or may stun for 1 turn or both.",
            prob: [7, 12, 15, 17, 20, 22, 25, 27, 28, 30],
            dmg: [6, 9, 11, 13, 14, 16, 18, 19, 20, 22],
            rounds: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        },
        s4001: {
            type: "spectral",
            name: "Spectral Weapons",
            desc: "Increases your defence, which decreases an enemy's chance to hit you with its normal attack. When not using a Spectral weapon, this defence bonus is reduced to 40% of its normal value, rounded up.",
            def: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            reduced: [1, 1, 2, 2, 2, 3, 3, 4, 4, 4]
        },
        s4002: {
            type: "spectral",
            name: "Evasion",
            desc: "May evade an enemy's normal attack.",
            prob: [8, 10, 13, 15, 18, 20, 23, 25, 28, 30]
        },
        s4003: {
            type: "spectral",
            name: "Absorption",
            desc: "Cast to attempt to absorb an enemy's next normal attack, restoring some health.",
            absorb: [20, 23, 26, 29, 31, 33, 35, 37, 39, 40],
            cd: [8, 8, 8, 8, 7, 7, 7, 7, 6, 6]
        },
        s4004: {
            type: "spectral",
            name: "Reflex",
            desc: "May cause an enemy's normal attack to damage itself for the amount you would have been damaged for. You will take no damage from its normal attack when this activates.",
            prob: [3, 5, 6, 8, 9, 10, 11, 12, 13, 14]
        },
        s5001: {
            type: "life",
            name: "Life Weapons",
            desc: "Potions restore 1 more health for each point in this skill. If you do not level up this skill at all, there is a 5% chance to restore 1 HP each time you move 1 tile. Higher levels in this skill increase these values. If you level up this skill, when not using a life-type weapon, this probability is reduced to 2/3 its normal value, rounded up, and the healing value is halved, rounded up.",
            prob: [8, 10, 13, 15, 18, 20, 22, 23, 24, 25],
            heal: [1, 1, 1, 1, 2, 2, 2, 2, 3, 3],
            potionBonus: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            reducedProb: [6, 7, 9, 10, 12, 14, 15, 16, 16, 17],
            reducedHeal: [1, 1, 1, 1, 1, 1, 1, 1, 2, 2]
        },
        s5002: {
            type: "life",
            name: "Field Medic",
            desc: "May restore health in battle (\"You regenerate ... health.\")",
            heal: [1, 1, 2, 2, 2, 3, 3, 4, 4, 4],
            prob: [10, 13, 15, 18, 20, 23, 25, 28, 30, 33]
        },
        s5003: {
            type: "life",
            name: "Lifesteal",
            desc: "65% chance at every level to restore between 1 and [the skill's level] HP when you damage an enemy with a normal attack (\"You lifesteal ... health.\") Lifesteal does not inflict additional damage.",
            maxHeal: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            prob: [65, 65, 65, 65, 65, 65, 65, 65, 65, 65]
        },
        s5004: {
            type: "life",
            name: "Resurrection",
            desc: "If you are defeated, you may be restored to life to 50% health.",
            prob: [20, 40, 45, 50, 55, 60, 65, 70, 75, 80]
        }
    }
};

Object.entries(gameObjects.items).filter(item => item[1].hasOwnProperty("maxqty")).forEach(item => {
    gameObjects.items[item[0]].droppedby = [];
    const whoDropsThisItem = Object.entries(gameObjects.monsters).filter(monster => monster[1].drops.map(drop => drop[0]).includes(item[0]));
    whoDropsThisItem.forEach(monster => {
        const dropChance = monster[1].drops.find(drop => drop[0] === item[0])[1];
        gameObjects.items[item[0]].droppedby.push([monster[0], dropChance]);
    });
});

const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const mainGameWnd = document.querySelector("div.contentModule.phpGamesPortalView") ?? document.querySelector("div.contentModule.phpGamesNonPortalView");

const gameFunc = {
    mobHp: function (oMob) {
        let mobHp = {
            normal: {},
            evil: {}
        };
        if (!oMob.hp) { //if not a boss
            const monsterHPBase = oMob.level * 5 + 5;
            mobHp.normal.min = monsterHPBase + Math.round(Math.ceil(monsterHPBase / 10) * -1);
            mobHp.normal.max = monsterHPBase + Math.round(Math.ceil(monsterHPBase / 10) * 1);
            mobHp.evil.min = Math.floor(mobHp.normal.min * 1.5);
            mobHp.evil.max = Math.floor(mobHp.normal.max * 1.5);
        }
        else {
            mobHp.normal.min = oMob.hp;
            mobHp.normal.max = oMob.hp;
            mobHp.evil.min = Math.floor(oMob.hp * 1.2);
            mobHp.evil.max = Math.floor(oMob.hp * 1.2);
        }
        return mobHp;
    },
    mobMeleeDmg: function (oMob) {
        let dmg = {
            normal: {},
            evil: {}
        };
        dmg.normal.min = clamp(Math.ceil(0.2 * oMob.damage), 0, 100000);
        dmg.normal.max = clamp(Math.ceil(1.2 * oMob.damage), 0, 100000);
        dmg.evil.min = clamp(Math.ceil(0.3 * oMob.damage), 0, 100000);
        dmg.evil.max = clamp(Math.ceil(1.3 * oMob.damage), 0, 100000);
        if (oMob.fixeddamage) {
            dmg.normal.min = oMob.fixeddamage;
            dmg.normal.max = oMob.fixeddamage;
            dmg.evil.min = oMob.fixeddamage;
            dmg.evil.max = oMob.fixeddamage;
        }
        return dmg;
    },
    mobMeleeAcc: function (oMob, oPet) {
        const baseHitChance = 45;
        let modHitChance = 0;
        const levelDiff = oPet.level - oMob.level;
        if (levelDiff > 0) {
            modHitChance -= Math.abs(levelDiff * 2);
        }
        else if (levelDiff < 0) {
            modHitChance += Math.abs(levelDiff * 5) + 5;
        }
        const strikeDiff = oMob.attack - oPet.defence;
        if (strikeDiff > 0) {
            modHitChance += Math.abs(strikeDiff * 5);
        }
        else if (strikeDiff < 0) {
            modHitChance -= Math.abs(strikeDiff * 1);
        }
        const finalAccuracy = clamp(baseHitChance + modHitChance, 15, 95);
        return finalAccuracy;
    },
    petMeleeAcc: function (oPet, oMob) {
        const baseHitChance = 60;
        let modHitChance = 0;
        const levelDiff = oPet.level - oMob.level;
        if (levelDiff > 0) {
            modHitChance += Math.abs(levelDiff * 2);
        }
        else if (levelDiff < 0) {
            modHitChance -= Math.abs(levelDiff * 10) + 5;
        }
        const strikeDiff = oPet.attack - oMob.defence;
        if (strikeDiff > 0) {
            modHitChance += Math.abs(strikeDiff * 1);
        }
        else if (strikeDiff < 0) {
            modHitChance -= Math.abs(strikeDiff * 5);
        }
        // console.log(baseHitChance, modHitChance);
        const finalAccuracy = clamp(baseHitChance + modHitChance, 5, 95);
        return finalAccuracy;
    },
    petMeleeDmg: function (oPet) {
        let dmg = {};
        const damageBase = oPet.damage + Math.round((oPet.level - 1) / 3);
        dmg.min = clamp(Math.ceil(0.6 * damageBase), 0, 100000);
        dmg.max = clamp(Math.ceil(1.6 * damageBase), 0, 100000);
        return dmg;
    },
    potionDropChance: function (monsterLevel, potionMinLevel, potionMaxLevel, potionName, baseChance, hasItemQty) {
        let dropChance = {
            base: 0,
            reduced: 0
        };
        if (monsterLevel >= potionMinLevel && monsterLevel <= potionMaxLevel) {
            dropChance.base = clamp((((monsterLevel - (potionMinLevel - 1)) * 80) + baseChance), 0, 700);
            const maxItemQty = gameObjects.items[potionName.toLowerCase() + " healing potion"].maxqty;
            if (hasItemQty / maxItemQty === 1) {
                dropChance.reduced = 0;
                dropChance.useReduced = true;
            }
            else if (hasItemQty / maxItemQty > 0.5) {
                dropChance.reduced = Math.max(dropChance.base - (Math.ceil(((hasItemQty / maxItemQty) - 0.5) * 100) * 12), 0);
                dropChance.useReduced = true;
            }
        }
        return dropChance;
    },
    firepowerMod: function () {
        firepowerMod = 1 + (gameSkills.fire[1][oPetSkills.fire[1]] / 100);
    }
};

function addBlurb(textContent, color) {
    if (textContent !== "") {
        const txt = document.createElement("span");
        const txt1 = document.createElement("span");
        const txt2 = document.createElement("span");
        txt1.textContent = textContent.split(":: ")[0] + (textContent.split(":: ").length > 1 ? ": " : "");
        txt1.style.color = color ?? "";
        txt2.textContent = textContent.split(":: ")[1];
        txt.append(txt1);
        txt.append(txt2);
        nqInfo.append(txt);
    }
    nqInfo.append(document.createElement("br"));
}

let oPetSkills = {};
if (document.URL.includes("action=skill")) {
    const levelUpSkills = [
        5001, 5002, 5003, 3001, 3002, 3003, 3004, 4001, 4002, 4003,
        4004, 3001, 3002, 3003, 3004, 4001, 4002, 4003, 4004, 3001,
        3002, 3003, 3004, 4001, 4002, 4003, 4004, 3001, 3002, 3003,
        3004, 4001, 4002, 4003, 4004, 3001, 3002, 3003, 3004, 3001,
        3002, 3003, 3004, 3001, 3002, 3003, 3004, 3001, 3002, 3003,
        3004, 3001, 3002, 3003, 3004, 3001,
    ];
    const currentLevel = parseInt(mainGameWnd.querySelectorAll("b")[2].textContent);
    const levelUpSelection = mainGameWnd.querySelector("a[href*='neoquest.phtml?skill_choice=" + levelUpSkills[currentLevel + 5] + "&action=skill']");
    const levelUpConfirm = mainGameWnd.querySelector("a[href*='neoquest.phtml?action=skill&skill_choice=" + levelUpSkills[currentLevel + 5] + "&confirm=1']");
    if (levelUpSelection) levelUpSelection.style.backgroundColor = "yellow";

    document.querySelectorAll("a[onclick*='nq_skills.phtml#']").forEach(el => {
        const skillId = parseInt(el.onclick.toString().split("nq_skills.phtml#")[1].split("'")[0]);
        if (skillId > 5) {
            skillLevel = parseInt(el.parentElement.nextElementSibling.textContent);
            oPetSkills["s" + skillId] = (isNaN(skillLevel) ? 0 : skillLevel);
        }
    });
    console.log("NQ Helper on skills page", oPetSkills, levelUpConfirm);
    GM_setValue("oPetSkills", JSON.stringify(oPetSkills));
}
oPetSkills = JSON.parse(GM_getValue("oPetSkills", "{}"));
function getPetSkillAttr(skillId, strAttr) {
    const skillLevel = oPetSkills["s" + skillId];
    if (!strAttr) {
        return skillLevel;
    } else {
        return gameObjects.skills["s" + skillId][strAttr][skillLevel - 1];
    }
}
function getMonsterLoot(name) {
    gameObjects.monsters[name].drops.forEach(drop => {
        addBlurb(drop[0] + ":: " + drop[1] / 10 + "%", "darkgoldenrod");
    });
}
function objectifyMobPowers(aMobPowerStr) {
    let aMobPowers = [];
    aMobPowerStr.forEach(powerStr => {
        const powerParams = powerStr.split("|");
        const oPower = {};
        oPower.id = powerParams[0]; //the id of the power in the code
        oPower.type = powerParams[1]; //P = useable power
        oPower.prob = parseInt(powerParams[2]); //the probability the mob uses the power
        //if the id is lifetap or heal, the prob is 0 if the mob is higher than 80% hp and doubled if lower than 20% hp
        oPower.attr = powerParams[3].split(","); //attributes of the power
        oPower.resist = parseInt(powerParams[4]); //a lower number means the skill is less likely to be resisted
        //resist is added to the PET's resistance. usually it's 0 or negative (to lower the pet's resistance)
        oPower.cooldown = parseInt(powerParams[5]); //how many turns the mob has to wait to use the power again
        oPower.attr = oPower.attr.map(s => isNaN(parseInt(s)) ? s : parseInt(s));
        oPower.txt = "(" + oPower.prob + "%) ";
        if (oPower.id === "$MSPW_POISON") {
            oPower.name = "Poison";
            oPower.poisonDamage = oPower.attr[0];
            oPower.poisonDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": inflicts " + oPower.poisonDamage + " damage for " + oPower.poisonDuration + (oPower.poisonDuration > 1 ? " turns" : " turn");
        }
        else if (oPower.id === "$MSPW_STUN") {
            oPower.name = "Stun";
            oPower.stunDuration = oPower.attr[0];
            oPower.txt += oPower.name + ": stuns for " + oPower.stunDuration + (oPower.stunDuration > 1 ? " turns" : " turn");
        }
        else if (oPower.id === "$MSPW_STUNBLAST") {
            oPower.name = "Stunblast";
            oPower.damage = oPower.attr[0];
            oPower.stunDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": stuns for " + oPower.stunDuration + (oPower.stunDuration > 1 ? " turns" : " turn") + " and inflicts " + oPower.damage + " damage";
        }
        else if (oPower.id === "$MSPW_FIREBLAST") {
            oPower.name = "Fireblast";
            oPower.damage = oPower.attr[0];
            oPower.txt += oPower.name + ": inflicts " + oPower.damage + " fire damage";
        }
        else if (oPower.id === "$MSPW_ICEBLAST") {
            oPower.name = "Iceblast";
            oPower.damage = oPower.attr[0];
            oPower.txt += oPower.name + ": inflicts " + oPower.damage + " ice damage";
        }
        else if (oPower.id === "$MSPW_HEAL") {
            oPower.name = "Heal";
            oPower.healtype = oPower.attr[0]; //P for %, A for absolute, however, mobs only use P
            oPower.heal = oPower.attr[1];
            oPower.txt += oPower.name + ": heals for " + oPower.heal + (oPower.healtype === "P" ? "% of max health" : "");
        }
        else if (oPower.id === "$MSPW_FIRESTUN") {
            oPower.name = "Firestun";
            oPower.damage = oPower.attr[0];
            oPower.stunDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": stuns for " + oPower.stunDuration + (oPower.stunDuration > 1 ? " turns" : " turn") + " and inflicts " + oPower.damage + " fire damage";
        }
        else if (oPower.id === "$MSPW_ICESTUN") {
            oPower.name = "Icestun";
            oPower.damage = oPower.attr[0];
            oPower.stunDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": stuns for " + oPower.stunDuration + (oPower.stunDuration > 1 ? " turns" : " turn") + " and inflicts " + oPower.damage + " ice damage";
        }
        else if (oPower.id === "$MSPW_LIFETAP") {
            //lifetap damage is resisted with pet's stun stat
            oPower.name = "Lifetap";
            oPower.damage = oPower.attr[0];
            oPower.txt += oPower.name + ": inflicts " + oPower.damage + " damage and heals the user for the same amount";
        }
        else if (oPower.id === "$MSPW_LIFEDRAIN") {
            //like lifetap but no resist and repeats over x turns
            //only mastermind uses this
            oPower.name = "Lifedrain";
            oPower.damage = oPower.attr[0];
            oPower.drainDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": for " + oPower.duration + (oPower.duration > 1 ? " turns" : " turn") + ", inflicts " + oPower.damage + " damage and heals the user for the same amount";
        }
        else if (oPower.id === "$MSPW_DISABLE") {
            oPower.name = "Disable";
            oPower.reduction = oPower.attr[0];
            oPower.disableDuration = oPower.attr[1];
            oPower.txt += oPower.name + ": reduces defence by for " + oPower.reduction + " for " + oPower.duration + (oPower.duration > 1 ? " turns" : " turn")
        }
        oPower.txt += " (" + oPower.cooldown + " turn cooldown)" + "\n";
        aMobPowers.push(oPower);
    });
    return aMobPowers;
}
function textualizeMobPowers(aMobPowers) {
    console.log(aMobPowers);
    let mobPowersToText = "\n";
    aMobPowers.forEach(power => {
        mobPowersToText += power.txt;
    });
    return (mobPowersToText === "\n" ? "none" : mobPowersToText);
}

function calcMaxPotentialDmg(maxHitPotentialStr, maxMeleeHit) {
    let arr = maxHitPotentialStr.split(",");
    let total = 0;
    arr.forEach(str => {
        if (str.includes("m|")) { total += Math.max(parseInt(str.split("|")[1]), maxMeleeHit); }
        else if (str.includes("m+")) { total += maxMeleeHit + parseInt(str.split("+")[1]); }
        else if (str === "m") { total += maxMeleeHit; }
        else if (!str.includes("m")) { total += parseInt(str); }
    });
    return total;
    // aMobPowers, maxMeleeHit
    // aMobPowers = aMobPowers.filter(oPower => oPower.hasOwnProperty("damage") || oPower.hasOwnProperty("stunDuration"));
    // let totalDamagePotential = maxMeleeHit;
    // let maxPowerDamage = 0;
    // maxPowerDamage = aMobPowers.reduce((a,b)=>Math.max(a.damage, b.damage));
    // let maxSingleTurnDmg = Math.max(maxPowerDamage, maxMeleeHit);
    //   aMobPowers.map(power => {
    // 	if(power.stunDuration && !power.damage){atkStr = maxSingleTurnDmg+","+maxSingleTurnDmg;}
    // 	else if(power.stunDuration && power.stunDuration===1 && power.damage){atkStr}
    //   });
    //   console.log(aMobPowers, maxPowerDamage);
    //   aMobPowers.forEach(power => {
    // if(power.stunDuration) totalDamagePotential += power.damage;
    // aMobPowers.filter(oPower => oPower.hasOwnProperty("poisonDamage")).forEach(oPower=>totalDamagePotential+=oPower.poisonDamage);
    //   return totalDamagePotential;
}

function makeColoredChildren(parent, color) {
    for (child of parent.children) {
        child.style.backgroundColor = color;
    }
}

let defaultActionKeysStr = " (Press ";
defaultActionKeys.forEach(str => defaultActionKeysStr += str.replace("Key", "") + " | ");
defaultActionKeysStr = (defaultActionKeysStr + ")").replace(" | )", ")");
let defaultActionElement;
if (!mainGameWnd && !document.querySelector("p.loader__items-paragraph")) location.href = "https://www.neopets.com/games/neoquest/neoquest.phtml";
const nqInfo = document.createElement("td");
nqInfo.style.whiteSpace = "pre-wrap";
nqInfo.style.textAlign = "left";
nqInfo.setAttribute("colspan", 2);
let gameMode = mainGameWnd.querySelectorAll("b")[5].textContent.toLowerCase();
if (gameMode === "evil!") gameMode = "evil";
let isABossFight = false;


if (mainGameWnd.querySelectorAll("a").length !== 0) {
    //we are in a fight or the map or talking to an npc
    let gameLinks = mainGameWnd.querySelectorAll("table")[0].querySelectorAll("a");
    if (gameLinks.length === 0) { //talking to npc
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('give')) {
            const giveItemTable = mainGameWnd.querySelector("tbody");
            const npcId = parseInt(urlParams.get('target'));
            const colors = ["steelblue", "green"];
            let itemsToGive = {};
            const div = document.createElement("div");
            div.style.whiteSpace = "pre-wrap";
            mainGameWnd.querySelector("table").parentNode.insertBefore(div, mainGameWnd.querySelector("table"));

            if (npcId === 90010003) { //Morax Dorangis
                itemsToGive["energy shield"] = ["glowing stone", "chunk of metal", "small yellow gem"];
                itemsToGive["cloth robe"] = ["glowing stone", "blue thread", "plains lupe pelt"];
            }
            else if (npcId === 90010005) { //Choras Tillie
                itemsToGive["mirrored force field"] = ["glowing stone", "tiny obsidian", "lodestone", "piece of smooth glass"];
                itemsToGive["magic robe"] = ["glowing stone", "tiny obsidian", "cave lupe pelt", "stretch of rotted cloth"];
            }
            else if (npcId === 90030001) { //Denethrir
                itemsToGive["nature wand"] = ["glowing stone", "jungle beast claw", "noil's tooth", "jungle pauldrons", "the Staff of Ni-tas"];
            }
            else if (npcId === 90010007) { //Leirobas
                itemsToGive["sorcerous robe"] = ["drop of giant spider blood", "drop of desert cobra venom", "glob of dried iguana spit", "pinch of crystallized sand"];
                itemsToGive["growing jewel"] = ["glowing stone", "tiny beryl", "emerald"];
            }
            else if (npcId === 90010006) { //Mokti
                itemsToGive["dawnshine generator shield"] = ["giant spider leg", "dust spider pincer", "desert cobra fang", "sand iguana eye"];
            }
            else if (npcId === 90050001) { //Erick
                itemsToGive["coruscating gem"] = ["clouded gem"];
                itemsToGive["life staff"] = ["the Coruscating Gem", "the Growing Jewel", "carved oak staff"];
            }
            else if (npcId === 90070001) { //Mr. Irgo
                itemsToGive["energy absorber"] = ["piece of agate", "piece of chrysolite", "piece of serpentine"];
                itemsToGive["robe of protection"] = ["drakonid eye", "drakonid heart", "drakonid hide"];
            }
            else if (npcId === 90010008) { //Gali Yoj
                itemsToGive["Keladrian Medallion"] = ["rusty medallion"];
            }

            Object.entries(itemsToGive).forEach((itemList, index) => {
                console.log(Object.entries(itemsToGive).length);
                div.textContent += itemList[0] + " items are in " + colors[index] + ": " + itemList[1].join(", ") + "\n\n";
                giveItemTable.querySelectorAll("tr").forEach(row => {
                    if (itemList[1].includes(row.children[0].textContent)) {
                        makeColoredChildren(row, colors[index]);
                        if (Object.entries(itemsToGive).length === 1) {
                            row.children[2].querySelector("input").checked = true;
                        }
                    }
                });
            });
        }
        else { //initiate give

        }
    }
    else if (gameLinks[0].textContent === "Options") {
        //we are in the overworld/map

        const nqNav = mainGameWnd.querySelectorAll("table")[2].querySelector("tbody");
        const currentMapName = nqNav.querySelectorAll("td")[1].textContent.split("You are in ")[1].split(".")[0];
        // const mapTiles = mainGameWnd.querySelector('table td').querySelectorAll('img:not([src*="brd_"])');

        const objectives = [
            { level: 1, next: "Train to level 2 east of city" },
            { level: 2, next: "Train to level 3 east of city" },
            { level: 3, next: "Train to level 4 east of city" },
            { level: 4, next: "Train to level 5 west of city" },
            { level: 4, next: "Collect 5 glowing stones" },
            { level: 5, next: "Train to level 6 hills northwest of city" },
            { level: 5, next: "Collect 5 glowing stones" },
            { level: 6, next: "Do you have 5 glowing stones?" },
            { level: 6, next: "Create armor @ southwest city tile" },
            { level: 7, next: "Enter cave northwest of city" },
            { level: 7, next: "Navigate to cave level 2" },
            { level: 7, next: "In cave level 2, train to level 8 by ramp to level 1" },
            { level: 8, next: "Train to level 9 at Dank Cave 2 near stairs to Dank Cave 3" },
            { level: 9, next: "Train to level 10 at Dank Cave 3 near the vertical hallway with the pillars" },
            { level: 10, next: "Train to level 11 at Dank Cave 4 near the start of the maze" },
            { level: 11, next: "Train to level 12 at Dank Cave 4 near Xantan" },
            { level: 12, next: "Train to level 13 at Dank Cave 4 near Xantan" },
            { level: 13, next: "Defeat Xantan the Foul" },
            { level: 13, next: "Create and equip the Iron Wand at Eleus Batrin (center city tile)" },
            { level: 13, next: "Create and equip one of the armour items at Choras Tillie (southeast city tile)" },
            { level: 13, next: "Go to the Jungle Ruins (south of city). You are on the base level. Take the northeastern stairs down" },
            { level: 13, next: "Train to level 14 at Jungle Ruins dungeon 1 near stairs" },
            { level: 14, next: "Train to level 15 at Jungle Ruins dungeon 1 horizontal hallway before beds" },
            { level: 15, next: "Train to level 16 at Jungle Ruins dungeon 1 vertical hallway near beds" },
            { level: 16, next: "Train to level 17 at Jungle Ruins dungeon 1 horizontal hallway after beds" },
            { level: 17, next: "Train to level 18 at Jungle Ruins dungeon 1 water and grass area before Kreai" },
            { level: 17, next: "Check to be sure you have a jungle beast claw, noil's tooth, and jungle pauldrons. If not refer to the Guide" },
            { level: 18, next: "Defeat Kreai, exit through the portal, continue downstairs." },
            { level: 18, next: "Train to level 19 at Jungle Ruins dungeon 2 hallway near top of map" },
            { level: 19, next: "Train to level 20 at Jungle Ruins dungeon 2 in front of portal maze" },
            { level: 19, next: "Go through the portal maze to reach Jungle Ruins Gors' Garden" },
            { level: 20, next: "Train to level 21 at Jungle Ruins Gors' Garden horizontal hallway before grassy area" },
            { level: 21, next: "Train to level 22 at Jungle Ruins Gors' Garden grassy area" },
            { level: 22, next: "Train to level 23 at Jungle Ruins Gors' Garden grassy area" },
            { level: 23, next: "Defeat Gors the Mighty, exit through the portal." },
            { level: 23, next: "Go up the stairs 2 tiles north. Go up the stairs 3 tiles west. Go up again to tower level 1." },
            { level: 23, next: "Create and equip the Nature wand at Denethrir in Jungle Ruins tower 1" },
            { level: 23, next: "Leave the Jungle ruins by returning to the base level; there is a patch of grass that acts as an exit. Go west of Neopia City. Pass through the swamp." },
            { level: 23, next: "Go south to the desert. Collect materials for an armour item. You need to move around the desert. Craft the armour in Swamp Edge City (southwestern area of swamp)." },
            { level: 23, next: "Find a carved oak staff at Southern Plains of Roo, the grasslands southeast of the desert and hills, from the various plains grarrls." },
            { level: 23, next: "Return to the Jungle Ruins base level, go down to dungeon 1 then 2 then 3" },
            { level: 23, next: "Train to level 24 in Jungle Ruins dungeon 3, NW area of map" },
            { level: 24, next: "You may have leveled up. Refer to Guide for previous steps." },
            { level: 24, next: "Train to level 25 at Jungle Ruins dungeon 3 northeastern area of map" },
            { level: 25, next: "Train to level 26 at Jungle Ruins dungeon 3 south of lake" },
            { level: 26, next: "Train to level 27 at Jungle Ruins dungeon 3 around Pomanna" },
            { level: 27, next: "Train to level 28 at Jungle Ruins dungeon 3 north of lake" },
            { level: 28, next: "Defeat Rollay Scaleback. Exit through the portal" },
            { level: 28, next: "Return to the Desert, enter the Temple of Roo through the cave, sneak through the trees" },
            { level: 28, next: "Train to level 29 at Temple of Roo western area of map after trees" },
            { level: 29, next: "Train to level 30 at Temple of Roo western area of map after trees" },
            { level: 30, next: "Take the ramp to the next level. On this level you must find the keys in order. Refer to the Guide's maps." },
            { level: 30, next: "Find an emerald (all monsters drop this)" },
            { level: 30, next: "Find the copper-plated key in Temple of Roo, room 1" },
            { level: 30, next: "Find the bronze-plated key in Temple of Roo, room 2" },
            { level: 30, next: "Find the silver-plated key in Temple of Roo, room 3" },
            { level: 30, next: "Train to level 31 at Temple of Roo, room 3" },
            { level: 31, next: "Train to level 32 at Temple of Roo, room 3" },
            { level: 32, next: "Find the gold-plated key in Temple of Roo, room 4" },
            { level: 32, next: "Train to level 33 at Temple of Roo, room 5" },
            { level: 33, next: "Find the platinum-plated key in Temple of Roo, room 5" },
            { level: 33, next: "Find the crystalline key in Temple of Roo, room 6" },
            { level: 33, next: "Train to level 34 at Temple of Roo, room 7" },
            { level: 34, next: "Defeat Archmagus of Roo. Enter the portal" },
            { level: 34, next: "Return to Swamp Edge City then give Leirobas the glowing stone, tiny beryl, emerald for the Growing jewel" },
            { level: 34, next: "Return to Temple of Roo, speak to Erick near entrance, give the clouded gem for the Coruscating gem, then create the Life staff with the coruscating gem, growing jewel, carved oak staff" },
            { level: 34, next: "Find armour materials and give them to Mr. Irgo, refer to the Guide" },
            { level: 34, next: "Train to level 35" },
            { level: 35, next: "Train to level 36 at cave 3 around the sand near the entrance" },
            { level: 36, next: "Train to level 37 at cave 3 around the sand near the entrance" },
            { level: 37, next: "Exit cave 3 to Sunny Town. In Sunny Town, give the rusty medallion to Gali Yoj to receive the Keladrian Medallion" },
            { level: 37, next: "Train to level 38 at cave 3 around the exit to Sunny Town" },
            { level: 38, next: "Train to level 39 at cave 5, gateway to the Mountain Fortress (the grey tiles)" },
            { level: 39, next: "Find and equip an Inferno Robe in the Mountain Fortress" },
            { level: 39, next: "Train to level 40 at Mountain Fortress in the hallway" },
            { level: 40, next: "Train to level 41 at Mountain Fortress in the life guardian's area" },
            { level: 41, next: "Defeat the Guardian of Life Magic and equip the Moonstone staff" },
            { level: 41, next: "Train to level 42 at Mountain Fortress in the life guardian's area" },
            { level: 42, next: "Defeat each guardian" },
            { level: 42, next: "Train to level 43 at Mountain Fortress in the life guardian's area" },
            { level: 43, next: "Make your way to Faleinn's room in Kal Panning" },
            { level: 43, next: "Train to level 44 at Kal Panning in Faleinn's room" },
            { level: 44, next: "Train to level 45 at Kal Panning in Faleinn's room" },
            { level: 45, next: "Defeat Faleinn with the \"Show the Keladrian Medallion to Faleinn\" option during the fight" },
            { level: 45, next: "Exit Kal Panning, go back to the cave south of the mountains, and pass through the doors and exit the cave" },
            { level: 45, next: "Train to level 46 in the Two Rings Hills outside the palace" },
            { level: 46, next: "Train to level 47 at Palace of the Two Rings, Level 1 near the entrance" },
            { level: 47, next: "Train to level 48 at Palace of the Two Rings, Level 1 near the entrance" },
            { level: 48, next: "Train to level 49 at Palace of the Two Rings, Level 1 near the stairs to level 2" },
            { level: 49, next: "Train to level 50 at Palace of the Two Rings, Level 2" },
            { level: 50, next: "Defeat the final boss(es)" },
        ];
        const currentPlayerLevel = parseInt(mainGameWnd.querySelectorAll("b")[2].textContent);
        const currentObjectives = objectives.filter(obj => obj.level === currentPlayerLevel);
        const objectiveContainer = document.createElement("td");
        const objectiveList = document.createElement("ol");
        objectiveList.style.paddingLeft = "10px";
        objectiveContainer.style.textAlign = "center";
        nqNav.append(objectiveContainer);
        objectiveContainer.append(document.createTextNode("Objectives:"));
        objectiveContainer.append(objectiveList);
        currentObjectives.forEach(objective => {
            const e = document.createElement("li");
            e.textContent = objective.next;
            objectiveList.append(e);
        });

        defaultActionElement = "move";
        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "KeyF":
                case "Space":
                    event.preventDefault();
                    //move without moving (you stay on the same tile) so you can hunt mobs/train
                    location.href = "https://www.neopets.com/games/neoquest/neoquest.phtml?action=move&movedir=";
                    break;
                case "KeyS":
                case "ArrowDown":
                    event.preventDefault();
                    document.querySelector("area[alt='South']").click();
                    break;
                case "KeyW":
                case "ArrowUp":
                    event.preventDefault();
                    document.querySelector("area[alt='North']").click();
                    break;
                case "KeyA":
                case "ArrowLeft":
                    event.preventDefault();
                    document.querySelector("area[alt='West']").click();
                    break;
                case "KeyD":
                case "ArrowRight":
                    event.preventDefault();
                    document.querySelector("area[alt='East']").click();
                    break;
                case "KeyQ":
                    document.querySelector("area[alt='Northwest']").click();
                    break;
                case "KeyE":
                    document.querySelector("area[alt='Northeast']").click();
                    break;
                case "KeyZ":
                    document.querySelector("area[alt='Southwest']").click();
                    break;
                case "KeyC":
                    document.querySelector("area[alt='Southeast']").click();
                    break;
            }
        });
    }
    else if (gameLinks[0].textContent === "Attack" || gameLinks[0].textContent === "Click here to see what you found!" || gameLinks[0].textContent === "Click here to see what happened...") {

        // const mobImage = mainGameWnd.querySelector("img[src^='//images.neopets.com/nq/m/']");
        // if(mobImage.height > 120) mobImage.height = 120;

        //we are in a fight
        mainGameWnd.querySelector(".frame table tbody").append(nqInfo);
        //on insane, queryselectorall(b) past 5 needs to be 2 higher because insane text has 2 letters in bold
        let bSelMod = 0;
        if (gameMode !== "normal" && gameMode !== "evil") {
            bSelMod = 2;
        }

        const oPetInfo = {
            hpNow: parseInt(mainGameWnd.querySelectorAll("b")[3].textContent),
            hpMax: parseInt(mainGameWnd.querySelectorAll("b")[3].nextSibling.textContent.split("/")[1]),
            level: parseInt(mainGameWnd.querySelectorAll("b")[2].textContent),
            weapon: mainGameWnd.querySelectorAll("b")[9 + bSelMod].textContent.toLowerCase(),
            armour: mainGameWnd.querySelectorAll("b")[10 + bSelMod].textContent.toLowerCase()
        };
        oPetInfo.attack = gameObjects.items[oPetInfo.weapon].points + oPetInfo.level; //NOT SURE IF LEVEL IS ADDED but it is for mobs
        oPetInfo.damage = gameObjects.items[oPetInfo.weapon].points; //this is correct
        let defBonus = getPetSkillAttr(4001, "def");
        if (gameObjects.items[oPetInfo.weapon].type !== "spectral") { defBonus = Math.ceil(defBonus * 0.4); }
        oPetInfo.defence = (oPetInfo.armour === "none" ? 0 : gameObjects.items[oPetInfo.armour].points) + oPetInfo.level + defBonus; //NOT SURE IF LEVEL IS ADDED but it is for mobs
        oPetInfo.attack = clamp(oPetInfo.attack, 0, oPetInfo.level * 2);
        oPetInfo.defence = clamp(oPetInfo.defence, 0, oPetInfo.level * 2);
        const oMobInfo = {
            name: mainGameWnd.querySelectorAll("b")[7 + bSelMod].textContent.toLowerCase().replace(/^an? /, ""),
            hpNow: parseInt(mainGameWnd.querySelectorAll("b")[11 + bSelMod].textContent),
            hpMax: parseInt(mainGameWnd.querySelectorAll("b")[11 + bSelMod].nextSibling.textContent.split("/")[1]),
            level: parseInt(mainGameWnd.querySelectorAll("b")[12 + bSelMod].textContent)
        };
        if (oMobInfo.name == "jahbal") {
            oMobInfo.attack = oPetInfo.defence;
            oMobInfo.defence = oPetInfo.attack;
        } else if (oMobInfo.name == "mastermind") {
            oMobInfo.attack = oPetInfo.defence + 2;
            oMobInfo.defence = oPetInfo.attack + 2;
        } else {
            oMobInfo.attack = oMobInfo.level + (gameObjects.monsters[oMobInfo.name].attack ?? 0);
            oMobInfo.defence = oMobInfo.level + (gameObjects.monsters[oMobInfo.name].defence ?? 0);
        }
        oMobInfo.damage = oMobInfo.level + (gameObjects.monsters[oMobInfo.name].damage ?? 0);
        isABossFight = gameObjects.monsters[oMobInfo.name].xp ? true : false;
        console.log(oPetInfo, oMobInfo);

        const petMeleeDmg = gameFunc.petMeleeDmg(oPetInfo);
        addBlurb("Pet Melee Damage:: " + petMeleeDmg.min + " - " + petMeleeDmg.max, "steelblue");

        const petMeleeAcc = gameFunc.petMeleeAcc(oPetInfo, oMobInfo);
        addBlurb("Pet Melee Accuracy:: " + petMeleeAcc + "%", "steelblue");

        // addBlurb("Expected Pet Damage Per Turn:: " + (((petMeleeDmg.min+petMeleeDmg.max)/2) * petMeleeAcc/100), "steelblue");

        const passiveBattleEffectSkillIds = [1001, 2001, 2002, 3001, 3002, 3004, 4002, 4004, 5002, 5003];
        passiveBattleEffectSkillIds.forEach(skillId => {
            const skillLvl = oPetSkills["s" + skillId];
            if (skillLvl > 0) {
                let skillProb = getPetSkillAttr(skillId, "prob");
                if (skillId === 3001 && gameObjects.items[oPetInfo.weapon].type !== "shock") {
                    skillProb = Math.ceil(skillProb / 2);
                }
                addBlurb(gameObjects.skills["s" + skillId].name + " chance:: " + skillProb + "%");
            }
        });

        addBlurb("");
        // addBlurb(oMobInfo.name);

        if (gameMode !== "evil" && gameMode !== "normal") gameMode = "evil"; //insane has same mods as evil
        const mobMeleeDmg = gameFunc.mobMeleeDmg(oMobInfo);
        addBlurb("Monster Melee Damage:: " + mobMeleeDmg[gameMode].min + " - " + mobMeleeDmg[gameMode].max, "#DA0D0D");

        const mobMeleeAcc = gameFunc.mobMeleeAcc(oMobInfo, { level: oPetInfo.level, defence: oPetInfo.defence });
        addBlurb("Monster Melee Accuracy:: " + mobMeleeAcc + "%", "#DA0D0D");

        const mobPowers = objectifyMobPowers(gameObjects.monsters[oMobInfo.name].powers);
        addBlurb("Monster Powers:: " + textualizeMobPowers(mobPowers), "#DA0D0D");

        let mobMaxPotentialDmg = mobMeleeDmg[gameMode].max;
        if (gameObjects.monsters[oMobInfo.name].maxHitPotential) {
            mobMaxPotentialDmg = calcMaxPotentialDmg(gameObjects.monsters[oMobInfo.name].maxHitPotential, mobMeleeDmg[gameMode].max)
        }
        // note: no mob in the game has a stun power with a cooldown less than it can stun for, but a mob may have more than one stun power
        addBlurb("The number below is the absolute max damage that could occur before you are able to heal when accounting for stuns, poison, and damaging attacks. However, for some monsters, this could be extremely rare: a monster would have to use all its stuns after one another and roll max damage on every attack. In some cases, e.g., Gors, you cannot be 100% safe. In other cases, the number is reasonable but very rare. This script usually prioritize healing the number is rare but reasonable, but in cases where it is not feasible to be completely safe, attacks may be prioritized.");

        addBlurb("Monster Max Potential Damage:: " + mobMaxPotentialDmg, "#DA0D0D");

        addBlurb("");
        addBlurb("Drops");
        getMonsterLoot(oMobInfo.name);

        const potionLinks = mainGameWnd.querySelectorAll("table")[0].querySelectorAll("a[onclick*='item']");
        const potionNames = ["weak", "standard", "strong", "greater", "superior", "spirit"];
        const potionIds = [220000, 220001, 220002, 220003, 220004, 220005];
        let potionDropChances = [];
        let highestPotionDropped;
        let hasPotionQty = {};
        potionLinks.forEach(potion => {
            const potionName = potion.textContent.split("Use a ")[1].split(" Healing")[0].toLowerCase();
            hasPotionQty[potionName] = parseInt(potion.textContent.split(") (")[1]);
        });
        //this is actually calculated when the battle begins (so using potions in battle doesnt actually increase drop chance) but its not particularly noticeable
        potionNames.forEach(potionName => {
            const potionLevels = gameObjects.items[potionName + " healing potion"].dropLevelRange;
            const potionChance = gameFunc.potionDropChance(oMobInfo.level, potionLevels[0], potionLevels[1], potionName, (potionName === "strong" ? 20 : 0), hasPotionQty[potionName]);
            if (oMobInfo.level >= potionLevels[0] && oMobInfo.level <= potionLevels[1]) {
                addBlurb(potionName + " healing potion:: " + (potionChance.useReduced ? potionChance.reduced : potionChance.base) / 10 + "%", "purple");
            }
            // potionDropChances.push(potionChance.useReduced ? potionChance.reduced : potionChance.base);
            // if(potionChance.base > 0 && potionName !== "spirit"){highestPotionDropped = potionName}
        });
        // console.log("most likely potion drop:", potionIds[potionDropChances.indexOf(Math.max(...potionDropChances))]);
        // console.log("highest Potion Dropped:", highestPotionDropped);

        const useAbsorption = false;
        let priortizeHeal = false;
        let aimHpPercent = 0.78;
        const healthMissing = oPetInfo.hpMax - oPetInfo.hpNow;
        //if the mob hits higher than our current hp, heal
        if (oPetInfo.hpNow <= mobMaxPotentialDmg && mobMaxPotentialDmg < oPetInfo.hpMax * aimHpPercent) priortizeHeal = true;
        //if the max hit is higher than x% of our max hp, just try to be safe instead
        if (mobMaxPotentialDmg >= oPetInfo.hpMax * aimHpPercent && oPetInfo.hpNow <= oPetInfo.hpMax * aimHpPercent) priortizeHeal = true;
        if (oPetInfo.hpNow > mobMaxPotentialDmg) priortizeHeal = false;

        if (priortizeHeal) {
            mainGameWnd.style.background = "repeating-linear-gradient(225deg,darkred,rgb(0,0,0,0))";
            //we need to heal, use a potion or use spirit of growth if available instead
            // defaultActionElement = mainGameWnd.querySelector("a[onclick*='200019']") ?? mainGameWnd.querySelector("a[onclick*='"+potionIds[potionDropChances.indexOf(Math.max(...potionDropChances))]+"']");
            // defaultActionElement = mainGameWnd.querySelector("a[onclick*='200019']") ?? mainGameWnd.querySelector("a[onclick*='"+potionIds[potionNames.indexOf(highestPotionDropped)]+"']") ?? "INTERVENE: We don't have any "+highestPotionDropped+" potion!";
            let potionNameToUse = "weak";
            if (oPetInfo.level >= 12 && healthMissing >= 20) potionNameToUse = "standard";
            if (oPetInfo.level >= 22 && healthMissing >= 40) potionNameToUse = "strong";
            if (oPetInfo.level >= 32 && healthMissing >= 70) potionNameToUse = "greater";
            if (oPetInfo.level >= 42 && healthMissing >= 100) potionNameToUse = "superior";
            if (isABossFight && oPetInfo.level >= 50 && healthMissing >= 125) potionNameToUse = "spirit";
            defaultActionElement = mainGameWnd.querySelector("a[onclick*='200019']") ?? mainGameWnd.querySelector("a[onclick*='" + potionIds[potionNames.indexOf(potionNameToUse)] + "']") ?? "INTERVENE: We don't have any " + potionNameToUse + " potion!";
        } else if (oMobInfo.hpNow <= 0.65 * petMeleeDmg.max && mainGameWnd.querySelector("a[onclick*='200019']")) {
            //use spirit of growth if mob health is less than x% of your max hit
            defaultActionElement = mainGameWnd.querySelector("a[onclick*='200019']");
        } else if (useAbsorption) {
            defaultActionElement = mainGameWnd.querySelector("a[onclick*='4003']");
        } else {
            //melee attack
            defaultActionElement = gameLinks[0];
        }

        // let battle = JSON.parse(GM_getValue("currentBattle", "{}"));
        // if(Object.keys(battle).length === 0){
        //   battle.petAttacks = 0;
        //   battle.mobAttacks = 0;
        //   battle.petAttacksMissed = 0;
        //   battle.mobAttacksMissed = 0;
        // }
        // const battleReport = mainGameWnd.querySelectorAll(".frame table tbody tr");
        // for(let i=4; i<mainGameWnd.querySelectorAll(".frame table tbody tr").length; i++){
        //   if(battleReport[i].textContent === "") {
        // 	break;
        //   } else {
        // 	const action = battleReport[i].textContent;
        // 	// console.log(action);
        // 	if(action.match(/You attack .* but miss!/)){
        // 	  battle.petAttacksMissed++;
        // 	} else if(action.match(/attacks you, but misses!/)){
        // 	  battle.mobAttacksMissed++;
        // 	} else if(action.match(/You defeated/)){
        // 	  battle = {};
        // 	} else if(action.match(/You blast/)){
        // 	  battle.petAttacks ++;
        // 	} else if(action.match(/blasts you/)){
        // 	  battle.mobAttacks ++;
        // 	}
        //   }
        // }
        // GM_setValue("currentBattle", JSON.stringify(battle));
        // console.log(battle);

        //if we're fighting faleinn, show her the medallion
        if (mainGameWnd.querySelector("a[onclick*='230074']")) {
            defaultActionElement = mainGameWnd.querySelector("a[onclick*='230074']");
        }
        defaultActionElement.textContent += defaultActionKeysStr;
    }
    if (gameLinks[0].textContent === "Do nothing" || gameLinks[0].textContent === "Click here to see what you found!") {
        //we are stunned/finished and there is literally nothing else we can do
        //these take pref over anything else...
        defaultActionElement = gameLinks[0];
        defaultActionElement.textContent += defaultActionKeysStr;
    }
} else {
    //we are in the fight begin/end page
    defaultActionElement = mainGameWnd.querySelector("input[type='submit']");
    defaultActionElement.value += defaultActionKeysStr;

    const foundItems = JSON.parse(GM_getValue("foundItems", "[]"));
    const lookedForItems = [
        "jungle beast claw",
        "noil's tooth",
        "jungle pauldrons",
        "carved oak staff",
        // "piece of living crystal",
        "emerald",
        "copper-plated key",
        "bronze-plated key",
        "silver-plated key",
        "gold-plated key",
        "platinum-plated key",
        "crystalline key",
        "inferno robe",
        "evening sun energy shield",
        "drakonid eye",
        "drakonid heart",
        "drakonid hide",
        "piece of agate",
        "piece of chrysolite",
        "piece of serpentine",
    ];
    const lootedItems = [...mainGameWnd.querySelectorAll("center b")].filter(e => !e.textContent.includes("experience"));
    lootedItems.forEach(e => {
        const itemName = e.textContent.toLowerCase().replace(/^an? /, "");
        if (lookedForItems.includes(itemName) && !foundItems.includes(itemName)) {
            foundItems.push(itemName);
            GM_setValue("foundItems", JSON.stringify(foundItems));
            alert("Found necessary item: " + itemName);
        }
    });

}

if (defaultActionElement) {
    if (defaultActionElement !== "move") {
        document.addEventListener("keydown", (event) => {
            if (defaultActionKeys.includes(event.code)) {
                event.preventDefault();
                try {
                    defaultActionElement.click();
                } catch (err) {
                    alert(defaultActionElement + "\n" + err)
                }
            }
        });
    }

}


function scheduleReload(delay) {
    if (autoReload && !reloadTimeout) {
        reloadTimeout = setTimeout(() => {
            if (defaultActionElement === "move") {
                location.href = "https://www.neopets.com/games/neoquest/neoquest.phtml?action=move&movedir=";
            } else {
                defaultActionElement.click();
            }
        }, delay);
    }
}


window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        autoReload = false;
        if (reloadTimeout){
            clearTimeout(reloadTimeout);
        }
        reloadTimeout = null;
        GM_setValue("autoReload", autoReload);
    }
});

window.addEventListener('keydown', function(event) {
    if (event.key === 'r') {
        autoReload = true;
        GM_setValue("autoReload", autoReload);
        scheduleReload(Math.round(minClickTiming + Math.random() * (maxClickTiming - minClickTiming)));
    }
});

window.addEventListener('load', function () {
    scheduleReload(Math.round(minClickTiming + Math.random() * (maxClickTiming - minClickTiming)));
});


