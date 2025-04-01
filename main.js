//Discord initialisation
const Discord = require("discord.js");
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

//Node.js imports
var fs = require('fs');

client.once('ready', () => {
	console.log("[Ampersand] is ready. Hello!");
});

client.login('Njg4OTYyMTQ1MTU2NTk1NzQz.XpndcA.vhSP6JZWKMLEnmB-amd-0YjmqtA');

/*

TYPES OF UNITS

Infantry
Artillery
Cavalry/Tanks
carriers/Aircraft Carriers
frigates/Nuclear frigates

Fighters/Multirole Fighters
Bombers/Strategic Bombers

*/

//Bot settings
{
	bot_prefix = "$";
	start_date = new Date(2020, 03, 26, 16, 09);
	turn_timer = 60;
	announcements_channel = "549004372747747338";
	authorised_role = "";
}

government_list = ["democracy","monarchy","dictatorship","oligarchy","republic"];

var config = {
	materials: ["horses","coal","iron","petrol","aluminium","cotton","copper","nutmeg","crab","spices","gold","salt","wine","pepper","sugar","wood"],
	buildings: ["drill_shafts","coal_mines","iron_mines","steelworks","hunters","greenhouses","eateries","resource_depots","mines","watermills","factories","heat_generators","signal_towers","pastures","refineries","aluminium_mines","plantations","copper_mines","nutmeg_farms","fisheries","spice_plantations","gold_mines","salt_mines","wineries","pepper_farms","sugar_plantations","barracks","aeroports","factories","dockyards","lumberyards"],
	units: ["infantry","fighters","tanks","frigates","carriers"],
	visible_units: ["infantry","fighters","tanks","frigates","carriers"],
	visible_buildings: ["aluminium_mines","coal_mines","copper_mines","plantations","fisheries","gold_mines","pastures","steelworks","nutmeg_farms","pepper_farms","refinery","salt_mines","spice_plantations","sugar_plantations","wineries","barracks","lumberyards","aeroports","factories","dockyards"]
};

let rawdata = fs.readFileSync('database.js');
let main = JSON.parse(rawdata);

function readConfig () {
	let rawconfig = fs.readFileSync('config.txt');
	eval(rawconfig.toString());
}

readConfig();

let rawhelp = fs.readFileSync('help.txt');
var help = rawhelp.toString().replace(/@/g, bot_prefix);

let rawhelp2 = fs.readFileSync('help2.txt');
var help2 = rawhelp2.toString().replace(/@/g, bot_prefix);

let rawbuildcosts = fs.readFileSync('documents/build_costs.txt');
var buildcosts = rawbuildcosts.toString();

let rawunitcosts = fs.readFileSync('documents/unit_costs.txt');
var unitcosts = rawunitcosts.toString();

let rawgovernments = fs.readFileSync('documents/governments.txt');
var governments = rawgovernments.toString();

user = "";
input = "";

building_list = [];
news = [];

