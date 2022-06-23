// Each zone represents a location
// Various types of zones implemented with inheritance
// I.e. Zone (base), Wild (has enemies), Social (events?), Shop (can purchase things)

class Zone {
  constructor(dict) {
    this.name = dict.name;
    this.type = dict.type;
    this.neighbouringLocations = dict.neighbouringLocations;
    this.eventChance = dict.eventChance;
  }
  
  render(body, sidebar) {
    // TODO: Load body content associated with each zone
    return $("#main-content").text(this.name + " Body not yet implemented.");
  }
}

class Wild extends Zone {
  constructor(dict) {
    super(dict);
    this.enemies = dict.enemies;
    this.defaultLevel = this.level = dict.level;
    
    // TODO: Allow player to wander deeper?
    // Add modifiers to enemy for better reward
    this.maxLevel = dict.maxLevel;
    this.minLevel = dict.minLevel;
  }
  
  render(sidebar, body) {
    // TODO: Add a comment on enemy relative strength to character
    // TODO: Also have a way to compare strength
    body.append(`You wander into the ${this.name}. You could probably find something to fight here.<br>`);
    let fight = $("<div>").text("Look for a fight")
    .attr("class", "button")
    .attr("id", "button")
    .click(() => Game.startBattle(new Battle(window.playerCharacter, this.findEnemy())));
    body.append(fight).append("<br>");
  }
  
  findEnemy() {
    return new Enemy(enemies[this.enemies[Math.floor(Math.random() * this.enemies.length)]]);
  }
}

class Shop extends Zone {
  constructor(dict) {
    super(dict);
    this.itemsAvailable = dict.itemsAvailable;
  }
  // Renders shop inventory for purchase
  // TODO: Clickable tab at top to swap between buy and sell
  render(sidebar, body) {
    // Define functions outside of loops
    let purchase = (item, cost) => {
      let div = $("<div>").text("Purchase");
      if (playerCharacter.gold >= cost) {
        div.attr("class", "itemValidPurchase")
        .addClass("selectable")
          .click(() => {
          if (playerCharacter.gold >= cost) {
            playerCharacter.inventory.push(item);
            playerCharacter.gold -= cost;
            console.log(`Player purchased ${item} for ${cost}`);
            console.log(window.Game.currentLocation);
            // Reload this location to update available purchasess
            window.Game.loadLocation(window.Game.currentLocation);
          }
        });
      } else {
        div.attr("class", "itemTooExpensive");
      }
      return div;
    };
    let tbody = $("<table>")
      .attr("class", "shopItemsList")
      .append($("<th>").text("Weapon"))
      .append($("<th>").text("Cost"))
      .append($("<th>").text("Damage"))
      .append($("<th>").text("Purchase"));

    console.log(this.itemsAvailable);

    for (let itemKey of this.itemsAvailable) {
      console.log(itemKey);
      let item = items[itemKey];
      let tRow = $("<tr>")
        .append($("<td>").text(item.name))
        .append($("<td>").text(item.cost))
        .append($("<td>").text(item.damageBonus))
        .append($("<td>").append(purchase(itemKey, item.cost)));
      tbody.append(tRow);
    }
    body.append(tbody);
  }
}

// Serves only to connect zones and give flavour text. Maybe events?
class Hub extends Zone {
	constructor(dict) {
		super(dict);
		this.text = dict.text;
	}
	render (sidebar, body) {
		body.append($("<p>").append(this.text));
	}
}

class Healer extends Zone {
	constructor(dict) {
		super(dict);
	}
	render(sidebar, body) {
		
	}
}

class LevelUp extends Zone {
  constructor(dict) {
    super(dict);
    this.trainers = dict.trainers;
    this.experienceRequired = Game.levelUpTable;
  }
  // Renders shop inventory for purchase
  // TODO: Clickable tab at top to swap between buy and sell
  render(sidebar, body) {
    // Define functions outside of loops
    
  }
  
  // Hitting experience thresholds should give stat increases by default
  // Level-up battles will unlock skills or features I guess
  checkExperience(actor) {
    // 
    if (actor.experience > this.experienceRequired[actor.level]) {
      return true;
    }
  }
}

let zones = {
  intro_road: new Hub({
    name: "Old Road",
    type: "travel",
    neighbouringLocations: ["town_hub"],
		text: "You are on a winding road, with a town off in the distance.<br><i>Navigate using the left sidebar</i>"
  }),
  town_hub: new Hub({
    name: "Town Centre",
    type: "social",
    neighbouringLocations: [
      "town_shop_weapons",
      "town_shop_armour",
      "town_tavern",
      "training_ground",
      "wild_forest"
    ],
		text: "You are in the middle of a small town."
  }),
  town_shop_weapons: new Shop({
    name: "Weapon Store",
    type: "shop",
    eventChance: 0,
    itemsAvailable: ["wpn_pitchfork", "wpn_short_sword"],
    neighbouringLocations: ["town_hub"]
  }),
  town_shop_armour: new Shop({
    name: "Armour Store",
    type: "shop",
    eventChance: 0,
    itemsAvailable: [],
    neighbouringLocations: ["town_hub"]
  }),
  town_tavern: new Zone( {
    name: "Tavern",
    type: "social",
    eventChance: 0,
    neighbouringLocations: ["town_hub"]
  }),
  training_ground: new Zone( {
    name: "Training Ground",
    type: "level_up",
    eventChance: 0,
    neighbouringLocations: ["town_hub"],
    trainers: ["lvl1_trainer"]
  }),
  wild_forest: new Wild({
    name: "Forest",
    type: "hostile",
    eventChance: 0,
    neighbouringLocations: ["town_hub", "healer_healers_hut"],
    level: 1,
    maxLevel: 2,
    minLevel: 1,
    enemies: ["lvl1_boar", "lvl1_wild_dog"]
  }),
	healer_healers_hut: new Healer ({
		name: "Healer's Hut",
		type: "healer",
		eventChance: 10,
		neighbouringLocations: ["wild_forest"]
	})
};
