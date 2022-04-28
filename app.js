
const express = require("express")
const { ExpressPeerServer } = require('peer');
const Socket  = require("socket.io");
const http = require('http');
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

 
 const socketServer = Socket(server, {
  path: '/socket.io'
});

const { PeerServer } = require('peer');

const peerServer = PeerServer({port:"3030", path: '/myapp' });

// serverpeer.listen(9000)

peerServer.on("connection",(client)=>{
  console.log(client);
})






socketServer.on("connection", (socket) => {
 
    socket.on("joining",(param)=>{
    
        socket.join(getRoom(socket))
        socket.to(getRoom(socket)).emit("peerId",param)
   
    })

    socket.on("sendMessage",(messagePackage)=>{
    

      socket.to(getRoom(socket)).emit("createMessage",messagePackage)
 
  })
  socket.on("sendToggle",(toggleOptions)=>{
  
    socket.to(getRoom(socket)).emit("toggle",toggleOptions)

})

  socket.on("disconnecting", (reason) => {

  socket.to(getRoom(socket)).emit("leave",socket.id)



  });
  });

  

  
  function getRoom(socket){

    const clientSocket  = socket.rooms.values()
      clientSocket.next().value
        const clientRoom = clientSocket.next().value


     return clientRoom;

  }












app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));




app.get("/",(req,res)=>{
res.sendFile(__dirname+"/public/index.html")


})

app.get("/room/:id",(req,res)=>{

    res.sendFile(__dirname+"/views/video.html")

    
    })



    


server.listen(port,()=>{

console.log(port+" listing")

})







  