//Framework
{
	//Operating functions
		
	function randomNumber(min, max) {  
		return Math.floor(Math.random() * (max - min) + min); 
	}
	
	function saveConfig () {
		var bot_settings = [
			'bot_prefix = "' + bot_prefix + '";',
			'start_date = new Date(2020, 03, 26, 16, 09);',
			'turn_timer = ' + turn_timer + ';',
			'announcements_channel = "' + announcements_channel + '";',
			'authorised_role = "' + authorised_role + '";'
		];
		fs.writeFile('config.txt', bot_settings.join("\n"), function (err,data) {
			if (err) {
				return console.log(err);
			}
			//console.log(data);
		});
	}
	
	function equalsIgnoreCase (arg0, arg1) {
		if (arg0.toLowerCase() == (bot_prefix + arg1).toLowerCase()) {
			return true;
		} else {
			return false;
		}
	}
	
	function returnMention (arg0) {
		
		var mention_id = arg0.replace(/(<)(@)(!)/g,"");
		mention_id = mention_id.replace(/(<)(@)/g,"");
		mention_id = mention_id.replace(">","");
		
		return mention_id;
	}
	
	function returnChannel (arg0) {
		return client.channels.cache.get(arg0);
	}
	
	function parseMilliseconds (duration) {
		var milliseconds = parseInt((duration % 1000) / 100),
		seconds = Math.floor((duration / 1000) % 60),
		minutes = Math.floor((duration / (1000 * 60)) % 60),
		hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

		return hours + " hours, " + minutes + " minutes, " + seconds + " seconds";
	}
	
	function hasRole (arg0_msg, arg1_role) {
		if (arg0_msg.member.roles.cache.some(role => role.name === arg1_role)) {
			return true;
		} else {
			return false;
		}
	}

	function nextTurn (arg0_user) {
		var user_id = main.users[arg0_user];
		var age = main.users[arg0_user].technology_level-1;
		var buildings = main.users[arg0_user]["buildings"];
		var inventory = main.users[arg0_user]["inventory"];
		
		//News variables:
		
		var national_news = "";
		
		//Building income
		{
			var income = (buildings.lumberyards*300)+(buildings.fisheries*350)+(buildings.pastures*500)+(buildings.pepper_farms*700)+(buildings.plantations*500)+(buildings.sugar_plantations*750)+(buildings.nutmeg_farms*800)+(buildings.wineries*500)+(buildings.coal_mines*700)+(buildings.spice_plantations*800)+(buildings.copper_mines*900)+(buildings.aluminium_mines*800)+(buildings.steelworks*1000)+(buildings.salt_mines*900)+(buildings.refineries*1500)+(buildings.gold_mines*1500);
			
			var old_income = income;
			
			if (inventory.wood < buildings.lumberyards) {
				income = income - ((buildings.lumberyards-inventory.wood)*300);
				national_news = national_news + ("\n " + buildings.lumberyards-inventory.wood + " lumberyards were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.crab < buildings.fisheries) {
				income = income - ((buildings.fisheries-inventory.crab)*350);
				national_news = national_news + ("\n " + buildings.fisheries-inventory.crab + " fisheries were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.horses < buildings.pastures) {
				income = income - ((buildings.pastures-inventory.horses)*500);
				national_news = national_news + ("\n " + buildings.pastures-inventory.horses + " pastures were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.pepper < buildings.pepper_farms) {
				income = income - ((buildings.pepper_farms-inventory.pepper)*700);
				national_news = national_news + ("\n " + buildings.pepper_farms-inventory.pepper + " pepper farms were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.cotton < buildings.plantations) {
				income = income - ((buildings.plantations-inventory.cotton)*500);
				national_news = national_news + ("\n " + buildings.plantations-inventory.cotton + " plantations were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.sugar < buildings.sugar_plantations) {
				income = income - ((buildings.sugar_plantations-inventory.sugar)*750);
				national_news = national_news + ("\n " + buildings.sugar_plantations-inventory.sugar + " sugar plantations were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.nutmeg < buildings.nutmeg_farms) {
				income = income - ((buildings.nutmeg_farms-inventory.nutmeg)*800);
				national_news = national_news + ("\n " + buildings.nutmeg_farms-inventory.nutmeg + " nutmeg farms were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.wine < buildings.wineries) {
				income = income - ((buildings.wineries-inventory.wine)*500);
				national_news = national_news + ("\n " + buildings.wineries-inventory.wine + " wineries were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.coal < buildings.coal_mines) {
				income = income - ((buildings.coal_mines-inventory.coal)*700);
				national_news = national_news + ("\n " + buildings.coal_mines-inventory.coal + " coal mines were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.spices < buildings.spice_plantations) {
				income = income - ((buildings.spice_plantations-inventory.spices)*800);
				national_news = national_news + ("\n " + buildings.spice_plantations-inventory.spices + " spice plantations were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.copper < buildings.copper_mines) {
				income = income - ((buildings.copper_mines-inventory.copper)*900);
				national_news = national_news + ("\n " + buildings.copper_mines-inventory.copper + " copper mines were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.aluminium < buildings.aluminium_mines) {
				income = income - ((buildings.aluminium_mines-inventory.aluminium)*800);
				national_news = national_news + ("\n " + buildings.aluminium_mines-inventory.aluminium + " aluminium mines were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.iron < buildings.steelworks) {
				income = income - ((buildings.steelworks-inventory.iron)*1000);
				national_news = national_news + ("\n " + buildings.steelworks-inventory.iron + " steelworks were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.salt < buildings.salt_mines) {
				income = income - ((buildings.salt_mines-inventory.salt)*900);
				national_news = national_news + ("\n " + buildings.salt_mines-inventory.salt + " salt mines were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.petrol < buildings.refineries) {
				income = income - ((buildings.refineries-inventory.petrol)*1500);
				national_news = national_news + ("\n " + buildings.refineries-inventory.petrol + " refineries were forced to stop operating due to a shortage of resources.");
			}
			
			if (inventory.gold < buildings.gold_mines) {
				income = income - ((buildings.gold_mines-inventory.gold)*1500);
				national_news = national_news + ("\n " + buildings.gold_mines-inventory.gold + " gold mines were forced to stop operating due to a shortage of resources.");
			}
			
			
			user_id.money = user_id.money + income;
			national_news = national_news + ("\n" + user_id.name + " earned :euro: **" +  new Intl.NumberFormat('de', {style: 'decimal'}).format(income) + "**. \nThey now have :euro: **" +  new Intl.NumberFormat('de', {style: 'decimal'}).format(user_id.money) + "**.");
			
			if (old_income > income) {
				national_news = national_news + "\n" + "They lost :euro: **" + (income-old_income)*-1 + "** in revenue.";
			}
		}
			
		news.push(national_news);
		
	}
	
	function mine (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		var mineable_materials = ["coal","iron","iron","iron","lead","gold","petrol","rocks","rocks"];
		
		//["coal","iron","lead","gold","petrol","wood","rocks"],
		var resource_list = "";
		var out_of_actions = false;
		
		for (var i = 0; i < arg2_actions; i++) {
			if (user_id.actions > 0) {
				var random_resource = randomElement(mineable_materials);
				user_id.actions--;
				inventory[random_resource] = inventory[random_resource] + 1;
				resource_list = resource_list + (random_resource + ", ");
			} else {
				out_of_actions = true;
			}
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You dug up " + resource_list + "whilst on your mining haul.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions.");
			}
		}
	}
	
	function forage (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		
		var salvaged_wood = 0;
		var out_of_actions = false;
		
		for (var i = 0; i < arg2_actions; i++) {
			if (user_id.actions > 0) {
				user_id.actions--;
				inventory["wood"] = inventory["wood"] + 1;
				salvaged_wood++;
			} else {
				out_of_actions = true;
			}
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You chopped " + salvaged_wood + " wood.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions.");
			}
		}
	}
	
	function refine (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		
		var refined_steel = 0;
		var out_of_actions = false;
		
		for (var i = 0; i < arg2_actions; i++) {
			if (user_id.steel_actions > 0) {
				if (inventory.coal > 0 && inventory.iron > 0) {
					user_id.steel_actions--;
					inventory.steel++;
					inventory.coal--;
					inventory.iron--;
					refined_steel++;
				}
			} else {
				out_of_actions = true;
			}
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You refined " + refined_steel + " steel.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions or resources.");
			}
		}
	}
	
	function cook (arg0_user, arg1_msg, arg2_actions) {
		var user_id = main.users[arg0_user];
		var inventory = main.users[arg0_user]["inventory"];
		
		var cooked_food = 0;
		var out_of_actions = false;
		
		for (var i = 0; i < arg2_actions; i++) {
			if (user_id.cooking_actions > 0) {
				if (inventory.raw_food >= 1) {
					user_id.cooking_actions--;
					inventory.rations = inventory.rations + 100;
					inventory.raw_food = inventory.raw_food - 1;
					cooked_food = cooked_food + 100;
				}
			} else {
				out_of_actions = true;
			}
		}
		
		if (arg1_msg != "none") {
			arg1_msg.channel.send("You produced " + cooked_food + " rations.");
			if (out_of_actions) {
				arg1_msg.channel.send("You then proceeded to run out of actions or resources.");
			}
		}
	}
	
	function sellGold (arg0_user, arg1_msg, arg2_actions) {
		if (main.users[arg0_user] != undefined) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];
			var auction_list = "";
			var out_of_gold = false;
			
			for (var i = 0; i < arg2_actions; i++) {
				if (inventory.gold > 0) {
					var sold_for = randomNumber(800, 1350);
					inventory.gold--;
					user_id.money = user_id.money + sold_for;
					auction_list = auction_list + "£" + sold_for.toString() + ", ";
				} else {
					out_of_gold = true;
				}
			}
			
			if (auction_list == "") {
				arg1_msg.channel.send("You don't even have gold!");
			} else {
				arg1_msg.channel.send("You sold " + arg2_actions + " gold for " + auction_list + " on the auction block.");
				if (out_of_gold) {
					arg1_msg.channel.send("You then proceeded to run out of gold.");
				}
			}
		} else {
			arg1_msg.channel.send("You don't even have a country!");
		}
	}
	
	function sellPetrol (arg0_user, arg1_msg, arg2_actions) {
		if (main.users[arg0_user] != undefined) {
			var user_id = main.users[arg0_user];
			var inventory = main.users[arg0_user]["inventory"];
			var auction_list = "";
			var out_of_petrol = false;
			
			for (var i = 0; i < arg2_actions; i++) {
				if (inventory.petrol > 0) {
					var sold_for = randomNumber(750, 1000);
					inventory.petrol--;
					user_id.money = user_id.money + sold_for;
					auction_list = auction_list + "£" + sold_for.toString() + ", ";
				} else {
					out_of_petrol = true;
				}
			}
			
			if (auction_list == "") {
				arg1_msg.channel.send("You don't even have petrol!");
			} else {
				arg1_msg.channel.send("You sold " + arg2_actions + " petrol for " + auction_list + " on the auction block.");
				if (out_of_petrol) {
					arg1_msg.channel.send("You then proceeded to run out of petrol.");
				}
			}
		} else {
			arg1_msg.channel.send("You don't even have a country!");
		}
	}
	
	function setGovernment (arg0_user, arg1_type) {
		var user_id = arg0_user;
		user_id.government = arg1_type;
		user_id["politics"][arg1_type] = 100;
		if (arg1_type == "democracy") {
			user_id.manpower_percentage = 0.05;
			user_id.max_tax = 1.00;
			user_id.civilian_actions_percentage = 0.50;
		} else if (arg1_type == "monarchy") {
			user_id.manpower_percentage = 0.05;
			user_id.max_tax = 0.50;
			user_id.civilian_actions_percentage = 0.10;
		} else if (arg1_type == "dictatorship") {
			user_id.manpower_percentage = 0.15;
			user_id.max_tax = 0.70;
			user_id.civilian_actions_percentage = 0.00;
		} else if (arg1_type == "oligarchy") {
			user_id.manpower_percentage = 0.10;
			user_id.max_tax = 0.60;
			user_id.civilian_actions_percentage = 0.10;
		} else if (arg1_type == "republic") {
			user_id.manpower_percentage = 0.03;
			user_id.max_tax = 0.50;
			user_id.civilian_actions_percentage = 0.30;
		}
	}
	
	//Command functions
	{
		function randomElement (arg0_array) {
			return arg0_array[Math.floor(Math.random() * arg0_array.length)];
		}
		
		function initVar (arg0_variable, arg1_value) {
			if (arg0_variable == undefined) {
				arg0_variable = arg1_value;
			}
		}			
		
		function initUser (arg0_user) {
			var current_user = arg0_user.toString();
			var already_registered = false;
			for (var i = 0; i < main.user_array.length; i++) {
				if (main.user_array[i] == current_user) {
					already_registered = true;
				}
			}
			
			if (main.users[current_user] == undefined) { main.users[current_user] = {}; }
			if (main.users[current_user].name == undefined) { main.users[current_user].name = ""; }
			if (main.users[current_user].government == undefined) { main.users[current_user].government = ""; }
			if (main.users[current_user].technology_level == undefined) { main.users[current_user].technology_level = 3; }
			if (main.users[current_user].population == undefined) { main.users[current_user].population = 10000000; }
			if (main.users[current_user].used_manpower == undefined) { main.users[current_user].used_manpower = 0; }
			if (main.users[current_user].initial_manpower == undefined) { main.users[current_user].initial_manpower = 5000000; }
			if (main.users[current_user].scientists == undefined) { main.users[current_user].scientists = 0; }
			if (main.users[current_user].manpower_percentage == undefined) { main.users[arg0_user].manpower_percentage = 0.50; }
			if (main.users[current_user].money == undefined) { main.users[current_user].money = 10000; }
			if (main.users[current_user].stability == undefined) { main.users[current_user].stability = 50; }
			if (main.users[current_user].coup_this_turn == undefined) { main.users[current_user].coup_this_turn = false; }
			if (main.users[current_user].overthrow_this_turn == undefined) { main.users[current_user].overthrow_this_turn = false; }
			
			if (main.users[current_user].news_this_turn == undefined) { main.users[current_user].news_this_turn = ""; }
			
			//Modifiers
			if (main.users[current_user].tax_rate == undefined) { main.users[current_user].tax_rate = 0; }
			if (main.users[current_user].max_tax == undefined) { main.users[current_user].max_tax = 0; }
			if (main.users[current_user].pop_available == undefined) { main.users[current_user].pop_available = 0.5; }
			
			if (main.users[current_user].production_buildings_modifier == undefined) { main.users[current_user].production_buildings_modifier = 1; }
			if (main.users[current_user].pop_growth_modifier == undefined) { main.users[current_user].pop_growth_modifier = 1.0539; }
			
			//Evacuation
			if (main.users[current_user].transferred_pop == undefined) { main.users[current_user].transferred_pop = 0; }
			if (main.users[current_user].evacuated_pop == undefined) { main.users[current_user].evacuated_pop = 0; }
			
			//Laws
			if (main.users[current_user].drastic_measures == undefined) { main.users[current_user].drastic_measures = false; }
			
			//Sub-objects
			if (main.users[current_user]["inventory"] == undefined) { main.users[current_user]["inventory"] = {}; }
			if (main.users[current_user]["buildings"] == undefined) { main.users[current_user]["buildings"] = {}; }
			if (main.users[current_user]["military"] == undefined) { main.users[current_user]["military"] = {}; }
			if (main.users[current_user]["politics"] == undefined) { main.users[current_user]["politics"] = {}; }
			if (main.users[current_user]["endgame"] == undefined) { main.users[current_user]["endgame"] = {}; }
			if (main.users[current_user]["in_transfer"] == undefined) { main.users[current_user]["in_transfer"] = {}; }
			
			//Crafting values
			if (main.users[current_user].actions == undefined) { main.users[current_user].actions = 10; }
			
			if (main.users[current_user].steel_actions == undefined) { main.users[current_user].steel_actions = 0; }
			if (main.users[current_user].cooking_actions == undefined) { main.users[current_user].cooking_actions = 0; }
			if (main.users[current_user].auto_cook == undefined) { main.users[current_user].auto_cook = false; }
			
			if (main.users[current_user].civilian_actions == undefined) { main.users[current_user].civilian_actions = 0; }
			if (main.users[current_user].civilian_actions_percentage == undefined) { main.users[current_user].civilian_actions_percentage = 0; }
			
			//Modifiers - Only staff can set these
			if (main.users[current_user].blockaded == undefined) { main.users[current_user].blockaded = false; }
			
			//Add all materials to inventory
			for (var i = 0; i < config.materials.length; i++) {
				if (main.users[current_user]["inventory"][config.materials[i]] == undefined) { main.users[current_user]["inventory"][config.materials[i]] = 0; }
			}
			
			//Add all buildings
			for (var i = 0; i < config.buildings.length; i++) {
				if (main.users[current_user]["buildings"][config.buildings[i]] == undefined) { main.users[current_user]["buildings"][config.buildings[i]] = 0; }
			}
			
			//Add all political parties
			for (var i = 0; i < government_list.length; i++) {
				if (main.users[current_user]["politics"][government_list[i]] == undefined) { main.users[current_user]["politics"][government_list[i]] = 0; }
			}
			
			//Add all military units
			for (var i = 0; i < config.units.length; i++) {
				if (main.users[current_user]["military"][config.units[i]] == undefined) { main.users[current_user]["military"][config.units[i]] = 0; }
			}
			
			if (main.users[current_user].last_election == undefined) { main.users[current_user].last_election = 0; }
			
			if (already_registered == false) {
				main.user_array.push(current_user);
				main.users[current_user].money = 10000;
			}
		}
		
		function activate (arg0_user, arg1_name, arg2_message) {
			var msg = arg2_message;
			var usr = main.users[arg0_user];
			
			var actions_per_turn = usr["buildings"].mines + usr["buildings"].watermills*2 + usr["buildings"].factories*3;
			console.log(actions_per_turn);
			
			if (arg1_name == "drastic_measures") {
				if (usr.drastic_measures == false) {
					if (actions_per_turn < 50) {
						msg.channel.send("You have employed drastic measures! As your civilian populace recognises the need for 24-hour shifts, you gain 150 actions.");
						usr.actions = usr.actions + 150;
						usr.drastic_measures = true;
						usr.news_this_turn = usr.news_this_turn + "\n" + usr.name + " employed drastic measures to allow their citizens to survive the apocalypse.";
					}
				} else if (usr.drastic_measures == true) {
					msg.channel.send("Your people can't work 48-hour shifts!");
				}
			}
		}
		
		function modifyItem (arg0_user, arg1_amount, arg2_item, arg3_mode) {
			
			var current_user = arg0_user.toString();
			
			if (arg3_mode == "add") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] + parseInt(arg1_amount);
				}
			} else if (arg3_mode == "remove") {
				if (main.users[current_user] == undefined) {
					initUser(current_user);
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				} else {
					main.users[current_user]["inventory"][arg2_item] = main.users[current_user]["inventory"][arg2_item] - parseInt(arg1_amount);
				}
			}
			
		}
		
		function transfer (arg0_user, arg2_amount, arg3_item, arg4_message) {
			var msg = arg4_message;
			var usr = main.users[arg0_user];
			if (main.users[arg0_user] != undefined) {
				var item_exists = false;
				
				for (var i = 0; i < config.materials.length; i++) {
					if (arg3_item == config.materials[i]) {
						item_exists = true;
					}
				}
				
				if (item_exists) {
					var total_resources_transferred = 0;
					for (var i = 0; i < config.materials.length; i++) {
						total_resources_transferred = total_resources_transferred + usr["in_transfer"][config.materials[i]];
					}
					
					if (total_resources_transferred >= usr["military"].icebreakers*10) {
						msg.channel.send("Your icebreakers are already over-capacity for this turn!");
					} else {
						if (total_resources_transferred+arg2_amount > usr["military"].icebreakers*10) {
							msg.channel.send("Your icebreakers can't handle that many resources!");
						} else {
							if (usr["inventory"][arg3_item] >= arg2_amount) {
								usr["inventory"][arg3_item] = usr["inventory"][arg3_item] - arg2_amount;
								usr["in_transfer"][arg3_item] = usr["in_transfer"][arg3_item] + arg2_amount;
								
								msg.channel.send("You sent " + arg2_amount + " " + arg3_item + " off on your icebreakers.");
							}
						}
					}
				}
			} else {
				msg.channel.send("You don't even have a country!");
			}
		}
		
		function evacuate (arg0_user, arg1_message) {
			var msg = arg1_message;
			
			if (main.users[arg0_user] != undefined) {
				var usr = main.users[arg0_user];
				
				if (usr.population > usr["military"].landnoughts*1000) {
					if (usr.transferred_pop == 0) {
						if (usr["military"].landnoughts > 0) {
							usr.population = usr.population - usr["military"].landnoughts*1000;
							usr.transferred_pop = usr["military"].landnoughts*1000;
							msg.channel.send("Your landnoughts set out with " + usr.transferred_pop + " souls.");
							usr.news_this_turn = usr.news_this_turn + ("\n" + usr.name + " evacuated " + usr.transferred_pop + " souls.");
						} else {
							msg.channel.send("You don't have any landnoughts!");
						}
					} else {
						msg.channel.send("You're already transferring everyone you can this turn!");
					}
				} else {
					msg.channel.send("You no longer have that many people. You evacuated everyone you could, which accounted for " + usr.population + " souls.");
					usr.population = 0;
					usr.transferred_pop = usr.population;
					usr.news_this_turn = usr.news_this_turn + ("\n" + usr.name + " evacuated their remaining population, accounting for " + usr.transferred_pop + " souls.");
				}
			} else {
				msg.channel.send("You don't even have a country!");
			}
		}
		
		function give (arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message) {
			if (main.users[arg0_user] != undefined) {
				var usr = main.users[arg0_user];
				var other_usr_id = arg1_user2.replace(/(<)(@)(!)/g,"");
				var other_usr_id = arg1_user2.replace(/(<)(@)/g,"");
				var other_usr = main.users[other_usr_id];
				
				var inventory = main.users[arg0_user]["inventory"];
				console.log(other_usr_id);
				if (arg4_mode == "item") {
					if (arg3_item == "money") {
						if (usr.money >= arg2_amount) {
							usr.money = parseInt(usr.money) - parseInt(arg2_amount);
							other_usr.money = parseInt(other_usr.money) + parseInt(arg2_amount);
							arg5_message.channel.send("You sent <@" + other_usr_id + "> " + arg2_amount + " money.");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of money.");
						}
					} else {
						var item_exists = false;
						for (var i = 0; i < config.materials.length; i++) {
							if (arg3_item == config.materials[i]) {
								item_exists = true;
							}
						}
						if (item_exists) {
							if (inventory[arg3_item] >= arg2_amount) {
								inventory[arg3_item] = parseInt(inventory[arg3_item]) - parseInt(arg2_amount);
								other_usr["inventory"][arg3_item] = parseInt(other_usr["inventory"][arg3_item]) + parseInt(arg2_amount);
								arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
							} else {
								arg5_message.channel.send("You were unable to execute this command due to a shortage of items.");
							}
						} else {
							arg5_message.channel.send("The item you are trying to send is nonexistent!");
						}
					}
				} else if (arg4_mode == "industry") {
					var building_exists = false;
					for (var i = 0; i < config.buildings.length; i++) {
						if (arg3_item == config.buildings[i]) {
							building_exists = true;
						}
					}
					if (building_exists) {
						if (usr["buildings"][arg3_item] >= arg2_amount) {
							usr["buildings"][arg3_item] = parseInt(usr["buildings"][arg3_item]) - parseInt(arg2_amount);
							other_usr["buildings"][arg3_item] = parseInt(other_usr["buildings"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of buildings.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				} else if (arg4_mode == "military") {
					var unit_exists = false;
					for (var i = 0; i < config.units.length; i++) {
						if (arg3_item == config.units[i]) {
							unit_exists = true;
						}
					}
					if (unit_exists) {
						if (usr["military"][arg3_item] >= arg2_amount) {
							usr["military"][arg3_item] = parseInt(usr["military"][arg3_item]) - parseInt(arg2_amount);
							other_usr["military"][arg3_item] = parseInt(other_usr["military"][arg3_item]) + parseInt(arg2_amount);
							arg5_message.channel.send("You gave <@" + other_usr_id + "> " + arg2_amount + " " + arg3_item + ".");
						} else {
							arg5_message.channel.send("You were unable to execute this command due to a shortage of military units.");
						}
					} else {
						arg5_message.channel.send("The item you are trying to send is nonexistent!");
					}
				}
			} else {
				arg5_message.channel.send("The person you are trying to give items to doesn't even have a country!");
			}
		}
		
		function printInv (arg0_user, arg1_username, arg2_msg) {
			var inv_string = [];
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no inventory!");
			} else {
			
				inv_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				inv_string.push("------------------ \n:evergreen_tree: **Materials:**\n");
				
				for (var i = 0; i < config.materials.length; i++) {
					if (main.users[arg0_user]["inventory"][config.materials[i]] != undefined) {
						inv_string.push("**" + config.materials[i] + "**: " + main.users[arg0_user]["inventory"][config.materials[i]]);
					}
				}
					
				arg2_msg.channel.send(inv_string.join("\n"));
				
				
			}
		}
		
		function printBuildings (arg0_user, arg1_username, arg2_msg) {
			var building_string = [];
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for is stateless!");
			} else {
				building_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				building_string.push("------------------ \n :homes: **Buildings:**\n");
						
				//var minimum = (main.users[arg0_user]["buildings"]["resource_depots"] + main.users[arg0_user]["buildings"]["mines"]*3 + main.users[arg0_user]["buildings"]["factories"]*5)+5;
				//var maximum = (main.users[arg0_user]["buildings"]["resource_depots"] + main.users[arg0_user]["buildings"]["mines"]*5 + main.users[arg0_user]["buildings"]["factories"]*10)+5;
				
				var buildings = main.users[arg0_user]["buildings"];
				var inventory = main.users[arg0_user]["inventory"];
				
				var income = (buildings.lumberyards*300)+(buildings.fisheries*350)+(buildings.pastures*500)+(buildings.pepper_farms*700)+(buildings.plantations*500)+(buildings.sugar_plantations*750)+(buildings.nutmeg_farms*800)+(buildings.wineries*500)+(buildings.coal_mines*700)+(buildings.spice_plantations*800)+(buildings.copper_mines*900)+(buildings.aluminium_mines*800)+(buildings.steelworks*1000)+(buildings.salt_mines*900)+(buildings.refineries*1500)+(buildings.gold_mines*1500);
				
				for (var i = 0; i < config.buildings.length; i++) {
					if (main.users[arg0_user]["buildings"][config.buildings[i]] != undefined) {
						
						if (config.buildings[i] == "lumberyards") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*300 + " each turn.");
						} else if (config.buildings[i] == "fisheries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*350 + " each turn.");
						} else if (config.buildings[i] == "pastures") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*500 + " each turn.");
						} else if (config.buildings[i] == "pepper_farms") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*700 + " each turn.");
						} else if (config.buildings[i] == "plantations") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*500 + " each turn.");
						} else if (config.buildings[i] == "sugar_plantations") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*750 + " each turn.");
						} else if (config.buildings[i] == "nutmeg_farms") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*800 + " each turn.");
						} else if (config.buildings[i] == "wineries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*500 + " each turn.");
						} else if (config.buildings[i] == "coal_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*700 + " each turn.");
						} else if (config.buildings[i] == "spice_plantations") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*800 + " each turn.");
						} else if (config.buildings[i] == "copper_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*900 + " each turn.");
						} else if (config.buildings[i] == "aluminium_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*800 + " each turn.");
						} else if (config.buildings[i] == "steelworks") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*1000 + " each turn.");
						} else if (config.buildings[i] == "salt_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*900 + " each turn.");
						} else if (config.buildings[i] == "refineries") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*1500 + " each turn.");
						} else if (config.buildings[i] == "gold_mines") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", providing you with :euro: " + main.users[arg0_user]["buildings"][config.buildings[i]]*1500 + " each turn.");
						} else if (config.buildings[i] == "barracks") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", allowing you to recruit infantry.");
						} else if (config.buildings[i] == "factories") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", allowing you to build tanks.");
						} else if (config.buildings[i] == "dockyards") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", allowing you to launch frigates and carriers.");
						} else if (config.buildings[i] == "aeroports") {
							building_string.push("You have **" + main.users[arg0_user]["buildings"][config.buildings[i]] + "** " + config.buildings[i] + ", allowing you to scramble fighter jets.");
						}
					}
				}
				
				if (inventory.wood < buildings.lumberyards) {
					income = income - ((buildings.lumberyards-inventory.wood)*300);
				}
				
				if (inventory.crab < buildings.fisheries) {
					income = income - ((buildings.fisheries-inventory.crab)*350);
				}
				
				if (inventory.horses < buildings.pastures) {
					income = income - ((buildings.pastures-inventory.horses)*500);
				}
				
				if (inventory.pepper < buildings.pepper_farms) {
					income = income - ((buildings.pepper_farms-inventory.pepper)*700);
				}
				
				if (inventory.cotton < buildings.plantations) {
					income = income - ((buildings.plantations-inventory.cotton)*500);
				}
				
				if (inventory.sugar < buildings.sugar_plantations) {
					income = income - ((buildings.sugar_plantations-inventory.sugar)*750);
				}
				
				if (inventory.nutmeg < buildings.nutmeg_farms) {
					income = income - ((buildings.nutmeg_farms-inventory.nutmeg)*800);
				}
				
				if (inventory.wine < buildings.wineries) {
					income = income - ((buildings.wineries-inventory.wine)*500);
				}
				
				if (inventory.coal < buildings.coal_mines) {
					income = income - ((buildings.coal_mines-inventory.coal)*700);
				}
				
				if (inventory.spices < buildings.spice_plantations) {
					income = income - ((buildings.spice_plantations-inventory.spices)*800);
				}
				
				if (inventory.copper < buildings.copper_mines) {
					income = income - ((buildings.copper_mines-inventory.copper)*900);
				}
				
				if (inventory.aluminium < buildings.aluminium_mines) {
					income = income - ((buildings.aluminium_mines-inventory.aluminium)*800);
				}
				
				if (inventory.iron < buildings.steelworks) {
					income = income - ((buildings.steelworks-inventory.iron)*1000);
				}
				
				if (inventory.salt < buildings.salt_mines) {
					income = income - ((buildings.salt_mines-inventory.salt)*900);
				}
				
				if (inventory.petrol < buildings.refineries) {
					income = income - ((buildings.refineries-inventory.petrol)*1500);
				}
				
				if (inventory.gold < buildings.gold_mines) {
					income = income - ((buildings.gold_mines-inventory.gold)*1500);
				}
				
				building_string.push("\n:euro: **Income** per turn: " + income + " per round.");
					
				arg2_msg.channel.send(building_string.join("\n"));
			}
		}
		
		function printStats (arg0_user, arg1_username, arg2_msg) {
			var stats_string = [];
			var minimum = main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["watermills"]*2 + main.users[arg0_user]["buildings"]["factories"]*3;
			var maximum = main.users[arg0_user]["buildings"]["mines"] + main.users[arg0_user]["buildings"]["watermills"]*2 + main.users[arg0_user]["buildings"]["factories"]*5;
			var buildings = main.users[arg0_user]["buildings"];
			
			if (main.users[arg0_user] == undefined) {
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				var percentage_manpower = main.users[arg0_user].manpower_percentage*100;
				var income = (buildings.lumberyards*300)+(buildings.fisheries*350)+(buildings.pastures*500)+(buildings.pepper_farms*700)+(buildings.plantations*500)+(buildings.sugar_plantations*750)+(buildings.nutmeg_farms*800)+(buildings.wineries*500)+(buildings.coal_mines*700)+(buildings.spice_plantations*800)+(buildings.copper_mines*900)+(buildings.aluminium_mines*800)+(buildings.steelworks*1000)+(buildings.salt_mines*900)+(buildings.refineries*1500)+(buildings.gold_mines*1500);
				
				stats_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stats_string.push(":map: Country: **" + main.users[arg0_user].name + "**");
				stats_string.push("------------------\n");
				stats_string.push(":euro: Money (€): **" + new Intl.NumberFormat('de', {style: 'decimal'}).format(main.users[arg0_user].money) + "**" + " (:euro: **+" + income + "** per turn).");
				//stats_string.push("------------------ \n**Other Modifiers:**\n");
				stats_string.push(":ship: Blockaded: **" + main.users[arg0_user].blockaded + "**");
					
				arg2_msg.channel.send(stats_string.join("\n"));
			}
		}
		
		function printPolitics (arg0_user, arg1_username, arg2_msg) {
			var politics_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				
				politics_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				politics_string.push(":map: Country: " + main.users[arg0_user].name);
				politics_string.push("------------------ \n**Ruling Government:**\n");
				politics_string.push(":classical_building: Government Type: " + main.users[arg0_user].government);
				/*politics_string.push("------------------ \n**Internal Politics:**\n");
				for (var i = 0; i < government_list.length; i++) {
					politics_string.push(main.users[arg0_user]["politics"][government_list[i]] + "% of the population believes in " + government_list[i] + ".");
				}*/
				arg2_msg.channel.send(politics_string.join("\n"));
			}
		}
		
		function printStability (arg0_user, arg1_username, arg2_msg) {
			var stability_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
			} else {
				var user_id = main.users[arg0_user];
				var tax_rate = user_id.tax_rate;
				var ruling_party_popularity = user_id["politics"][user_id.government];
				
				var stab_government_modifier = 0;
				var stab_government_text = "";
				var stab_government_prefix = "";
				
				if (user_id.government != "communism" && user_id.government != "fascism" && user_id.government != "dictatorship" && user_id.government != "monarchy") {
					stab_government_modifier = 5;
					stab_government_text = "due to the current government being a " + user_id.government + ".";
					stab_government_prefix = "+";
				} else {
					stab_government_modifier = -5;
					stab_government_text = "due to an authoritarian regime in power.";
				}
				
				var calculated_stability = Math.ceil(ruling_party_popularity + stab_government_modifier - tax_rate*100)-15;
				
				stability_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				stability_string.push(":map: Country: " + main.users[arg0_user].name);
				stability_string.push("------------------ \n**Stability:**\n");
				stability_string.push("**+" + Math.ceil(ruling_party_popularity) + "%** from ruling party popularity.");
				stability_string.push("**-" + Math.ceil(tax_rate*100) + "%** from current tax rate.");
				stability_string.push("**" + stab_government_prefix + stab_government_modifier + "%** " + stab_government_text);
				stability_string.push("**-15%** from unbearable cold.");
				stability_string.push("------------------ \n**Calculated Stability:**\n");
				stability_string.push(":scales: Calculated Stability: **" + calculated_stability + "%**");
				stability_string.push(":scales: Current Stability: **" + user_id.stability + "%**");
				
				if (calculated_stability < 70) {
					stability_string.push("------------------");
					stability_string.push("You have a :fire: **revolt risk** of **" + (70-calculated_stability) + "%**!");
				}
				
				arg2_msg.channel.send(stability_string.join("\n"));
			}
		}
		
		function printMilitary (arg0_user, arg1_username, arg2_msg) {
			var military_string = [];
			
			if (main.users[arg0_user] == undefined) {	
				arg2_msg.channel.send("The person you are looking for has no country!");
				
			} else {
				military_string.push(":bust_in_silhouette: User: <@" + arg0_user + ">");
				military_string.push(":map: Country: " + main.users[arg0_user].name);
				military_string.push("------------------ \n:guard: **Units:**\n");
				for (var i = 0; i < config.visible_units.length; i++) {
					military_string.push("**" + config.visible_units[i] + "**: " + main.users[arg0_user]["military"][config.visible_units[i]]);
				}
				arg2_msg.channel.send(military_string.join("\n"));
			}
		}
		
		function demolishRequest (arg0_user, arg1_message, arg2_name, arg3_amount) {
			var usr = arg0_user;
			if (main.users[arg0_user] == undefined) {
				arg1_message.channel.send("You don't even have a country!");
			} else {
				var buildings = main.users[usr]["buildings"];
				
				var building_exists = false;
				for (var i = 0; i < config.buildings.length; i++) {
					if (arg2_name == config.buildings[i]) {
						building_exists = true;
					}
				}
				
				if (building_exists) {
					if (buildings[arg2_name] >= arg3_amount) {
						buildings[arg2_name] = buildings[arg2_name] - arg3_amount;
						var local_building_list = ["lumberyards","fisheries","pastures","pepper_farms","plantations","sugar_plantations","nutmeg_farms","wineries","coal_mines","spice_plantations","copper_mines","aluminium_mines","steelworks","salt_mines","refineries","gold_mines","barracks","factories","dockyards","aeroports"];
						var local_building_cost = [700, 1000, 1200, 1400, 1500, 1500, 1800, 2000, 2000, 2000, 2250, 2500, 2500, 3000, 5500, 6000, 2000, 3500, 2000, 2000];
						var local_index = 0;
						
						for (var i = 0; i < local_building_list.length; i++) {
							if (local_building_list[i] == arg2_name) {
								local_index = i;
							}
						}
						main.users[usr].money = main.users[usr].money + local_building_cost[local_index]*arg3_amount;
						
						arg1_message.channel.send("**" + main.users[usr].name + "** was refunded :euro: **" + local_building_cost[local_index]*arg3_amount + "**.");
					} else {
						arg1_message.channel.send("You don't have that many buildings!");
					}
				} else {
					arg1_message.channel.send("This building doesn't even exist!");
				}
			}
		}
		
		function buildRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var inventory = usr["inventory"];
			var print_results = [];
			
			var remaining_manpower = usr.initial_manpower - usr.used_manpower;
			if (arg5_amount > 1) {
				print_results.push("You cannot build multiple buildings of the same type!");
			} else {
				if (arg4_build_request == arg2_name) {
					for (var x = 0; x < arg5_amount; x++) {
						console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
						var checks_passed = 0;
						
						for (var i = 0; i < arg3_costs.length; i++) {
							if (arg3_costs[i][1] == "manpower") {
								if (remaining_manpower >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else if (arg3_costs[i][1] == "money") {
								if (usr.money >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else if (arg3_costs[i][1] == "tech") {
								if (usr.technology_level >= arg3_costs[i][0]) {
									checks_passed++;
								}
							} else {
								if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
									checks_passed++;
								}
							}
						}
						
						if (checks_passed >= arg3_costs.length) {
							var single_object = arg2_name;
							
							for (var i = 0; i < arg3_costs.length; i++) {
								if (arg3_costs[i][1] == "manpower") {
									if (remaining_manpower >= arg3_costs[i][0]) {
										usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
									}
								} else if (arg3_costs[i][1] == "money") {
									if (usr.money >= arg3_costs[i][0]) {
										usr.money = usr.money - arg3_costs[i][0];
									}
								}
							}
							single_object = single_object.replace("factories","factory");
							single_object = single_object.replace("wineries","winery");
							single_object = single_object.replace("fisheries","fishery");
							single_object = single_object.replace("refineries","refinery");
							single_object = single_object.replace(/s$/,"")
							single_object = single_object.replace("barrack","barracks");
							print_results.push("You have successfully built a **" + single_object + "**!");
							
							if (arg2_name == "heat_cores") {
								usr["inventory"][arg2_name]++;
							} else {
								usr["buildings"][arg2_name]++;
							}
						} else {
							print_results.push("You don't have the resources to build this!");
							console.log(print_results.join("\n"));
						}
					}
				
					arg1_message.channel.send(print_results.join("\n"));
				}
			}
		}
		
		function build (arg0_user, arg1_msg, arg2_building, arg3_amount) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var inventory = main.users[arg0_user]["inventory"];
				var result_string = [];
				var building_exists = false;
				
				for (var i = 0; i < config.buildings.length; i++) {
					if (arg2_building == config.buildings[i]) {
						building_exists = true;
					}
				}
				
				if (arg2_building == "heat_cores") {
					building_exists = true;
				}
				
				if (building_exists) {
					//buildRequest(usr, arg1_msg, "farms", [[10, "lumber"], [5, "iron"], [1500, "money"], [500, "manpower"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "lumberyards", [[700, "money"], [1, "wood"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "fisheries", [[1000, "money"], [1, "crab"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "pastures", [[1200, "money"], [1, "horses"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "pepper_farms", [[1400, "money"], [1, "pepper"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "plantations", [[1500, "money"], [1, "cotton"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "sugar_plantations", [[1500, "money"], [1, "sugar"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "nutmeg_farms", [[1800, "money"], [1, "nutmeg"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "wineries", [[2000, "money"], [1, "wine"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "coal_mines", [[2000, "money"], [1, "coal"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "spice_plantations", [[2000, "money"], [1, "spices"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "copper_mines", [[2250, "money"], [1, "copper"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "aluminium_mines", [[2500, "money"], [1, "aluminium"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "steelworks", [[2500, "money"], [1, "iron"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "salt_mines", [[3000, "money"], [1, "salt"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "refineries", [[5500, "money"], [1, "petrol"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "gold_mines", [[6000, "money"], [1, "gold"]], arg2_building, arg3_amount);
					
					buildRequest(usr, arg1_msg, "barracks", [[2000, "money"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "factories", [[3500, "money"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "dockyards", [[4000, "money"]], arg2_building, arg3_amount);
					buildRequest(usr, arg1_msg, "aeroports", [[6000, "money"]], arg2_building, arg3_amount);
				} else {
					result_string.push("You were unable to build this building.");
				}
				
				arg1_msg.channel.send(result_string.join("\n"));
			}
		}
		
		function craftRequest (arg0_user, arg1_message, arg2_name, arg3_costs, arg4_build_request, arg5_amount, arg6_int) {
			//Costs: [[5, "iron"],[1, "stone"]]
			var usr = arg0_user;
			var military = usr["military"];
			var inventory = usr["inventory"];
			var print_results = [];
			var tech_request = false;
			
			var remaining_manpower = usr.initial_manpower - usr.used_manpower;
			
			if (arg4_build_request == arg2_name) {
				
				for (var x = 0; x < arg5_amount; x++) {
					console.log("Request to build " + arg5_amount + " " + arg2_name + " was recieved.");
					var checks_passed = 0;
					
					for (var i = 0; i < arg3_costs.length; i++) {
						if (arg3_costs[i][1] == "manpower") {
							if (remaining_manpower >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "money") {
							if (usr.money >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else if (arg3_costs[i][1] == "tech") {
							if (usr.technology_level >= arg3_costs[i][0]) {
								checks_passed++;
							}
						} else {
							if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
								checks_passed++;
							}
						}
						
						if (arg2_name == "tech2") {
							if (usr.technology_level == 2 || usr.technology_level == 3 || usr.technology_level == 4 || usr.technology_level == 5 || usr.technology_level == 6) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech3") {
							if (usr.technology_level == 3 || usr.technology_level == 4 || usr.technology_level == 5 || usr.technology_level == 6) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech4") {
							if (usr.technology_level == 4 || usr.technology_level == 5 || usr.technology_level == 6) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech5") {
							if (usr.technology_level == 5 || usr.technology_level == 6) {
								checks_passed--;
							}
							tech_request = true;
						} else if (arg2_name == "tech6") {
							if (usr.technology_level == 6) {
								checks_passed--;
							}
							tech_request = true;
						}
						
					}
				
					if (checks_passed >= arg3_costs.length) {
						var has_building = false;
						var single_object = arg2_name;
						single_object = single_object.replace("factories","factory");
						single_object = single_object.replace(/s$/,"")
						if (tech_request != true) {
							if (arg2_name == "infantry") {
								if (usr["buildings"].barracks > 0) {
									usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
									has_building = true;
								}
							} else if (arg2_name == "tanks") {
								if (usr["buildings"].factories > 0) {
									usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
									has_building = true;
								}
							} else if (arg2_name == "fighters") {
								if (usr["buildings"].aeroports > 0) {
									usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
									has_building = true;
								}
							} else if (arg2_name == "frigates" || arg2_name == "carriers") {
								if (usr["buildings"].dockyards > 0) {
									usr["military"][arg2_name] = usr["military"][arg2_name] + arg6_int;
									has_building = true;
								}
							}
						}
						
						if (has_building) {
							for (var i = 0; i < arg3_costs.length; i++) {
								if (arg3_costs[i][1] == "manpower") {
									if (remaining_manpower >= arg3_costs[i][0]) {
										usr.used_manpower = usr.used_manpower + arg3_costs[i][0];
									}
								} else if (arg3_costs[i][1] == "money") {
									if (usr.money >= arg3_costs[i][0]) {
										usr.money = usr.money - arg3_costs[i][0];
									}
								} else {
									if (inventory[arg3_costs[i][1]] >= arg3_costs[i][0]) {
										inventory[arg3_costs[i][1]] = inventory[arg3_costs[i][1]] - arg3_costs[i][0];
									}
								}
							}
							print_results.push("You have successfully built a **" + single_object + "**!");
						} else {
							print_results.push("You don't have a valid building from which to produce this type of unit!");
						}
					} else {
						print_results.push("You were unable to craft this item!");
						console.log(print_results.join("\n"));
					}
				}
			
				arg1_message.channel.send(print_results.join("\n"));
			}
		}
		
		function craft (arg0_user, arg1_msg, arg2_crafting, arg3_amount) {
			if (main.users[arg0_user] == undefined) {
				arg1_msg.channel.send("You don't have a country yet!");
			} else {
				var usr = main.users[arg0_user];
				var military = main.users[arg0_user]["military"];
				var result_string = [];
				var unit_exists = false;
				
				for (var i = 0; i < config.units.length; i++) {
					if (arg2_crafting == config.units[i]) {
						unit_exists = true;
					}
				}
				if (unit_exists || arg2_crafting == "tech2" || arg2_crafting == "tech3" || arg2_crafting == "tech4" || arg2_crafting == "tech5" || arg2_crafting == "tech6") {
					//craftRequest(usr, arg1_msg, "farms", [[10, "lumber"], [5, "iron"], [1500, "money"], [500, "manpower"]], arg2_building, arg3_amount);
					
					craftRequest(usr, arg1_msg, "infantry", [[2000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "fighters", [[5000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "tanks", [[4000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "frigates", [[2000, "money"]], arg2_crafting, arg3_amount, 1);
					craftRequest(usr, arg1_msg, "carriers", [[6000, "money"]], arg2_crafting, arg3_amount, 1);
				} else {
					result_string.push("No such recipe exists!");
				}
				
				arg1_msg.channel.send(result_string.join("\n"));
			}
		}
		
		function use (arg0_user, arg1_msg, arg2_unit) {
			var unit_exists = false;
			for (var i = 0; i < config.units.length; i++) {
				if (config.units[i] == arg2_unit) {
					unit_exists = true;
				}
			}
			if (unit_exists) {
				if (main.users[arg0_user]["military"][arg2_unit] > 0) {
					main.users[arg0_user]["military"][arg2_unit]--;
					if (arg2_unit == "infantry") {
						arg1_msg.channel.send("**You have deployed your soldiers into battle!** Choose an adjacent province ID to attack.\nhttps://tenor.com/view/black-hawk-down-running-raid-soldiers-gif-13310000 \n<@387236204942196737>");
					} else if (arg2_unit == "fighters") {
						arg1_msg.channel.send("**Your fighter jets are securing air supremacy and harassing the enemy!** Choose 3 adjacent province IDs to attack.\nhttps://media3.giphy.com/media/m9tLjyQ6jYogM/giphy.gif?cid=ecf05e477c20ec4739fe5eb21bb54118a3bca27c9965f577&rid=giphy.gif \n<@387236204942196737>");
					} else if (arg2_unit == "tanks") {
						arg1_msg.channel.send("**You have deployed your tanks into battle!** Choose 2 adjacent province IDs to attack.\nhttps://thumbs.gfycat.com/CloudyGlitteringChipmunk-size_restricted.gif \n<@387236204942196737>");
					} else if (arg2_unit == "frigates") {
						arg1_msg.channel.send("**Your frigates were launched into the open ocean!** Choose an enemy to remove a carrier off of.\nhttps://i.pinimg.com/originals/a1/88/78/a188789f7c269ebfa062835b8338ae6a.gif \n<@387236204942196737>");
					} else if (arg2_unit == "carriers") {
						arg1_msg.channel.send("**Your carrier has been accompanied by an amphibious landing force!** Choose a coastal province ID to attack.\nhttps://thumbs.gfycat.com/OffensiveSpitefulAlbino-small.gif \n<@387236204942196737>");
					}
				} else {
					arg1_msg.channel.send("You don't have enough units to carry out this operation!");
				}
			} else {
				arg1_msg.channel.send("The unit you have specified is nonexistent!");
			}
		}
	}
	
	//Logic
	{
		setTimeout(function(){
			console.log("[Ampersand] is ready to recieve data requests!");
			setInterval(function(){
				fs.writeFile('database.js', JSON.stringify(main), function (err,data) {
					if (err) {
						return console.log(err);
					}
					//console.log(data);
				});
				
				//Check if a turn has passed
				
				if (main.lastTurn == undefined) {
					main.lastTurn = new Date().getTime();
				} else {
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;
					if (time_difference > turn_timer*1000) {
						for (var i = 0; i < Math.floor(time_difference/(turn_timer*1000)); i++) {
				
							if (main.roundCount == undefined) {
								main.roundCount = 0;
							} else {
								main.roundCount++;
							}
							
							for (var x = 0; x < main.user_array.length; x++) {
								nextTurn(main.user_array[x]);
							}
							
							//console.log('[Country Battle] A turn has elapsed!');
							if (main.roundCount % 3 == 0) {
								//returnChannel(announcements_channel).send("<@&700158364822405190> A turn has elapsed! It is now round **" + main.roundCount + "**.\nThis round is an expansion round! DM @Vis#5102 the provinces you wish to colonise! Remember you can only colonise one province per settler unit!");
								returnChannel(announcements_channel).send("<@&700158364822405190> A turn has elapsed! It is now round **" + main.roundCount + "**.");
							} else {
								returnChannel(announcements_channel).send("<@&700158364822405190> A turn has elapsed! It is now round **" + main.roundCount + "**.");
							}
							main.lastTurn = current_date;
							
							for (var x = 0; x < news.length; x++) {
								returnChannel(announcements_channel).send(news[x]);
							}
							
							news = [];
						}
					}
				}
				
				for (var x = 0; x < main.user_array.length; x++) {
					initUser(main.user_array[x]);
				}
				
			}, 100);
		},1000);
	}
}

client.on('ready', () => {
	client.user.setPresence({ activity: { name: "Midnighter RP"}, status: 'online'}).then(console.log).catch(console.error);
})

client.on('message', message => {
	//Get arguments
	var arg = [];
	
	//Initialisation end
	
	username = message.author.username;
	user_id = message.author.id;
    input = message.content;
	
	//Parse arguments
	arg = message.content.split(" ");
	console.log("Author: " + username);
	console.log(message.content);
	console.log(arg);
	
	if (arg[0].indexOf(bot_prefix) != -1) {
		
		//General commands
		{
			if (equalsIgnoreCase(arg[0], "help")) { //$help
				message.channel.send(help);
				//message.channel.send(help2);
			}
			
			if (equalsIgnoreCase(arg[0], "roll")) { //$roll
				if (arg.length == 2) {
					//message.channel.send
					if (arg[1].indexOf("-") == -1) { //$roll arg1
						message.channel.send("You rolled a **" + randomNumber(1, parseInt(arg[1])) + "**.");
					} else { //$roll arg1-arg2
						var subargs = arg[1].split("-");
						message.channel.send("You rolled a **" + randomNumber(subargs[0], subargs[1]) + "**.");
					}
				} else if (arg.length == 3) {
					message.channel.send("You rolled a **" + randomNumber(parseInt(arg[1]), parseInt(arg[2])) + "**.");
				}
			}
		}
		
		//Administrative commands
		{
			if (hasRole(message, 'First Minister (Moderator)') || hasRole(message, 'Minister of the Interior') || hasRole(message, 'Ministry of Activity')) {
				if (equalsIgnoreCase(arg[0], "create")) { //$create @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;
						
						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}
						
						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "add");
							console.log(JSON.stringify(main));
							message.channel.send("You gave " + arg[2] + " " + arg[3] + " to <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "remove") || equalsIgnoreCase(arg[0], "delete")) { //$remove @user int material
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						var material_exists = false;
						
						for (var i = 0; i < config.materials.length; i++) {
							if (config.materials[i] == arg[3]) {
								material_exists = true;
							}
						}
						
						if (material_exists) { //Execute command
							modifyItem(target_user, arg[2], arg[3], "remove");
							console.log(JSON.stringify(main));
							message.channel.send("You deleted " + arg[2] + " " + arg[3] + " from <@!" + target_user + ">.");
						} else {
							message.channel.send("Material '" + arg[3] + "' was not found.");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "exhaust")) { //$exhaust <@user>
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							var valid_resources = [];
							for (var i = 0; i < config.materials.length; i++) {
								if (main.users[target_user]["inventory"][config.materials[i]] > 0) {
									valid_resources.push(config.materials[i]);
								}
							}
							
							var deducted_resource = randomElement(valid_resources);
							main.users[target_user]["inventory"][deducted_resource]--;
							
							message.channel.send("After the capture of a province, **" + main.users[target_user].name + "** lost a **" + deducted_resource + "** resource node!");
						} else {
							message.channel.send("The person you are targeting doesn't even have a country!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "blockade")) { //$blockade <@user>
					if (arg.length > 1) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							if (main.users[target_user].blockaded) {
								main.users[target_user].blockaded = false;
								message.channel.send("The country of " + main.users[target_user].name + " is no longer blockaded.");
							} else if (main.users[target_user].blockaded == false) {
								main.users[target_user].blockaded = true;
								message.channel.send("The country of " + main.users[target_user].name + " was blockaded.");
							}
						} else {
							message.channel.send("The person you are trying to blockade doesn't even have a country!");
						}
					} else {
						message.channel.send("Invalid amount of arguments!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "eval")) { //$eval <@user> [property] [value]
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						eval("main.users['" + target_user + "']" + arg[2] + " = " + arg[3] + ";");
						message.channel.send("Eval command executed. Warning! This command can be highly unstable if not used correctly.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "user-register")) { //$user-register <@user> <name>
					var target_user = returnMention(arg[1]);
					
					if (arg.length > 1) {
						initUser(target_user);
						var full_name = [];
						for (var i = 2; i < arg.length; i++) {
							full_name.push(arg[i]);
						}
						main.users[target_user].name = full_name.join(" ");
						message.channel.send(arg[1] + " has been successfully registered as **" + main.users[target_user].name + "**!");
					}
				}
			}
		}
		
		//Country commands
		{
			if (hasRole(message, '🗾 ¦ Country')) {
				if (equalsIgnoreCase(arg[0], "found")) { //$found <country_name>
					var target_user = returnMention(user_id);
					
					if (arg.length > 1) {
						initUser(target_user);
						var full_name = [];
						for (var i = 1; i < arg.length; i++) {
							full_name.push(arg[i]);
						}
						main.users[target_user].name = full_name.join(" ");
						message.channel.send("You have been successfully registered as **" + main.users[target_user].name + "**!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "settle")) { //$settle [int]
					var target_user = returnMention(user_id);
					/*
					if (arg.length > 1) {
						if (main.users[target_user] != undefined) {
							if (main.users[target_user].money >= 2000) {
								main.users[target_user].money = main.users[target_user].money - 2000;
								message.channel.send("<@213287117017710593> **SETTLER ALERT!**\n" + main.users[target_user].name + " sent out a settler to Province **" + arg[1] + "**!");
								
								var randomResource = randomElement(config.materials);
								
								main.users[target_user]["inventory"][randomResource]++;
								message.channel.send("Inspectors from " + main.users[target_user].name + " have discovered that the province contains **" + randomResource + "**!");
							} else {
								message.channel.send("You don't have enough funds to send out a settler unit!");
							}
						} else {
							message.channel.send("You are currently nonexistent!");
						}
					} else {
						message.channel.send("You didn't specify a Province ID for your settlers to go to!");
					}
					*/
					
					message.channel.send("Terra nullius no longer exists! World war is coming ...");
				}
			
				if (equalsIgnoreCase(arg[0], "inv") || equalsIgnoreCase(arg[0], "inventory") || equalsIgnoreCase(arg[0], "resources")) { //$inv <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printInv(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printInv(target_user, username, message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "industry") || equalsIgnoreCase(arg[0], "buildings")) { //$industry <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printBuildings(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printBuildings(target_user, username, message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "craft")) { //$craft <item>
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (arg[1] == "list") {
							message.channel.send("**:scroll: Crafting List:**\n------------------ \n" + rawunitcosts.toString());
						} else {
							craft(target_user, message, arg[1], 1);
						}
					} else if (arg.length == 3) {
						craft(target_user, message, arg[1], arg[2]);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "build")) { //$build <building> [int]
					//arg0_user, arg1_msg, arg2_building, arg3_amount
					var target_user = returnMention(user_id);
					if (arg.length == 2) {
						var target_user = returnMention(user_id);
						if (arg[1] == "list") {
							message.channel.send("**:scroll: Building List:**\n------------------ \n" + rawbuildcosts.toString());
						} else {
							build(target_user, message, arg[1], 1);
						}
					} else if (arg.length == 3) {
						build(target_user, message, arg[1], arg[2]);
					} else {
						message.channel.send("Invalid number of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "demolish")) { //$demolish <building> [int] (arg0_user, arg1_message, arg2_name, arg3_amount)
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (main.users[target_user].blockaded) {
							message.channel.send("You're currently blockaded!");
						} else {
							if (arg.length == 2) {
								demolishRequest(target_user, message, arg[1], 1);
							} else if (arg.length == 3) {
								demolishRequest(target_user, message, arg[1], parseInt(arg[2]));
							} else {
								message.channel.send("Invalid amount of arguments.");
							}
						}
					} else {
						message.channel.send("You don't even have a nation!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "stats") || equalsIgnoreCase(arg[0], "info")) { //$stats <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						if (main.users[target_user] != undefined) {
							printStats(target_user, username, message);
						} else {
							message.channel.send("You don't even have a nation!");
						}
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						if (main.users[target_user] != undefined) {
							printStats(target_user, arg[1], message);
						} else {
							message.channel.send("The person you are looking for is stateless!");
						}
					}
				}
				
				if (equalsIgnoreCase(arg[0], "military") || equalsIgnoreCase(arg[0], "mil")) { //$military <@user>
					if (arg.length == 1) {
						var target_user = returnMention(user_id);
						printMilitary(target_user, username, message);
					} else if (arg.length == 2) {
						var target_user = returnMention(arg[1]);
						printMilitary(target_user, arg[1], message);
					}
				}
				
				if (equalsIgnoreCase(arg[0], "use")) { //$use <unit>
					var target_user = returnMention(user_id);
					if (main.users[target_user] != undefined) {
						if (arg.length > 1) {
							use(target_user, message, arg[1]);
						} else {
							message.channel.send("Invalid amount of arguments.");
						}
					} else {
						message.channel.send("A stateless user doesn't have any military units!");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "nextround")) { //$nextround
					var current_date = new Date().getTime();
					var time_difference = current_date - main.lastTurn;
					
					message.channel.send("It is currently round **" + main.roundCount + "**.\n" + parseMilliseconds((turn_timer*1000)-time_difference) + " remaining until the next turn.");
				}
				
				//give(arg0_user, arg1_user2, arg2_amount, arg3_item, arg4_mode, arg5_message)
				
				if (equalsIgnoreCase(arg[0], "give")) { //$give <@user> <int> <item>
					if (arg.length == 4) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], arg[3], "military", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
				
				if (equalsIgnoreCase(arg[0], "pay")) { //$pay <@user> <int> <item>
					if (arg.length == 3) {
						var target_user = returnMention(arg[1]);
						var current_user = returnMention(user_id);
						if (main.users[target_user].blockaded || main.users[current_user].blockaded == undefined) {
							message.channel.send("The person you are trying to send these items to is currently blockaded!");
						} else {
							give(current_user, target_user, arg[2], "money", "item", message);
						}
					} else {
						message.channel.send("Invalid amount of arguments.");
					}
				}
			}
		}
		
		//Config commands
		{
			if (hasRole(message, 'Discord Developer') || hasRole(message, 'Minister of the Interior') || hasRole(message, 'Ministry of Activity')) {
				if (equalsIgnoreCase(arg[0], "set-announcements-channel")) { //$set-announcements-channel <channel id>
					if (arg[1] != undefined) {
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The announcements channel has been set to the following channel ID: " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.")
						announcements_channel = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "set-prefix")) { //$set-prefix <prefix>
					if (arg[1] != undefined) {
						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("The bot prefix has been changed to " + arg[1] + ".\nIf the prefix doesn't work, try typing the command again.");
						help = rawhelp.toString().replace(/@/g, bot_prefix);
						
						bot_prefix = arg[1];
						saveConfig();
						readConfig();
						help = rawhelp.toString().replace(/@/g, bot_prefix);
					}
				}
				if (equalsIgnoreCase(arg[0], "set-round-time")) { //$set-round-time <seconds>
					if (arg[1] != undefined) {
						turn_timer = arg[1];
						saveConfig();
						readConfig();
						message.channel.send("Turns are now " + arg[1] + " seconds long.\nIf the prefix doesn't work, try typing the command again.");
						
						turn_timer = arg[1];
						saveConfig();
						readConfig();
					}
				}
				if (equalsIgnoreCase(arg[0], "reset-rounds")) { //$reset-rounds
					main.roundCount = 0;
					message.channel.send("Server rounds have been reset!");
				}
			}
		}
	}
})
