const { exec } = require("child_process")
const fs = require('fs')
require('dotenv').config()
const express = require('express')
const fileUpload = require('express-fileupload')
const basicAuth = require('express-basic-auth')

const CONFIG = {
	PORT: process.env.ADMIN_PORT || 8081,
	USER: process.env.ADMIN_USER || 'admin',
	PASS: process.env.ADMIN_PASS || 'admin',
	PUBLIC_URL: process.env.PUBLIC_URL,
	DEPLOY_CMD: (process.env.DEPLOY_CMD || '').trim(),
}

const users = {}
users[CONFIG.USER] = CONFIG.PASS

const app = express()
app.use(basicAuth({ users, challenge: true }))
app.use(fileUpload())
app.use(express.static('admin'))
app.use('/input', express.static('input'))
app.use('/assets', express.static('static/assets'))

app.post('/budget', (req, res) => {
	fs.writeFileSync('input/budget.xlsx', req.files.budget.data)
	res.end()
})

app.post('/buildSite', (req, res) => {
	exec("npm run build", (error, stdout, stderr) => {
		res.status(error ? 500 : 200).send(error ? stderr : '');
	})
})

app.post('/deploySite', (req, res) => {
	if (CONFIG.DEPLOY_CMD) {
		exec(CONFIG.DEPLOY_CMD, (error, stdout, stderr) => {
			res.status(error ? 500 : 200).send(error ? stderr : '');
		})
	} else {
		res.end()
	}
})

app.post('/config', (req, res) => {
	fs.writeFileSync('input/config.xlsx', req.files.config.data)
	res.end()
})

app.post('/logo', (req, res) => {
	const logos = [
		'cover.jpg',
		'face.png',
		'logo.png',
		'logo-footer.png',
		'pub.jpg',
		'ogimage.jpg',
	]
	for (let i = 0; i < logos.length; i++) {
		const logo = logos[i]
		const f = req.files[logo]
		if (f) fs.writeFileSync('static/assets/img/' + logo, f.data)
	}
	res.end()
})

app.get('/ms', (req, res) => {
	res.json(fs.readdirSync('static/assets/ms'))
})

app.delete('/ms/:f', (req, res) => {
	const fn = 'static/assets/ms/' + req.params.f
	if (fs.existsSync(fn)) fs.unlinkSync(fn)
	res.end()
})

app.post('/ms', (req, res) => {
	if (!req.files.ms.forEach) {
		req.files.ms = [req.files.ms]
	}
	for (let i = 0; i < req.files.ms.length; i++) {
		const f = req.files.ms[i];
		fs.writeFileSync('static/assets/ms/' + f.name, f.data)
	}
	res.end()
})

app.post('/newConfig', (req, res) => {
	exec("node scripts/generate-config", (error, stdout, stderr) => {
		if (error) {
			console.error('ERROR', error.message)
			console.error(stderr)
		}
		res.sendStatus(error ? 500 : 200)
	})
})

app.get('/publicUrl', (req, res) => {
	res.send(CONFIG.PUBLIC_URL)
})

app.get('/zip/code', (req, res) => {
	generateAndDownloadFile(
		'zip -r koko-code.zip input scripts src static LICENSE README.* *.js* *.lock',
		'koko-code.zip',
		res
	)
})

app.get('/zip/site', (req, res) => {
	generateAndDownloadFile(
		'zip -r koko-site.zip dist',
		'koko-site.zip',
		res
	)
})

app.listen(CONFIG.PORT, () => {
	console.log(`Started admin on port ${CONFIG.PORT}`)
})

function generateAndDownloadFile(command, filename, res) {
	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error('ERROR', error.message)
			console.error(stderr)
		} else {
			res.download(filename, error => {
				fs.unlinkSync(filename)
			})
		}
	})
}
