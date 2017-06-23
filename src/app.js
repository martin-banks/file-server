/* eslint-env node */
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, '../../')


app.get('/*', (req, res) => {
	console.log(Object.keys(req), req.url, req.params)
	const { referer } = req.headers
	console.log('-----\n', referer, req.originalUrl, '\n---------')
	if (req.url.indexOf('.') === -1) {
		fs.readdir(path.join(dir, req.originalUrl), (err, data) => {
			if (err) {
				console.log(err)
				return
			}
			const dataString = JSON.stringify(data, 'utf8', '\t')
			const formatted = data
				.filter(d => d[0] !== '.')
				.map(d => `<li><a href="http://${req.hostname}:3000${req.originalUrl.replace(/\/+/g, '/')}/${d}">${d}</a></li>`).join('')

			res.send(`<html><body><ul>
					${formatted}
				</ul></body></html>`)
		})
	} else {
		const file = path.join(dir, req.url)
		console.log(file)
		res.sendFile(file)
	}
})

app.listen(3000, () => {
  console.log('App listening on port 3000!')
})
