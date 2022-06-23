// Expand on skils as more functionality is needed
// We should re-do constructor to allow for optional parameters

class Skill {
  constructor(dict) {
    this.name = this.text = dict.name;
    this.type = dict.type;
    this.actionPointCost = dict.actionPointCost;
    this.description = dict.description;
    this.minLevel = dict.minLevel;
    this.__action = dict.action;
  }
	
	action(event) {
		console.log(this);
		console.log(event);
		// this.__action.bind(this);
		this.__action(event);
	}
	
	// calculateDamage(dict) {
	// 	// Power is a number that shows player the relative power of an attack
	// 	// E.g. the basic attack has a power of 1
	// 	// Stat bonus is some scaling passed in, e.g. skill might have a bonus multiplier of (str*0.8 + dex*0.3)/2
	// 	// Damage has some random element to make numbers feel more dynamic. Might be 0.8-1.2 multiplier of damage
	// 	let power = dict.power;
	// 	let armour = dict.targetArmour;
	// 	let damage = dict.sourceDamage;
	// 	let arPen = dict.sourceArmourPenetration;
	// 	let critChance = dict.critChance;
	// 	let critMultiplier = dict.critMultiplier;
	// 	let statBonus = dict.statBonus;
	// 	let minRandom = dict.minRandom;
	// 	let maxRandom = dict.maxRandom
	// }
	
	calculateDamage(caster, target) {
			console.log(caster, target);
      let casterDamage = caster.baseDamage;
      if (caster.activeWeapons.length > 0) {
        for (let weapon of caster.activeWeapons) {
          casterDamage += items[weapon].damageBonus;
        }
      }
      let randomModifier = (Math.random() * (1.2 - 0.8) + 0.8).toFixed(3);
      let damageDealt = ((casterDamage - target.defence) * (caster.strength * 0.1)) * randomModifier;
      if (damageDealt < 0) {
        damageDealt = 0;
      }
		return damageDealt;
	}
	
	calculateHit() {
		
	}
	
}


let basicSkills = {
  base_attack: new Skill({
    name: "Attack",
    type: ["offensive", "actor"],
    description: "Stick them with the pointy(?) end!",
    minLevel: 0,
    actionPointCost: 0,
    
    action: function (event) {
      // Roll accuracy
      // Roll damage
      // Add modifiers
      let caster = event.caster;
      let target = event.target;
      // console.log(caster, target);
      // let casterDamage = caster.baseDamage;
      // if (caster.activeWeapons.length > 0) {
      //   for (let weapon of caster.activeWeapons) {
      //     casterDamage += items[weapon].damageBonus;
      //   }
      // }
      // let randomModifier = (Math.random() * (1.2 - 0.8) + 0.8).toFixed(3);
      // let damageDealt = ((casterDamage - target.defence) * (caster.strength * 0.1)) * randomModifier;
      // if (damageDealt < 0) {
      //   damageDealt = 0;
      // }
			console.log(this);
			let damageDealt = this.calculateDamage(caster, target)
      target.currentHealth -= damageDealt;
      Game.addToCombatLog(`You hit the ${target.name} for ${Math.round(damageDealt)} damage.`);
    },
  }),
  base_defend: new Skill({
    name: "Defend",
    type: ["defensive", "actor"],
    description: "Take cover!",
    minLevel: 0,
    actionPointCost: 0,
    
    action: (event) => console.log("Used Defend")
  }),
  dummy_template_skill: new Skill ({
    name: "Template Skill",
    type: ["dummy"],
    description: "Testing purposes",
    minLevel: 0,
    actionPointCost: 0,
    action: function (event) {
      console.log("Skill not implemented");
    }
  })
};



let soldierSkills = {
  soldier_pommel_strike: new Skill({
    name: "Pommel Strike",
    type: ["offensive", "actor", "status"],
    description: "Hit them with the blunt part, interrupting most attacks",
    minLevel: 1,
    actionPointCost: 1,
    
    action: function (event) {
      let caster = event.caster;
      let target = event.target;
      console.log(event)
      if (target.removeStatus("is_casting") === true) {
        target.statusEffects.stunned = {duration: 1};
        Game.addToCombatLog(`You break the enemy's concentration, stunning them.`);
      } else {
        Game.addToCombatLog(`Your ${this.name} has no effect.`);
      }
      console.log("Used Pommel Strike");
    }
  }),
  soldier_first_aid: new Skill ({
    name: "First Aid",
    type: ["healing, actor"],
    description: "Apply basic first aid to regain a little health",
    minLevel: 1,
    actionPointCost: 1,
    
    action: function (event) {
      let caster = event.data.caster;
      let target = event.data.target;
      let restored = target.gainHealth(target.maxHealth * 0.2);
      Game.addToCombatLog(`You regained ${restored} health from ${this.name}.`)
    }
  })
};

// Hound should not attack while using maul
let wayfarerSkills = {
  wayfarer_hound_maul: new Skill ({
    name: "Maul",
    type: ["offensive", "companion", "status"],
    description: "Order your companion to pin the enemy",
    minLevel: 1,
    actionPointCost: 1,
    
    action: function (event) {
      let caster = event.data.caster;
      let target = event.data.target;
      target.removeStatus("is_casting");
      target.statusEffects.stunned = {duration: 2};
      console.log("Used Maul");
    }
  })
};

// 
let villagerSkills = {
  villager_throw_sand: new Skill({
    name: "Throw Sand",
    type: ["defensive", "actor", "status"],
    description: "Throw something gritty in your opponent's face, reducing their accuracy.",
    minLevel: 1,
    actionPointCost: 1,
    action: function (event) {
      let caster = event.data.caster;
      let target = event.data.target;
      target.statusEffects.accuracy = {duration: 2, magnitude: -90, type: 'debuff'};
      console.log("Used Throw Sand");
    }
  })};

// Arcane blast - Basic attack
// Chilling Touch - Opponent skips every second turn for a moderate number of rounds 
// Focus - Restore SP, no attack
// let hedgeWizardSkills = {
	
// }

// Rogue
// Dirty Fighting - Stuns and attacks
// Sneak - First attack does extra damage. Attacks from stealth do extra damage.
// Stealth - Hide from combat for X rounds. Can use non-combat without breaking.

//ECMAScript 2018, not supported by Edge?
// let lib_skills = {...basicSkills, ...soldierSkills, ...villagerSkills, ...wayfarerSkills};
let lib_skills = Object.assign({}, basicSkills, soldierSkills, villagerSkills, wayfarerSkills);