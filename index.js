const express = require('express');
const app = express();
const port = 3001
const graphqlHTTP = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoUrl = "mongodb+srv://prueba:nKVHCzGUmcf5k7gu@cluster0.gabq8.mongodb.net/?retryWrites=true&w=majority"
const mongoose = require('mongoose');
const Champion = require("./championModel");


mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;

// Un mensaje que nos avise si se pudo conectar a la base da datos, o no. 
!db ? console.log("Error connecting db") : console.log("Db connected successfully");


const getChampion = (query) => {
	return Champion.findOne({ name: query.name }, function (err, response) {
		if(err) return err
		return response;
	})
}

const getAllChampions = (query) => {

	let queryName = query.name && query.name.map(champion => {
		let obj = { name: "" };
		obj.name = champion;
		return obj;
	});
	
	let filter = queryName && { $or: queryName }

	return Champion.find(filter, function (err, docs) {
		if (err) return err;		
		return docs
	})	
}

let schema = buildSchema(`
type Query {
    champion(name: String!): Champion
    allChampion(name: [String!]):[Champion]
}
type Champion {
    id: ID!
    name: String!
    rarity: String
    faction: String
    rating: Int
    type: String
    element: String
    stats: Stats!
}
type Stats {
    health: Int!
    attack: Int!
    defense: Int!
    criticalRate: Int!
    criticalDamage: Int!
    speed: Int!
    resistance: Int!
    accuracy: Int!
}

`);

let root = {
    champion: getChampion,
	allChampion: getAllChampions
};

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}))


app.listen(port, () => console.log(`App de ejemplo escuchando el puerto ${port}!`))