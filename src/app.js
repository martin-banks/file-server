/* eslint-env node */
const express = require('express')
const sassMiddleware = require('node-sass-middleware')
const app = express()
const fs = require('fs')
const path = require('path')
// const pug = require('pug')

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}
// const dir = path.join(__dirname, '../../')
const dir = getUserHome()
const excludeFiles = [
// any file beginning with a full-point will be excluded
	'node_modules',
	'yarn.lock',
	'package-lock.json',
]

// const testPug = pug.compileFile('./src/test.pug')
// console.log(testPug({name: 'bob'}))

app.set('view engine', 'pug')
app.set('views', './src/views')

app.use(sassMiddleware({
	src: path.join(dir, '/file-server/src/sass'),
	dest: path.join(dir, '/file-server/src/public'),
	debug: true,
	indentedSyntax: true,
	outputStyle: 'compressed',
	prefix: '/public',
}))


app.use('/public', express.static(path.join(__dirname, '/public')))


function removeDoubleSlash(stringArr) {
	return stringArr.join('').replace(/\/+/g, '/')
}
app.get('/*', (req, res) => {
	// console.log(Object.keys(req), req.url, req.params)
	const { hostname, originalUrl } = req
	const url = (req.url).replace(/%20/g, ' ')
	if (url.indexOf('.') === -1) {
		fs.readdir(path.join(dir, (originalUrl).replace(/%20/g, ' ')), (err, data) => {
			if (err) {
				console.error(err)
				res.send(err)
				return
			}
			const formatted = data
				.filter(d => d[0] !== '.')
				.filter(d => excludeFiles.indexOf(d) === -1)
				.reduce((output, current) => {
					let update = output
					const entry = {
						text: current,
						link: `http://${removeDoubleSlash([hostname, ':3000', (originalUrl).replace(/%20/g, ' '), '/', current])}`
					}
					if (current.indexOf('.') === -1) {
						update.folders.push(entry)
					} else {
						update.files.push(entry)
					}
					return update
				}, {files: [],folders: []})

			const breadcrumb = url
				.split('/')
				.reduce((output, current) => {
					if (current === '') return output
					let update = output
					update.push(`${output.slice(-1)[0] || ''}/${current}`)
					return update
				}, [''])

			res.render('test', {
				header: `${url}`,
				breadcrumb,
				data: formatted,
				style: path.join(__dirname, 'public'),
			})
		})
	} else {
		const file = path.join(dir, url)
		res.sendFile(file)
	}
})


app.listen(3000, () => {
	console.log('App listening on port 3000!')
})
