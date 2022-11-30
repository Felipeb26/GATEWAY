const route = require("express").Router();
const axios = require("axios");
const reg = require("./registry.json");
const rateLimiter = require("express-rate-limit");
const fs = require("fs");

const limiter = rateLimiter({
	max: 15,
	windowMs: 5000,
});

route.all("/:apiName/:path/:value", limiter, async (req, res) => {
	try {
		if (reg.services[req.params.apiName]) {
			let value = "/" + req.params.value;
			value = value == undefined || value == null ? "" : value;
			await axios({
				method: req.method,
				url:
					reg.services[req.params.apiName].url +
					req.params.path +
					value,
				data: req.body,
				headers: {
					"Content-Type": "application/json",
					Authorization: req.headers.authorization,
				},
			})
				.then((data) => {
					return res.status(data.status).send(data.data);
				})
				.catch((err) => {
					let status = err.response.status;
					status = status != null || undefined ? status : 400;
					return res.status(status).send(err.response.data);
				});
		} else {
			res.send({ message: "no service for this param" });
		}
	} catch (error) {
		res.send({ erro: error.message });
	}
});

route.all("/:apiName/:path", async (req, res) => {
	try {
		if (reg.services[req.params.apiName]) {
			await axios({
				url: reg.services[req.params.apiName].url + req.params.path,
				method: req.method,
				data: req.body,
				headers: {
					"Content-Type": "application/json",
					Authorization: req.headers.authorization,
				},
			})
				.then((data) => {
					return res.status(data.status).send(data.data);
				})
				.catch((err) => {
					let status = err.response.status;
					status = status != null || undefined ? status : 400;
					return res.status(status).send(err.response.data);
				});
		} else {
			res.send({ message: "no service for this param" });
		}
	} catch (error) {
		res.send({ erro: error.message });
	}
});

route.all("/:apiName/", limiter, async (req, res) => {
	try {
		if (reg.services[req.params.apiName]) {
			await axios({
				method: req.method,
				url: reg.services[req.params.apiName].url,
				data: req.body,
				headers: {
					"Content-Type": "application/json",
					Authorization: req.headers.authorization,
				},
			})
				.then((data) => {
					return res.status(data.status).send(data.data);
				})
				.catch((err) => {
					let status = err.response.status;
					status = status != null || undefined ? status : 400;
					return res.status(status).send(err.response.data);
				});
		} else {
			res.send({ message: "no service for this param" });
		}
	} catch (error) {
		res.send({ erro: error.message });
	}
});

route.post("/register", async (req, res) => {
	const regisInfo = req.body;
	reg.services[regisInfo.apiName] = { ...regisInfo };

	fs.writeFile(`${__dirname}/registry.json`, JSON.stringify(reg), (err) => {
		if (err) {
			console.log(err);
			return res.send(`não foi possivel registrar ${regisInfo}`);
		} else {
			return res.send(
				`registro incluido com sucesso ${regisInfo.apiName}`
			);
		}
	});
});

// var crudIsGood ;
// var emailIsGood;

const urlC = "http://localhost:3000/";
const urlE = "http://localhost:3003";

const crudFunc = async () => {
	await axios({
		url: urlC,
		method: "GET",
	})
		.then((en) => {
			return en;
		})
		.catch((err) => {
			console.log(err.status);
			return err;
		});
};

const emailFunc = async () => {
	axios({
		url: urlE,
		method: "GET",
	})
		.then((en) => {
			return en;
		})
		.catch((err) => {
			console.log(err.status);
			return err;
		});
};

// console.log(`Email ${emailIsGood}`, `Crud ${crudIsGood}`);

module.exports = {
	route,
	reg,
	crudFunc,
	emailFunc,
};
