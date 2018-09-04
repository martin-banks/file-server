/* eslint-env node */
const express = require('express')
const sassMiddleware = require('node-sass-middleware')
const app = express()
const fs = require('fs')
const path = require('path')

// We are using Express render engine so no need to call pug separately
// const pug = require('pug')

// Test path pointing up to main porject directory
// Should capture this dynamically
const cwd = process.cwd()
const dir = path.join(__dirname, '../../')
const port = 3300
// Hidden files (beginning with a full point) are ignored by default, 
// Other files we do not need to see are listed here
const excludeFiles = [
// any file beginning with a full-point will be excluded
  'node_modules',
  'yarn.lock',
  'package-lock.json',
]

// Helper file to remove multiple forward slash
function removeDoubleSlash(stringArr) {
  return stringArr.replace(/\/+/g, '/')
}

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))
console.log(__dirname)
// Middleware used for all requests
// This compiles sass to the css in the public directory
app.use(sassMiddleware({
  // src: path.join(dir, '/file-server/src/sass'),
  src: path.join(__dirname, 'src/sass'),
  // dest: path.join(dir, '/file-server/src/public'),
  dest: path.join(__dirname, 'src/public'),
  debug: true,
  indentedSyntax: true,
  outputStyle: 'compressed',
  prefix: '/public',
}))

// Static file hostings
// This is where our static files; css images etc will be hosted from
app.use('/public', express.static(path.join(__dirname, '/public')))

app.get('/*', (req, res) => {
  const { hostname, originalUrl } = req
  const url = (req.url).replace(/%20/g, ' ')
  if (url.indexOf('.') === -1) {
    fs.readdir(path.join(cwd, (originalUrl).replace(/%20/g, ' ')), (err, data) => {
      if (err) {
        console.error(err)
        res.send(err)
        return
      }
      const formatted = data
        .filter(d => d[0] !== '.')
        .filter(d => excludeFiles.indexOf(d) === -1)
        .reduce((output, current) => {
          const update = output
          const entry = {
            text: current,
            // link: `http://${removeDoubleSlash([hostname, ':3000', (originalUrl).replace(/%20/g, ' '), '/', current])}`
            link: `http://${removeDoubleSlash(`${hostname}:${port}${originalUrl}/${current}`)}`

          }
          if (current.indexOf('.') === -1) {
            update.folders.push(entry)
          } else {
            update.files.push(entry)
          }
          return update
        }, { files: [], folders: [] })


// 			const breadcrumb = url

      // For the breadcrumb links, I want to have the full path
      // from the initial host location. Use reduce to create
      // an array of links each building on the previous
      const breadcrumb = req.url

        .split('/')
        .reduce((output, current) => {
          if (current === '') return output
          const update = output
          // .slice(-1)[0] is used to get the last item in an array
          update.push(`${output.slice(-1)[0] || ''}/${current}`)
          return update
        }, [''])

      // render used in place of send when working with templates
      res.render('test', {
        header: `${url}`,
        breadcrumb,
        data: formatted,
        style: path.join(__dirname, 'public'),
      })
    })
  } else {
    // If the newest request has a full point in it
    // we assume it is a file and try to send it
    // 
    const file = path.join(cwd, req.url)
    res.sendFile(file)
  }
})


// Start the server!!
app.listen(port, () => {
  console.log(`App listening on port ${port}!`)
})
