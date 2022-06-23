class ActorClass {
  constructor(dict) {
    this.name = dict.name;
    this.description = dict.description;
    this.availableSkills = dict.availableSkills;
    this.minPrestige = dict.minPrestige;
    this.minRenown = dict.minRenown;
    this.hasUnlocked = dict.hasUnlocked;
    this.startingBonus = dict.startingBonus;
    this.statGrowth = dict.statGrowth;
  }
  outputToBlock() {
    let skillNames = [];
    for (let key of this.availableSkills) {
      skillNames.push(lib_skills[key].name);
    }
    let startingItems = [];
    for (let item of this.startingBonus.activeWeapons) {
      startingItems.push(items[item].name);
    }
    return `Class: ${this.name}<br>${
      this.description
    }<br><br>Starting Equipment:<br>${startingItems.join(
      "<br>"
    )}<br><br>Available Skills:<br>${skillNames.join("<br>")}`;
  }
}

//To unlock classes at character creation, a player must have unlocked them through the game at least once
let actorClasses = {
  class_villager: new ActorClass({
    name: "Villager",
    description: "Untrained and unkempt",
    availableSkills: ["base_attack", "base_defend"],
    minPrestige: 0,
    minRenown: 0,
    hasUnlocked: true,
    startingBonus: {
      maxHealth: 5,
      skillPoints: 2,
      baseDamage: 1,
      strength: 2,
      dexterity: 2,
      intelligence: 2,
      athletics: 2,
      perception: 2,
      physicalDefence: 2,
      magicalDefence: 2,
      inventory: ["wpn_pitchfork"],
      activeWeapons: ["wpn_pitchfork"]
    },
    statGrowth: {
      maxHealth: 10,
      skillPoints: 1,
      strength: 3,
      intelligence: 2,
      dexterity: 4,
      perception: 3,
      athletics: 2
    }
  }),
  //TODO: Everything other than Villager requires at least some renown
  // Soldier
  // Has had basic combat training and experience
  // Primarily uses melee weapons
  // Unlock through event in tavern
  class_soldier: new ActorClass({
    name: "Soldier",
    description: "Knows the pointy end",
    availableSkills: ["base_attack", "base_defend", "soldier_pommel_strike", "soldier_first_aid"],
    minPrestige: 0,
    minRenown: 0,
    hasUnlocked: true,
    startingBonus: {
      maxHealth: 10,
      skillPoints: -1,
      baseDamage: 5,
      strength: 5,
      athletics: 3,
      dexterity: 2,
      physicalDefence: 2,
      magicalDefence: -1,
      inventory: ["wpn_short_sword"],
      activeWeapons: ["wpn_short_sword"]
    },
    statGrowth: {
      maxHealth: 10,
      skillPoints: 1,
      strength: 3,
      intelligence: 2,
      dexterity: 4,
      perception: 3,
      athletics: 2
    }
  }),

  // Wayfarer
  // Roams the land. Has a companion. Uses basic ranged and melee weapons.
  // Unlock through event in forest
  class_wayfarer: new ActorClass({
    name: "Wayfarer",
    description: "A wanderer and his trusty canine",
    availableSkills: ["base_attack", "base_defend", "wayfarer_hound_maul"],
    minPrestige: 0,
    minRenown: 0,
    hasUnlocked: true,
    startingBonus: {
      maxHealth: 5,
      skillPoints: 0,
      baseDamage: 5,
      strength: 4,
      athletics: 3,
      dexterity: 3,
      physicalDefence: 1,
      magicalDefence: 0,
      inventory: ["wpn_pitchfork"],
      activeWeapons: ["wpn_pitchfork"],
      companions: ["pet_wayfarer_dog"]
    },
    statGrowth: {
      maxHealth: 10,
      skillPoints: 1,
      strength: 3,
      intelligence: 2,
      dexterity: 4,
      perception: 3,
      athletics: 2
    }
  }),

  // Has high skill points with some basic magic skills
  // Unlocked through event in forest?
  class_hedge_wizard: new ActorClass({
    name: "Hedge Wizard",
    description:
      "Has just enough magical knowledge to be dangerous to themselves.",
    availableSkills: ["base_attack", "base_defend"],
    minPrestige: 0,
    minRenown: 0,
    hasUnlocked: true,
    startingBonus: {
      maxHealth: 5,
      skillPoints: 4,
      baseDamage: -1,
      strength: 1,
      athletics: 1,
      dexterity: 4,
      physicalDefence: 1,
      magicalDefence: 5,
      inventory: ["wpn_simple_staff"],
      activeWeapons: ["wpn_simple_staff"]
    },
    statGrowth: {
      maxHealth: 5,
      skillPoints: 2,
      strength: 1,
      intelligence: 5,
      dexterity: 4,
      perception: 2,
      athletics: 1
    }
  })
};
