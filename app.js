
const express = require("express")
const Socket  = require("socket.io");
const http = require('http');
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);

 
 const socketServer = Socket(server, {
  path: '/socket.io'
});



socketServer.on("connection", (socket) => {
 
    socket.on("joining",(param)=>{


        socket.join(getRoom(socket))
        socket.to(findRoom(socket)).emit("peerId",param)

     
   
    })

    socket.on("sendMessage",(messagePackage)=>{
    

      socket.to(findRoom(socket)).emit("createMessage",messagePackage)
 
  })
  socket.on("sendToggle",(toggleOptions)=>{
  
    socket.to(findRoom(socket)).emit("toggle",toggleOptions)

})

  socket.on("disconnecting", (reason) => {

  socket.to(findRoom(socket)).emit("leave",socket.id)



  });
  });

  
  function getRoom(socket){

    const url = (new URL(socket.handshake.headers.referer)).pathname;

    

    return url;

  }

  
  function findRoom(socket){
    
    const clientSocket  = socket.rooms.values()
    console.log(clientSocket)
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







  