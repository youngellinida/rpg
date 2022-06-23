class Item {
  constructor(dict) {
    this.name = dict.name;
    this.description = dict.description;
    this.cost = dict.cost;
  }
  output() {
    return `${this.name}<br/>${this.description}<br/>`
  }
}

class Weapon extends Item {
  constructor(dict) {
    super(dict);
    this.type = 'weapon';
    this.damageBonus = dict.damageBonus;
  }
  output() {
    return `<b>${this.name}</b><br/>${this.description}<br/>Damage: ${this.damageBonus}`
  }
}

class Companion extends Item {
  constructor(dict) {
    super(dict);
    this.baseDamage = dict.baseDamage;
    this.behaviour = dict.behaviour;
    this.busy = false;
    this.type = 'companion';
  }
}


let items = {
  
  /*
  Weapons
  */
  wpn_pitchfork: new Weapon({
    name: "Pitchfork",
    description: "Pitchfork Emporium's Finest",
    damageBonus: 4,
    cost: 50
  }),
  wpn_short_sword: new Weapon({
    name: "Short Sword",
    description: "A simple but functional weapon",
    damageBonus: 10,
    cost: 200
  }),
  
  wpn_simple_staff: new Weapon({
    name: "Simple Staff",
    description: "A simple but functional weapon",
    damageBonus: 2,
    magicBonus: 3,
    cost: 200
  }),
  
  /*
  Companions
  */
  
  pet_wayfarer_dog: new Companion({
    name: "Faithful Hound",
    description: "The loyalest of dogs",
    baseBamage: 10,
    cost: null, // Cannot be purchased
    behaviour: {
      attacks: true
    }
  })
};
