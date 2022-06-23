class View {
  constructor(sidebar, body) {
    this.sidebar = sidebar;
    this.body = body;
  }

  render() {
    return "";
  }
}

class HeaderView extends View {
	constructor(sidebar, body, header) {
		super(sidebar, body);
		this.header = header;
	}
	
	render() {
		this.header.empty();
		let actor = Game.playerCharacter;
		this.header.append($("<div>").attr("class", "col-sm-2"));
		this.header.append($("<div>").attr("id", "actor-name").attr("class", "col-sm-2").text(`Name: ${actor.name}`));
		this.header.append($("<div>").attr("id", "current-hp").attr("class", "col-sm-2").text(`HP: ${actor.currentHealth}\\${actor.maxHealth}`));
		this.header.append($("<div>").attr("id", "current-sp").attr("class", "col-sm-2").text(`SP: ${actor.skillPoints}\\${actor.maxSkillPoints}`));
		this.header.append($("<div>").attr("id", "current-gold").attr("class", "col-sm-2").text(`Gold: ${actor.gold}`));
		this.header.append($("<div>").attr("id", "current-experience").attr("class", "col-sm-2").text(`Exp: ${actor.experience}\\${Game.experienceTable[actor.level]}`));
	}
	
	update() {
		let actor = Game.playerCharacter;
		$("#actor-name").text(`Name: ${actor.name}`);
		$("#current-hp").text(`HP: ${actor.currentHealth}\\${actor.maxHealth}`);
		$("#current-sp").text(`SP: ${actor.skillPoints}\\${actor.maxSkillPoints}`);
	}
}

// TODO: Fix this spaghetti
class CharacterView extends View {
  constructor(sidebar, body) {
    super(sidebar, body);
    this.currentDiv = null;
  }

  render(activeBattle) {
    console.log("Rendering Character");
    let headings = ["Stats", "Inventory", "Skills", "Tactics", "Achievements"];
    let contentFunctions = [
      this.renderStats(),
      this.renderInventory(),
      this.renderSkills()
    ];
    if (window.playerCharacter.unlocks.tactics === true) {
      contentFunctions.push(this.renderTactics(window.playerCharacter));
    }
    if (window.playerCharacter.unlocks.achievements === true) {
      contentFunctions.push(this.renderAchievements(window.playerCharacter));
    }
    let tabs = $("<div>").addClass("tabs");
    let tabList = $("<ul>");
    this.body.append(tabs);
    tabs.append(tabList);
    for (let i = 0; i < headings.length; i++) {
      tabList.append(
        $("<li>").append(
          $("<a>")
            .attr("href", `#tabs-${i}`)
            .addClass("tab")
            .text(headings[i])
        )
      );
    }
    for (let i = 0; i < contentFunctions.length; i++) {
      tabs.append(
        $("<div>")
          .attr("id", `tabs-${i}`)
          .append(
            $("<div>")
              .attr("id", `${headings[i].toLowerCase()}-div`).append(contentFunctions[i])
              
          )
      );
    }
    tabs.tabs();
  }

  renderStats() {
    let actor = Game.playerCharacter;
    let statusEffects = "";
    let weapons = "";
    let armour = "";
    if (!jQuery.isEmptyObject(actor.statusEffects)) {
      statusEffects = actor.statusEffects.join("<br/>");
    }
    if (!jQuery.isEmptyObject(actor.activeWeapons)) {
      weapons = actor.activeWeapons.join("<br/>");
    }
    if (!jQuery.isEmptyObject(actor.equippedArmour)) {
      armour = actor.equippedArmour.join("<br/>");
    }
   let output = [
      `${actor.name} the ${actor.title}`,
      `Class: ${actor.class}`,
      "",
      `Level: ${actor.level}`,
      `Experience: ${actor.experience}`,
      `Renown: ${actor.renown}`,
      `Prestige: ${actor.prestige}`,
      "",
      `Health: ${actor.currentHealth}/${actor.maxHealth}`,
      `Skill Points: ${this.skillPoints}/${actor.maxSkillPoints}`,
      "",
      `Strength: ${actor.strength}`,
      `Intelligence: ${actor.intelligence}`,
      `Dexterity: ${actor.dexterity}`,
      `Perception: ${actor.perception}`,
      `Athletics: ${actor.athletics}`,
      `Physical Defence: ${actor.physicalDefence}`,
      `Magical Defence: ${actor.magicalDefence}`
    ].join("<br/>");
		return output;
		
  }

  renderInventory() {
    let result = [];
    let actor = Game.playerCharacter;
    for (let item of actor.inventory) {
      let itemData = items[item];
      result.push(itemData.output());
    }
    return result.join("<br/><br/>");
  }

