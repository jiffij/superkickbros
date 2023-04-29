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

app.get('*', (req, res) => {
    res.sendFile(HTML_FILE);
})

app.listen(port, function (){
    console.log("server started");
});

io.on("connection", (socket)=>{
   console.log("a user connected");
});