const http = require('http')
const fs = require('fs')
const io = require('socket.io')()

const isProduction = 'production' === process.env.NODE_ENV
const port = 1336


// Chargement du fichier index.html affiché au client
const httpServer = http.createServer(function (req, res) {
  fs.readFile('src/index.html', 'utf-8', function (error, content) {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(content)
  })
})

// On bind socket.io dessus
io.attach(httpServer, {pingInterval: 500})

io.sockets.on('connection', function (socket) {
  socket.on('newConnection', function (pseudo) {
    socket.pseudo = pseudo
    console.log(`${socket.pseudo} à rejoint le chat.`)
    socket.broadcast.emit('someoneConnected', `<div class="line"><em>${socket.pseudo} à rejoint le chat.</em></div>`)
  })

  socket.on('newMessage', function (textinput) {
    console.log(`${socket.pseudo} says : ${textinput}`)
    socket.broadcast.emit('someoneTalked', `<div class="line"><span class="pseudo">${socket.pseudo}</span>${textinput}</div>`)
  })
})

/* Launch the server */
httpServer.listen(port, listening())

function listening () {
  console.log(`Demo server available on http://localhost:${port}`)
  if(!isProduction) {
    const browserSync = require('browser-sync').create()
    // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
    browserSync.init({
      files: ['./**/*.{html,js,css,ejs}'],
      online: false,
      open: false,
      port: port + 1,
      proxy: 'localhost:' + port,
      ui: false,
      notify: false,
      ghostMode: false
    })
  }
}
