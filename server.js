require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compress = require("compression");
const helmet = require("helmet");
const Module = require("module");
const fs = require("fs");
const axios = require("axios");

Module._extensions[".png"] = function (module, fn) {
	var base64 = fs.readFileSync(fn).toString("base64");
	module._compile(
		'module.exports="data:image/jpg;base64,' + base64 + '"',
		fn
	);
};
//env variable
let port = process.env.PORT;
const host = process.env.HOST;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(compress());
app.use(helmet());

const path = __dirname;
//paths
var { reg, route } = require("./src/routes/gates.routes");

console.log(`PATH: ${path}`)

const crud = require(`${path}/views/img/crud.png`);
const email = require(`${path}/views/img/message.png`);
const logo = require(`${path}/views/img/logo.png`);

app.set("view engine", "ejs");
app.use(express.static(path));

var crudIsGood;
var emailIsGood;
const urlC = "https://crud-a3.vercel.app/";
const urlE = "https://mail-a3.vercel.app/";

setInterval(() => {
	(async function crudFunc() {
		await axios({
			url: urlC,
			method: "GET",
		})
			.then((en) => {
				crudIsGood = en.data.message;
			})
			.catch((err) => {
				crudIsGood = err.status;
			});
		await axios({
			url: urlE,
			method: "GET",
		})
			.then((en) => {
				emailIsGood = en.data.message;
			})
			.catch((err) => {
				console.log(err.status);
			});
	})();
}, 15000);

app.get("/main", async (req, res) => {
	console.log(path)
	setInterval(() => {
		res.render("main.ejs", {
			services: reg.services,
			img: { crud: crud, email: email, logo: logo },
			crudIsGood,
			emailIsGood,
		});
	}, 15000);
});

app.use("/", route);
app.get("/", (req, res) => {
	return res.send({ message: "Gateway is running" });
});

//ports - host
if (new String(port).startsWith("3000")) {
	port = port.replace("3000", "3001");
}

if(port == undefined || null){
	port = 3001;
}

app.listen(port, () => {
	console.log(`Rodando gateway http://${host}:${port}`);
});
