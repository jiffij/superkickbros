const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '/dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
    res.sendFile(HTML_FILE);
})

server.listen(port, function (){
    console.log("server started");
});


var players = {};
var num = 0;
io.on("connection", (socket)=>{
   console.log("a user connected");
   var id = socket.id;
   console.log(socket.id);
   if(num >= 2){socket.disconnect(true); return;}

   socket.on('join', ()=>{
       socket.emit('num', num++);
   })

   socket.on('update',(states)=>{
       players[id] = states;
       // console.log(states);
   });

   socket.on('disconnect', ()=>{
       delete players[id];
       num--;
   })

});

intervalId = setInterval(() => {
    if(num === 2){
        // console.log('update');
        io.emit('update', players);
    }
}, 20);