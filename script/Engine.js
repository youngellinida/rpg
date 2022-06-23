(function() {
	console.log("Initiating game");
	let Game = (window.Game = {
		init: function(options) {
			this.data = {};
			this.currentLocation = "";
			this.experienceTable = [0, 200, 600, 1200];
			this.activeBattle = null;
			this.renderFooter();
			if (localStorage.getItem("playerCharacter")) {
				Game.playerCharacter = window.playerCharacter = new Actor(
					JSON.parse(localStorage.getItem("playerCharacter"))
				);
				console.log(`Loaded player character:`);
				console.log(Game.playerCharacter);
				//TODO: Save location state
				this.loadLocation("intro_road");
				this.addCharacterToSidebar();
				this.addSettingsToSidebar();
			} else {
				Game.playerCharacter = window.playerCharacter = new Actor();
				this.characterCreation();
			}
			Game.characterView = new CharacterView(
				$("#sidebar-content"),
				$("#main-content")
			);
			Game.settingsView = new SettingsView(
				$("#sidebar-content"),
				$("#main-content"),
				$("#header-content")
			);
			Game.header = new HeaderView(
				$("#sidebar-content"),
				$("#main-content"),
				$("#header-content")
			);
			Game.header.render();
		},

		startBattle: function(battle) {
			this.activeBattle = battle;
			this.clearMainView();
			this.renderCombatView($("#main-content"));
			if (this.activeBattle.enemy.constructor === Array) {
				let names = [];
				for (let e of this.activeBattle.enemy) {
					names.push(e.name);
				}
				console.log(
					`${
						this.activeBattle.playerCharacter.name
					} encountered ${names.join()}`
				);
			} else {
				console.log(
					`${this.activeBattle.playerCharacter.name} encountered ${
						this.activeBattle.enemy.name
					}`
				);
				this.addToCombatLog(
					`You encountered a ${this.activeBattle.enemy.name}.`
				);
				this.addToCombatLog(
					Game.randomListElement(this.activeBattle.enemy.waitingText)
				);
				this.renderCombatActions(
					this.activeBattle.playerCharacter,
					this.activeBattle.enemy
				);
			}
		},

		updateBattle: function() {
			console.log("Updating battle");
			this.activeBattle.update();
			Game.header.update();
			if (this.activeBattle.enemy.currentHealth > 0) {
				this.renderCombatActions(
					this.activeBattle.playerCharacter,
					this.activeBattle.enemy
				);
			} else {
				this.endBattle();
			}
		},

		endBattle: function() {
			this.rewardPlayer();
			$("#combatMenu")
				.empty()
				.append(
					$("<div>")
						.text(`Return to ${zones[this.currentLocation].name}`)
						.attr("class", "button")
						.click(() => {
							console.log(this.playerCharacter);
						})
						.click(() => {
							this.activeBattle = null;
						})
						.click(() => {
							this.loadLocation(this.currentLocation);
						})
				);
		},

		rewardPlayer: function() {
			let randomModifier = (Math.random() * (1.25 - 0.75) + 0.75).toFixed(3);
			let goldReward = this.activeBattle.enemy.level * 25 * randomModifier;
			randomModifier = (Math.random() * (1.25 - 0.75) + 0.75).toFixed(3);
			let experienceReward =
				this.activeBattle.enemy.level * 100 * randomModifier;
			let renownReward = 0;
			console.log("Rewards", goldReward, experienceReward);
			this.playerCharacter.gold += goldReward;
			this.playerCharacter.experience += experienceReward;
			this.addToCombatLog(
				`You gained ${Math.floor(experienceReward)} experience and ${Math.floor(
					goldReward
				)} gold.`
			);
			if (this.playerCharacter.checkLevelUp(this.experience) === true) {
				this.playerCharacter.levelUp();
				this.addToCombatLog(
					`You leveled up. A trainer may have new skills available.`
				);
			}
			Game.header.render();
		},

		renderCombatView: function(body) {
			let combatContent = $("<div>")
				.attr("class", "combat")
				.attr("id", "combat-content");
			let combatLog = $("<div>")
				.attr("class", "combatLog")
				.attr("id", "combatLog");
			let combatMenu = $("<div>")
				.attr("class", "combatMenu")
				.attr("id", "combatMenu");
			combatContent.append(combatLog);
			combatContent.append(combatMenu);
			body.append(combatContent);
		},

		renderCombatActions: function(actor, enemies) {
			// Local anonymous function declaration for scoping
			let setEnemyTurn = () => {
				this.activeBattle.turn = "enemy";
			};
			let updateBattle = () => {
				this.updateBattle();
			};
			let tactics = () => {
				this.battleTactics();
			};

			let div = $("#combatMenu");
			if (div.length === 0) {
				console.log(
					"Error: Attempt to render combat menu but div does not exist."
				);
			} else if (div.html().length > 0) {
				div.empty();
			}
			if (Game.playerCharacter.tactics.length > 0) {
				div.append(
					$("<div>")
						.attr("class", "combatButton")
						.text("Use Tactics")
						.click(tactics)
				);
			}
			// TODO: When hovering over skill, show description and cost
			for (let skillKey of actor.availableSkills) {
				let skillData = lib_skills[skillKey];
				let skillDiv = $("<div>")
					.attr("class", "combatButton")
					.attr(
						"title",
						`${skillData.description}\nAction Points: ${
							skillData.actionPointCost
						}`
					)
					.text(skillData.name);
				if (actor.canCast(skillData)) {
					skillDiv
						.click(() => skillData.action({caster: actor, target: enemies}))
						.click(setEnemyTurn)
						.click(updateBattle);
				} else {
					skillDiv.addClass("combatButtonTooExpensive");
				}
				div.append(skillDiv);
			}
		},

		battleTactics: function() {
			let tactics = this.activeBattle.playerCharacter.tactics;
			let actionFound = false;
			for (const t of tactics) {
				console.log(t);
				if (t.evaluate(this.activeBattle) === true) {
					console.log(`Using ${t.action}`);
					let caster = t.caster(this.activeBattle);
					let target = t.target(this.activeBattle);
					lib_skills[t.action].action(
						{ caster: caster, target: target }
					);
					actionFound = true;
					break;
				}
			}
			if (actionFound === true) {
				// TODO: Take enemy turn
				this.activeBattle.turn = "enemy";
				this.updateBattle();
			} else {
				// TODO: Log no suitable tactic found
				Game.addToCombatLog("You haven't planned for this!");
				console.log("No suitable tactic found.");
			}
		},

		addToCombatLog: function(logMsg) {
			let log = $("#combatLog");
			if (log.length !== 0) {
				// Check if scrolled to bottom before appending message
				let isScrolledToBottom =
					log[0].scrollHeight - log[0].clientHeight <= log[0].scrollTop + 1;
				log.append(
					$("<p>")
						.attr("class", "combatText")
						.text(logMsg)
				);
				// If previously scrolled to bottom, move log to bottom of text once more
				if (isScrolledToBottom) {
					log[0].scrollTop = log[0].scrollHeight - log[0].clientHeight;
				}
			} else {
				console.log(
					`Error: Combat log does not exist. Target string: ${logMsg}`
				);
			}
		},
		
		addSettingsToSidebar: function() {
			let sidebar = $("#character-menu");
			sidebar.append(
				$("<div>")
					.attr("id", "show-settings")
					.text("Settings")
					.click(() => {
						Game.settingsView.render();
					})[0]
			);
		},

		addCharacterToSidebar: function() {
			let sidebar = $("#character-menu");
			sidebar.append(
				$("<div>")
					.attr("id", "show-character")
					.text("Character")
					.click(() => {
						this.renderCharacter();
					})[0]
			);
		},

		renderCharacter: function() {
			$("#main-content").empty();
			Game.characterView.render(this.activeBattle);
			if (this.activeBattle != null) {
				$("#main-content").append($("<div>")
																 .text("Return to battle")
																 .attr("class", "button")
																 .click(() => {
					this.startBattle(this.activeBattle)
				}))
			}
		},

		//Text is the text displayed
		// Location is the KEY of the location in zones
		addLocationToSidebar: function(text, location) {
			$("#location-menu").append(
				$("<div>")
					.attr("id", location)
					.text(text)
					.click(() => {
						if (this.activeBattle == null) {
							this.loadLocation(location);
						}
					})[0]
			);
		},

		loadLocation: function(locationKey) {
			console.log(`Moving page view to ${locationKey}`);
			this.currentLocation = locationKey;
			$("#location-menu").empty();
			for (let neighbour of zones[locationKey].neighbouringLocations) {
				this.addLocationToSidebar(zones[neighbour].name, neighbour);
			}
			$("#main-content").empty();
			console.log(locationKey);
			zones[locationKey].render($("#location-menu"), $("#main-content"));
		},

		characterCreation: function() {
			Game.playerCharacter.title = "Vagrant";
			let genderSelect = () => {
				$("#main-content").text("You are a: ");
				$("#main-content")
					.append(
						$("<div>")
							.attr("id", "button")
							.attr("class", "button")
							.text("Man")
							.click(() => {
								Game.playerCharacter.gender = "Male";
								this.initialClassSelect();
							})[0]
					)
					.append(
						$("<div>")
							.attr("id", "button")
							.attr("class", "button")
							.text("Woman")
							.click(() => {
								console.log("Player chose: Woman");
								this.initialClassSelect();
							})[0]
					);
			};
			let nameSelect = () => {
				$("#main-content").text("Your name is: ");
				$("#main-content").append(
					$('<input type="text">').attr("id", "name-field")
				).append($("<br>"));
				$("#main-content").append(
					$("<div>")
						.attr("class", "button")
						.text("Confirm")
						.click(() => {
							Game.playerCharacter.name = $("#name-field").val();
							Game.header.update();
							genderSelect();
						})
				);
			};
			nameSelect();
		},

		//TODO: Tidy this, move all to jQuery
		initialClassSelect: function() {
			let mainContent = document.getElementById("main-content");
			mainContent.innerHTML = `You awaken in a clearing, with no recollection how you arrived. Your memories are foggy, but judging from your attire you're pretty sure you are a:`;
			// TODO: Dynamically resize table to fit screen and support more class options
			let table = document.createElement("table");
			// $(table).css("border-collapse", "separate");
			$(table).attr("id", "characterClasses");
			let tableBody = document.createElement("tBody");
			let row = document.createElement("tr");
			for (const [key, val] of Object.entries(actorClasses)) {
				let cell = document.createElement("td");
				cell.innerHTML = val.outputToBlock();
				cell.innerHTML += "<br><br>";
				row.appendChild(cell);
				let button = $("<div>")
					.attr("id", "button")
					.attr("class", "button")
					.text(`Choose ${val.name}`)
					.click(() => {
						//TODO: Define function outside of loop
						console.log(`Player chose class: ${val.name}`);
						this.initialiseActorClass(val, Game.playerCharacter);
						//TODO: Add choice confirmation
						this.loadLocation("intro_road");
						this.addCharacterToSidebar();
						this.addSettingsToSidebar();
					});
				// cell.appendChild(button[0]);
				$(cell).append(button[0]);
			}
			tableBody.appendChild(row);
			table.appendChild(tableBody);
			mainContent.appendChild(table);
			// div.append($(table));
			// $(mainContent).append(div);
		},

		// Initialise actor values from class bonuses
		initialiseActorClass: function(actorClass, actor) {
			console.log(`Initialising primary actor as ${actorClass.name}`);
			actor.class = actorClass.name;
			actor.availableSkills = actorClass.availableSkills;
			for (const [key, val] of Object.entries(actorClass.startingBonus)) {
				if (val.constructor != Array) {
					actor[key] += val;
				} else {
					actor[key] = actor[key].concat(val);
				}
			}
			actor.statGrowth = actorClass.statGrowth;
			actor.evaluateUnlockedSkills();
			console.log(actor);
		},

		clearView: function() {
			$("#location-menu").text("");
			$("#character-menu").text("");
			$("#header-content").text("");
			$("#main-content").text("");
		},

		clearMainView: function() {
			$("#main-content").text("");
		},

		randomListElement: function(list) {
			return list[Math.floor(Math.random() * list.length)];
		},

		renderFooter: function() {
			$("#footer-content")
				.empty()
				.append(
					$("<div>")
						.attr("id", "save")
						.attr("class", "button")
						.attr("style", "float:left")
						.text("Save")
						.click(() => {
							localStorage.setItem(
								"playerCharacter",
								JSON.stringify(playerCharacter)
							);
							console.log("Character saved");
							//TODO: Alert player
						})
				)
				.append(
					$("<div>")
						.attr("id", "reset")
						.attr("class", "button")
						.attr("style", "float:left")
						.text("Reset")
						.click(() => {
							this.deleteSave();
						})
				)
				.append(
					$("<div>")
						.attr("class", "button")
						.attr("style", "float:left")
						.text("Debug: Log PC")
						.click(() => {
							console.log(Game.playerCharacter);
						})
				);
		},

		deleteSave() {
			//TODO: Add warning
			localStorage.removeItem("playerCharacter");
			console.log("Deleted character data");
			this.clearView();
			this.init();
		}
	});
})();

$(function() {
	Game.init();
});

class Battle {
	constructor(playerCharacter, enemy) {
		this.turn = "playerCharacter";
		this.playerCharacter = playerCharacter;
		this.enemy = enemy;
	}

	// Take actor and enemy, then run the combat engine. Zone optional in case later add effects
	// Based on zone. Enemies list in case multiple enemies
	// Move to separate file, implement as class so we can control state with instance variables?
	// Keep global vars to minimum

	update() {
		console.log(this.enemy);
		if (this.enemy.currentHealth <= 0) {
			Game.addToCombatLog(`You defeated the ${this.enemy.name}.`);
		} else if (this.turn != "playerCharacter") {
			if (this.playerCharacter.companions.length > 0) {
				// Companions attack if not occupied
			}
			this.enemy.takeBattleTurn(this.playerCharacter);
			this.turn = "playerCharacter";
		}
	}
}
