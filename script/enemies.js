// TODO: Enemy skills, basic behaviour

class Enemy {
  constructor(dict) {
    this.name = dict.name;
    this.description = dict.description;
    this.level = dict.level;
    // Adjectives to pad out enemy numbers
    this.adjectives = dict.adjectives;
    this.maxHealth = this.currentHealth = dict.maxHealth;
    this.minDmg = dict.minDmg;
    this.maxDmg = dict.maxDmg;
		//Accuracy is chance to hit, i.e. accuracy of 70 is 70% chance to hit
    this.accuracy = dict.accuracy;
    this.evasion = dict.evasion;
    this.defence = dict.defence;
    // this.effects = dict.effects;
    this.statusEffects = {"is_casting": {
			duration: "1"
		}};
    this.waitingText = [
      `The ${dict.name} paces impatiently.`,
      `The ${dict.name} glares at you warily.`,
      `The ${dict.name} watches you patiently.`
    ];
  }

  // Return true if status found else return false
  removeStatus(status) {
    if (this.statusEffects.hasOwnProperty(status)) {
      delete this.statusEffects[status];
      return true;
    } else {
      return false;
    }
  }
  
  checkCanAttack() {
    // TODO: Check not stunned, frozen etc.
  }

	//Accuracy is the chance to hit
	//So if dice is > than accuracy, it's a miss
	calculateHit(playerCharacter) {
		let accuracy = this.accuracy - playerCharacter.evasion;
		if (this.statusEffects.hasOwnProperty('accuracy')) {
			accuracy += this.statusEffects.accuracy.magnitude;
		}
		let dice = Math.random() * 100;
		if (accuracy > dice) {
			return true;
		} else return false;
	}
	
  takeBattleTurn(playerCharacter) {
    console.log("Taking enemy turn");
    // TODO: Accuracy, wind-up attacks, defensive abilities
    if (this.currentHealth > 0) {
      if (this.statusEffects.stunned) {
        Game.addToCombatLog(`The ${this.name} staggers around.`);
      } else {
        let damageDealt = Math.floor(
          Math.random() * (this.maxDmg - this.minDmg + 1) + this.minDmg
        );
        if (damageDealt > 0) {
          playerCharacter.currentHealth -= damageDealt;
          Game.addToCombatLog(`The ${this.name} hits you for ${damageDealt}.`);
        } else {
          Game.addToCombatLog(
            `The ${this.name}'s attack glances harmlessly off your armour.'`
          );
        }
      }
    }
    this.activateEffects();
  }

  //TODO: Confirm works right, might change index since removing element
  activateEffects() {
    for (let [key, val] of Object.entries(this.statusEffects)) {
      //Do effects
      val.duration--;
      if (val.duration <= 0) {
        delete this.statusEffects[key];
      }
    }
  }
}

// TODO: Change behaviour to be a weighting instead of %, to make definitions easier
// TODO: Add dummy enemy
let enemies = {
  lvl1_boar: {
    name: "boar",
    description: "",
    level: 1,
    adjectives: ["bristly", "furry", "angry", "wild"],
    maxHealth: 100,
    minDmg: 8,
    maxDmg: 30,
    accuracy: 80,
    evasion: 10,
    defence: 0,
    effects: [],
    behaviour: {
      attack: 100
    }
  },
  lvl1_wild_dog: {
    name: "wild dog",
    description: "",
    level: 1,
    adjectives: ["angry", "feral", "mangy"],
    maxHealth: 60,
    minDmg: 12,
    maxDmg: 40,
    accuracy: 90,
    evasion: 30,
    defence: 0,
    effects: [],
    behaviour: {
      attack: 100
    }
  },
  lvl1_trainer: {
    name: "Aiden",
    description: "",
    level: 1,
    adjectives: [],
    maxHealth: 120,
    minDmg: 15,
    maxDmg: 40,
    accuracy: 90,
    evasion: 20,
    defence: 5,
    effects: [],
    behaviour: {
      attack: 100
    }
  }
};
