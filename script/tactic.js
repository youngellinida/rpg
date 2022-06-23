class Tactic {
  constructor(dict) {
    this.condition = dict.condition;
    this.action = dict.action;
    this.targetType = dict.targetType;
  }
  caster(battle) {
    return battle.playerCharacter;
  }
  target(battle) {
    return targetTypes[this.targetType].target(battle);
  }
  evaluate(battle) {
    return tacticConditions[this.condition].evaluate(this.target(battle));
  }
  output() {
    let row = $("<tr>");
    row.append($("<td>").text(this.targetType.text));
    row.append($("<td>").text(this.condition.text));
    row.append($("<td>").text(skills[this.action].name));
    return row;
  }
}

let targetTypes = {
  self: {
    text: "Self",
    target: (battle) => {
      return battle.playerCharacter;
    }
  },
  // TODO: Support for multiple enemies
  enemy: {
    text: "Enemy",
    target: (battle) => {
      return battle.enemy;
    }
  }
};

let tacticConditions = {
  // Target an enemy that has the "is_casting" status effect
  is_casting: {
    text: "Casting",
    evaluate: (target) => {
      if (target.statusEffects.is_casting) {
        return true;
      } else return false;
    }
  },
  hp_less_50pc: {
    text: "HP < 50%",
    evaluate: (target) => {
      if (target.currentHealth < (target.maxHealth * 0.5)) {
        return true;
      } else return false;
    }
  },
  any: {
    text: "Any",
    evaluate: (target) => {return true;}
  }
};