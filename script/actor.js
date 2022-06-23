class Actor {
  constructor(
    dict = {
      name: "DummyActor",
      title: "",
      class: null,
      gender: "",
      availableSkills: [],
      skills: [],
			tactics: [],
      gold: 100,
      experience: 0,
      renown: 0,
      prestige: 0,
      level: 1,
      maxHealth: 100,
      skillPoints: 3,
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      perception: 10,
      athletics: 10,
      statGrowth: {
        maxHealth: 0,
        skillPoints: 0,
        strength: 0,
        intelligence: 0,
        dexterity: 0,
        perception: 0,
        athletics: 0
      },
      statusEffects: [],
      inventory: [],
      activeWeapons: [],
      maxActiveWeapons: 1,
      companions: [],
      equippedArmour: [],
      baseDamage: 0,
      physicalDefence: 0,
      magicalDefence: 0,
      block: 0,
			evasion: 0
    }
  ) {
    this.name = dict.name;
    this.title = dict.title;
    this.class = dict.class;
    this.gender = dict.gender;

    this.availableSkills = dict.availableSkills;
    this.skills = dict.skills;
    this.tactics = dict.tactics.map(x => new Tactic(x) );

    this.gold = dict.gold;
    this.experience = dict.experience;
    this.renown = dict.renown;
    this.prestige = dict.prestige;
    this.level = dict.level;

    this.currentHealth = this.maxHealth = dict.maxHealth;
    this.skillPoints = this.maxSkillPoints = dict.skillPoints;
    this.strength = dict.strength;
    this.intelligence = dict.intelligence;
    this.dexterity = dict.dexterity;
    this.perception = dict.perception;
    this.athletics = dict.athletics;
    this.statGrowth = dict.statGrowth;

    this.statusEffects = dict.statusEffects;

    this.inventory = dict.inventory;
    this.activeWeapons = dict.activeWeapons;
    this.maxActiveWeapons = dict.maxActiveWeapons;
    this.equippedArmour = dict.equippedArmour;
    this.companions = dict.companions;

    this.baseDamage = dict.baseDamage;
    this.physicalDefence = dict.physicalDefence;
    this.magicalDefence = dict.magicalDefence;
    this.block = dict.block;
		this.evasion = dict.evasion;

    this.unlocks = {
      tactics: true,
      achievements: false
    };
  }
  evaluateUnlockedSkills() {
    this.skills = [];
    this.availableSkills.forEach(e => {
      if (this.level >= lib_skills[e].minLevel) {
        this.skills.push(e);
      }
    });
  }
  getBaseDamage() {
    let weaponDamageBonus = 0;
    if (this.activeWeapons.length > 0) {
      for (let weapon of this.activeWeapons) {
        weaponDamageBonus += weapons[weapon].baseDamage;
      }
    }
    return this.baseDamage + weaponDamageBonus;
  }

  gainHealth(healthGained) {
    if (this.currentHealth + healthGained < this.maxHealth) {
      this.currentHealth += healthGained;
      return healthGained;
    } else {
      let restored = this.maxHealth - this.currentHealth;
      this.currentHealth = this.maxHealth;
      return restored;
    }
  }

  canCast(skill) {
    if (skill.actionPointCost < this.skillPoints) {
      return true;
    } else {
      return false;
    }
  }

  useTactics(battle) {
    for (const tactic of this.tactics) {
      if (tactic.evaluate(battle) === true) {
        return tactic.action;
      }
    }
    // TODO: Return something if no valid tactic found and treat appropriately
  }

  updateStatusEffects() {
    for (let [key, val] of Object.entries(this.statusEffects)) {
			if (val != "inf") {
      val.duration--;
      if (val.duration <= 0) {
        delete this.statusEffects[key];
      }
    }}
  }

  removeStatus(status) {
    if (this.statusEffects.includes(status)) {
      this.statusEffects = this.statusEffects.filter(e => e != status);
    }
  }

  levelUp() {
    if (this.checkLevelUp(Game.experienceTable)) {
      for (const [key, val] of Object.entries(this.statGrowth)) {
        this[key] += val;
      }
    }
  }

  checkLevelUp(experienceTable) {
    if (this.experience > Game.experienceTable[this.level]) {
      return true;
    } else return false;
  }

}
