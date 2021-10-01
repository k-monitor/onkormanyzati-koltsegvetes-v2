const fs = require('fs')
require('dotenv').config()
const express = require('express')
const fileUpload = require('express-fileupload');

const CONFIG = {
	PORT: process.env.ADMIN_PORT || 8081,
	USER: process.env.ADMIN_USER || 'admin',
	PASS: process.env.ADMIN_PASS || 'admin',
}

const app = express()
app.use(fileUpload())

app.use(express.static('admin'))
app.use('/input', express.static('input'))

app.post('/budget', (req, res) => {
	fs.writeFileSync('input/budget.xlsx', req.files.budget.data)
	res.end()
})

app.listen(CONFIG.PORT, () => {
	console.log(`Started admin on port ${CONFIG.PORT}`)
})
