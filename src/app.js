/* eslint-env node */
const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const pug = require('pug')

const dir = path.join(__dirname, '../../')
const excludeFiles = [
// any file beginning with a full-point will be excluded
	'node_modules',
]

// const testPug = pug.compileFile('./src/test.pug')
// console.log(testPug({name: 'bob'}))

app.set('view engine', 'pug')
app.set('views', './src/views')

app.get('/*', (req, res) => {
	console.log(Object.keys(req), req.url, req.params)

	if (req.url.indexOf('.') === -1) {
		fs.readdir(path.join(dir, req.originalUrl), (err, data) => {
			if (err) {
				console.error(err)
				res.send(error)
				return
			}
			const formatted = data
				.filter(d => d[0] !== '.')
				// .map(d => `<li><a href="http://${req.hostname}:3000${req.originalUrl.replace(/\/+/g, '/')}/${d}">${d}</a></li>`).join('')
				.map(d => ({
					text: d,
					link: `http://${req.hostname}:3000${req.originalUrl.replace(/\/+/g, '/')}/${d}`}))

			res.render('test', { 
				header: `Files for ${req.originalUrl}`,
				files: formatted
			})
		})
	} else {
		const file = path.join(dir, req.url)
		res.sendFile(file)
	}
})

app.listen(3000, () => {
  console.log('App listening on port 3000!')
})