  renderSkills() {
    let actor = Game.playerCharacter;
    let result = [];
    for (let s of actor.availableSkills) {
      let skill = lib_skills[s];
      result.push(
        `<b>${skill.name}</b><br>SP Cost: ${
          skill.actionPointCost
        }<br>Description: ${skill.description}`
      );
    }
    if (result.length > 0) {
      return result.join("<br/><br/>");
    } else {
      return "You have no skills.";
    }
  }

	
	//TODO: Tidy up all of this spaghetti tactics
  renderTactics() {
    let actor = Game.playerCharacter;
    let result = [];
    if (actor.unlocks.tactics === true) {
      if (actor.tactics.length == 0) {
        result.push("<p>You haven't set any tactics yet.</p>");
        result.push(
          $("<div>")
            .attr("class", "button")
            .text("Add Tactic")
            .click(() => {
              this.addTactic();
            })
        );
      } else {
				// this.loadTactics(actor.tactics);
				$.merge(result, this.loadTactics(actor.tactics));
				// console.log(this.loadTactics(actor.tactics)[0]);
			}
    } else {
      result.push("You have not yet unlocked this feature.");
    }
    return result;
  }
	
	loadTactics(tactics) {
		let result = [];
		let table = this.tacticTable();
		$.each(Game.playerCharacter.tactics, (key, value) => {
			let row = this.newTacticRow();
			row.find("select.target").val(value.targetType);
			row.find("select.condition").val(value.condition);
			row.find("select.skill").val(value.action);
			table.append(row);
		});
		result.push(table[0]);
		result.push(
			$("<div>")
			.attr("class", "button inline")
			.text("Add Tactic")
			.click(() => {
				this.addTactic();
			})[0]);
		result.push(
			$("<div>")
			.attr("class", "button inline")
			.text("Save")
			.click(() => {
				this.saveTactics();
			})[0]);
		console.log(result);
		return result;
	}

  addTactic() {
    if (Game.playerCharacter.tactics.length == 0 && $("#tactics-table tr").length == 0) {
      $("#tactics-div").empty();
			let div = $("#tactics-div");
      let table = this.tacticTable();
      let row = this.newTacticRow();
      table.append(row);
      div.append(table);
      div.append(
        $("<div>")
          .attr("class", "button inline")
          .text("Add Tactic")
          .click(() => {
            this.addTactic();
          })
      );
      div.append(
        $("<div>")
          .attr("class", "button inline")
          .text("Save")
          .click(() => {
            this.saveTactics();
          })
      );
      this.saveTactics();
    } else {
      $("#tactics-table").append(this.newTacticRow());
    }
  }

  saveTactics() {
    Game.playerCharacter.tactics = [];
    $('#tactics-table tr').each( function() {
      let target = $(this).find("select.target").val();
      let condition = $(this).find("select.condition").val();
      let skill = $(this).find("select.skill").val();
      Game.playerCharacter.tactics.push(new Tactic({
        condition: condition,
        targetType: target,
        action: skill
      }))
    })
  }
  

  newTacticRow() {
    let row = $("<tr>");
    let targets = $("<td>");
    let conditions = $("<td>");
    let skills = $("<td>");
		let removeTactic = $("<td>");
    targets.html(this.objToSelect(targetTypes, "target"));
    conditions.html(this.objToSelect(tacticConditions, "condition"));
    let availableSkills = {};
    $.each(Game.playerCharacter.availableSkills, (key, val) => {
      availableSkills[val] = lib_skills[val];
    });
    skills.html(this.objToSelect(availableSkills, "skill"));
		removeTactic.html($("<div>")
				.attr("class", "button")
				.text("Remove")
				.click( () => {
				console.log($(removeTactic));
				console.log($(removeTactic).parent());
				$(removeTactic).parent().remove();
				this.saveTactics();
		}));
    row.append(targets);
    row.append(conditions);
    row.append(skills);
		row.append(removeTactic);
    return row;
  }

  objToSelect(obj, cls) {
    let result = $("<select>").attr("class", cls);
    $.each(obj, function(key, val) {
      result.append(
        $("<option>")
          .attr("id", `${key}-select`)
          .attr("value", key)
          .text(val["text"])
      );
    });
    return result;
  }

  tacticTable() {
    return $("<table>")
      .attr("id", "tactics-table")
      .append(
        $("<thead>")
          .append($("<th>").text("Target"))
          .append($("<th>").text("Condition"))
          .append($("<th>").text("Skill"))
      );
  }
}

class SettingsView extends View {
	constructor (sidebar, body, header) {
		super(sidebar, body);
	}
	
	render() {
		
	}
	
	update() {
		
	}
}