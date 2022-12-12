const route = require("express").Router();
const axios = require("axios");
const reg = require("./registry.json");
const rateLimiter = require("express-rate-limit");
const fs = require("fs");

const limiter = rateLimiter({
	max: 15,
	windowMs: 5000,
});

route.all("/:apiName/:path?/:value?", limiter, async (req, res) => {
	try {
		const { apiName, path, value } = req.params;
		console.log(`API: ${apiName},CAMINHO: ${path},VALOR: ${value}`)
		
		if (reg.services[req.params.apiName]) {
			const auth = req.headers.authorization;

			let url = reg.services[apiName].url;
			let headers;

			if (typeof path === "string" && path.trim().length >= 0) {
				url += path;
			}
			if (typeof value === "string" && value.trim().length >= 0) {
				url += `/${value}`;
			}
			if (typeof auth === "string" && auth.trim().length >= 0) {
				headers = {
					"Accept": "application/json",
					"Content-Type": "application/json;charset=UTF-8",
					Authorization: auth,
				};
			} else {
				headers = {
					"Accept": "application/json",
					"Content-Type": "application/json;charset=UTF-8",
				};
			}

			await axios({
				method: req.method,
				url: url,
				data: req.body,
				headers: headers,
			})
				.then((data) => {
					// console.log(data);
					return res.status(data.status).send(data.data);
				})
				.catch((err) => {
					// console.log(err);
					let erro = err.response.data;
					if(!erro){
						erro = err.message;
					}
					console.log(erro)
					return res.status(err.response.status).send({erro:erro});
				});
		} else {
			return res
				.status(400)
				.send({ message: "no service for this param" });
		}
	} catch (error) {
		return res.status(500).send({ erro: error.message });
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

module.exports = {
	route,
	reg,
};
