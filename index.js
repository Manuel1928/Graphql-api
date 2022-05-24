const mongoose = require('mongoose');
const mongoUrl = 'mongodb+srv://manuel:manuel@cluster0.gabq8.mongodb.net/?retryWrites=true&w=majority';
const Champion = require("./championModel")
const express = require('express')
const puppeteer = require("puppeteer");
const app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hola mundo!'))
mongoose.connect(mongoUrl, { useNewUrlParser: true });
var db = mongoose.connection;

!db ? console.log("Hubo un error conectandose a la base de datos") : console.log("Conexión a base de datos satisfactoria");

app.get("/scrapping", function (req, res) {
	const parentRow = 'body > main > champion-list > div';
	let scrape = async () => {
		//const browser = await puppeteer.launch({ headless: false });
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		await page.goto("https://raid-codex.com/champions/#!?filter=e30%3D", [1000, "domcontentloaded" ]);
		await page.waitFor(2000);
		await page.waitForSelector(parentRow,150000);
		const totalChampions= await page.$eval(parentRow, el => el.childElementCount);
	var championList = [];
	for (var ix = 1; ix < totalChampions; ix++) {
		console.log(`Process ${ix} of ${totalChampions}`);
		let elementToClick = `body > main > champion-list > div > div:nth-child(${ix}) > a > picture > img`;
		await page.waitForSelector(elementToClick,150000);
		await page.click(elementToClick);
		await page.waitFor(2000);

	  const result = await page.evaluate(() => {
		let name = document.querySelector('body > main > div > div.col-12.text-center.mb-3 > h1').innerHTML;
		let rarity = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > span').innerHTML;
		let faction = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(3) > div:nth-child(2) > a').innerHTML;
		let type = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(5) > div:nth-child(2)').innerHTML;
		let element = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(2) > div:nth-child(6) > div:nth-child(2)').innerHTML;
		let health = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(1) > div:nth-child(2)').innerHTML;
		let attack = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(2) > div:nth-child(2)').innerHTML;
		let defense = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(3) > div:nth-child(2)').innerHTML;
		let criticalRate = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(4) > div:nth-child(2)').innerHTML;
		let criticalDamage = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(5) > div:nth-child(2)').innerHTML;
		let speed = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(6) > div:nth-child(2)').innerHTML;
		let resistance = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(7) > div:nth-child(2)').innerHTML;
		let accuracy = document.querySelector('body > main > div > div.col-12.ng-scope > div > div:nth-child(1) > div:nth-child(3) > div > div.col-12.champion-view-characteristics > div:nth-child(8) > div:nth-child(2)').innerHTML;
		let championModel = { 
			name: name,
			rarity: rarity,
			faction: faction,
			type: type,
			element: element,
			stats: {
			  health: health,
			  attack: attack,
			  defense: defense,
			  criticalRate: criticalRate,
			  criticalDamage: criticalDamage,
			  speed: speed,
			  resistance: resistance,
			  accuracy: accuracy
			}
		  }
		  return championModel;
	});
	console.log('championModel ->', result);
	championList.push(result);
	await page.goBack([5000, "domcontetloaded"]);
	}
	browser.close();
	return championList;
	}
	scrape().then(value => {
		Champion.create(value, function (err, small) {
			if (err) return handleError(err);
		});
		res.send(value);
		return;
	})
})

app.listen(port, () => console.log(`App de ejemplo escuchando el puerto ${port}!`))
