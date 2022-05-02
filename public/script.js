

  let cameraPermmited = false;
  let micPermitted = false;
  let numberOfUser = 1;
  let localData = [];
  var myLocalStream = ""
  let username 
  let userID = ""
  const socket = io();
  const peer = new Peer();





checkCookie()



function checkCookie() {
  let user = getCookie("username");
  if (user == "")
         askForName()
     else
     username = user

}




function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}



  function askForName(){

    let person = prompt("Please enter your name");
   
    if (person == null || person == ""){
      person = "Guest_"+(Math.floor(Math.random()*90000) + 10000);
      if(getCookie("username") != ""){
        username = getCookie("username");
        return
      }

    }
  
    username = person;
    setCookie("username", username, 7)
  }

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  


$(".chooser").on("click",(e)=>{
  const parent = $(e.target).closest(".chooser")

  $(".chooser").toArray().forEach(element => {
    
    $(element).removeClass("active")//reset the active
    const id = $(element).attr("data-href")
    $(id).css("display","none")
  });

 
  const id = $(parent).attr("data-href")

  $(parent).addClass("active")

  $(id).css("display","flex")


  if($("#chat").children().length > 0)  $("#chat").children().last()[0].scrollIntoView()


  resetNotif();


})
let time = ""
$(".video-conatiner").on("click",(e)=>{
  const target = e.target
if(target.id == "forward" || target.id == "backward" )return

clearTimeout(time)
$(".overlay").fadeIn().css("display","grid")

time = setTimeout(function(e){

  $(".overlay").fadeOut()

},10000)


})
$(".overlay").on("click",(e)=>{
  if(e.target != $(".overlay")[0])return
  clearTimeout(time)
  $(".overlay").css("display","none")
})

$("#forward").on("click",(e)=>{
console.log("forward")
  moveforward();

})
$("#backward").on("click",(e)=>{
  console.log("backward")
    moveback();
  
  })



    $("#link").text(window.location.href)

    $("#link").on("click",(e)=>{
    const text = window.location.href
     
      navigator.clipboard.writeText(text).then(function() {
        createNotifcation({message:"Link Copied",leave:false,sendChat:false})
      }, function(err) {
    
      });

    })

 






$("#messageBox").on("click",(e)=>{



  $( "#sideBody" ).css({display:"flex"}).animate({
      left:"0"
  })

  //reset the message notif
  resetNotif();



})

$("#send").on("click",(e)=>{

  chat()

})


$("#back").on("click",(e)=>{

$( "#sideBody" ).animate({
  left:"-100%",
  display:"none"
  
},function(e){
  $( "#sideBody" ).css({display:"none"})
})

})




socket.on("connect", () => {

  userID = socket.id

  });

socket.on("createMessage",(message)=>{

createMessage(message)
checkIfchatboxIsHidden();


})

socket.on("leave",(theirID)=>{

  userLeave(theirID);
  
  })
  socket.on("toggle",(options)=>{

   toggleVideoSettings(options["what"],options["ID"])
    
  })

 



peer.on("open", async (id)=>{
  //ask for permission
  try {
    await navigator.mediaDevices.getUserMedia({video: {facingMode:"environment"}, audio: true})
  } catch (error) {
    
  }

  localData = [];

  localData.push({name:username,userID:userID})
  createUsers({name:username,userID:userID})  


joining(id)


})

peer.on("disconnected", (id)=>{
  console.log("disconnecting"+id)


})

peer.on("error", (id)=>{
  console.log("disconnecting"+id)


})

function leaveRoom(element){

  const leaving = confirm("Are you sure you want to leave the call?")
  if(leaving)  window.location.href = "/"

}


function findVideoElement(id){

return $("video").toArray().filter((e)=>{ return $(e).data("data-id") == id})[0]
}


function userLeave(id){
//remove the video of the one who leave
 const leaverVideo = findVideoElement(id)

 if($(leaverVideo).closest(".video-wrapper")!=null) $(leaverVideo).closest(".video-wrapper")[0].remove()
  
const leaverName = localData.find((e)=> e["userID"] == id)
 createNotifcation({message:leaverName["name"]+" has left",leave:true,sendChat:true})
 localData = localData.filter((e)=> e["userID"] != id)
  numberOfUser--;
  pickGrid()

  removeUsers(id)
}
let call;
let peerConnections = [];
let videoDevices = null
let fakeStream = false;
// on open will be launch when you successfully connect to PeerServer
 async function getDevices() {
  const devices =  await navigator.mediaDevices.enumerateDevices();
    let deviceVid = devices.filter(e=>{
      if(e.kind =="videoinput") return e.deviceId

    })
     deviceVid = deviceVid.map(e=>{
      return e.deviceId
    })
 
    return deviceVid
}

let deviceIdIndex = 0;

// toggle settings

function toggleVideoSettings(what,ID){
  const video = $("video").toArray().filter((e)=>{ return $(e).data("data-id") == ID})[0]
  let icon = $(video).parent().find("div i:nth-child(1)")
  if(what =="camera") icon= $(video).parent().find("div i:nth-child(2)")

  $(icon).toggle()
 
}
function onceToggle(what,ID){
  const video = $("video").toArray().filter((e)=>{ return $(e).data("data-id") == ID})[0]
  let icon = $(video).parent().find("div i:nth-child(1)")
  if(what =="camera") icon= $(video).parent().find("div i:nth-child(2)")

  $(icon).show()
 
}
let cameraOn = true;
let micOn = true

function turnOffCamera(element,emit){

  if(myLocalStream == null || myLocalStream =="" ) return

  if(myLocalStream.getVideoTracks()[0] === undefined || fakeStream){
    $(element).addClass("fa-solid fa-video-slash")
    onceToggle("camera",userID)
    cameraOn =false
    return
  }
  toggleVideoSettings("camera",userID)
  if(emit) socket.emit("sendToggle",{what:"camera",ID:userID})


  $(element).removeClass()

  if(myLocalStream.getVideoTracks()[0].enabled){
  myLocalStream.getVideoTracks()[0].enabled = false
  $(element).addClass("fa-solid fa-video-slash")
  cameraOn =false
  
    return
  }
  $(element).addClass("fa-solid fa-video")
  myLocalStream.getVideoTracks()[0].enabled = true
  cameraOn =true


}


function resetCamAndMicState(){

  if(!cameraOn) myLocalStream.getVideoTracks()[0].enabled = false

  

  if(!micOn)  myLocalStream.getAudioTracks()[0].enabled = false




}

function turnOffMic(element,emit){
  if(myLocalStream == null || myLocalStream =="" ) return

  if(myLocalStream.getAudioTracks()[0] === undefined || fakeStream){
    $(element).addClass("fa-solid fa-microphone-slash")
    onceToggle("mic",userID)
    micOn = false;
    return
  }
    
  
  toggleVideoSettings("mic",userID)
  if(emit)  socket.emit("sendToggle",{what:"mic",ID:userID})

 

  $(element).removeClass()
  if(myLocalStream.getAudioTracks()[0].enabled){
  myLocalStream.getAudioTracks()[0].enabled = false
  $(element).addClass("fa-solid fa-microphone-slash")
  micOn = false;

    return
  }

  $(element).addClass("fa-solid fa-microphone")
  myLocalStream.getAudioTracks()[0].enabled = true
  micOn = true;

}

function createDisconnectListner(pc){

  pc.oniceconnectionstatechange = function() {
    if(pc.iceConnectionState == 'disconnected') {
        console.log('Disconnected');
    }
}
console.log(pc.oniceconnectionstatechange)
}
let performedSearch = false;

async function cameraSwitch(){
  if(myLocalStream == null || myLocalStream =="" ) return
  

  if(videoDevices ==null && !performedSearch){
    videoDevices = await getDevices()
    performedSearch=true;
  } 
  //if search and still noting there no devices return
  if(videoDevices == null || videoDevices == "")return;
  deviceIdIndex++;
  if(deviceIdIndex >= videoDevices.length) deviceIdIndex = 0;
  // same as video Stream

  const deviceIdNow = myLocalStream.getVideoTracks()[0].getCapabilities().deviceId
  console.log(deviceIdNow == videoDevices[deviceIdIndex] && videoDevices.length > 1);

  if(deviceIdNow == videoDevices[deviceIdIndex] && videoDevices.length > 1) {
    cameraSwitch()
    return
  }

console.log("loop");

  const permissions =  await findPermission()
  const videoConstraint = permissions["camera"] === "granted" ? {deviceId:videoDevices[deviceIdIndex]}: false
  const constrain  = {
    video:videoConstraint
  }
  //return
  if(!videoConstraint){
    alert("Camera permission is denied, please accept the permission")
    return;
  }



    try {
     const stream =  await navigator.mediaDevices.getUserMedia(constrain)   
     const peerConnection = peerConnections.map(e=>{return e.peerConnection})
     let videoTrack = stream.getVideoTracks()[0];

     replaceStream(myLocalStream,videoTrack)
       peerConnection.forEach(function(pc) {
       var sender = pc.getSenders().find(function(s) {
         return s.track.kind == videoTrack.kind;
       });
      
       sender.replaceTrack(videoTrack);
     });
      
 
     resetCamAndMicState()


  } catch (error) {

    console.log(error)

  }


  
 



}
function replaceStream(localStream,vidTrack) {

  if(localStream == null)return
  const tracks = localStream.getVideoTracks();
  tracks.forEach((tracks)=>{
    myLocalStream.removeTrack(tracks);
    tracks.stop()
  })

  myLocalStream.addTrack(vidTrack)
  const myVid = findVideoElement(userID)

      myVid.srcObject = myLocalStream;
  
     

}

function addTrack(localStream) {

  if(stream == null)return
  const tracks = stream.getTracks();
  const video = tracks.find((media)=>{
    return media.kind == "video"
  })
  video.stop();


}


function stopStreamedVideo(videoElem) {

  const stream = videoElem.srcObject;
  if(stream == null)return
  const tracks = stream.getTracks();

  tracks.forEach(function(track) {
    track.stop();
  });

  videoElem.srcObject = null;
}


// first joingin
socket.on("peerId",async(param)=>{


const permissions = await findPermission()


const ID = param["userID"]
peer.connect(param["peerId"]);
numberOfUser++;
localData.push({name:param["name"],userID:param["userID"]})
createUsers(param)
createNotifcation({message:param["name"]+" has Joined",leave:false,sendChat:true}) 
caller = peer.call(param["peerId"], myLocalStream,{ metadata: 
  { "ID": userID,"name":username,permissions:permissions}});
peerConnections.push(caller)  
createDisconnectListner(caller)

  let preventEmit = 0;
  caller.on('stream', function(theirStream) {
       if(preventEmit != 0)return

       createVideoWrapper(theirStream,ID)
       autoToggle(param["permissions"],ID)
       pickGrid()

       preventEmit++
 
   });
 


})

const  findPermission = async ()=>{

 const mic = navigator.permissions.query({name: 'microphone'})
  .then((permissionObj) => {
    return permissionObj.state
  })
  .catch((error) => {
   console.log('Got error :', error);
  })
 
 const cam =  navigator.permissions.query({name: 'camera'})
  .then((permissionObj) => {
    return permissionObj.state
  })
  .catch((error) => {
   console.log('Got error :', error);
  })


  return {camera:await cam,microphone:await mic}


}



const createCall =  (stream,permissions)=>{

      myLocalStream = stream;
    

     createMyStream(stream,userID)
     autoToggle(permissions)
     peer.on('call', function(call) {
       numberOfUser++;
       caller = call
       peerConnections.push(caller)
       createDisconnectListner(caller)
     call.answer(stream); 
     let preventEmit = 0;
     call.on('stream', function(theirStream) {
         if(preventEmit != 0)return  
         const ID = call.metadata.ID
         //creating userElements
         createUsers({name:call.metadata.name,userID:ID})
         //pushing their info
         localData.push({name:call.metadata.name,userID:ID})
         
         createVideoWrapper(theirStream,ID)
         autoToggle(call.metadata.permissions,ID)
         
         pickGrid()
   
   
          preventEmit++
       
   
     });
     
     
     });

   


}
function autoToggle(permission,id) {
  
  if(id != null){

    if(permission["camera"] != "granted")toggleVideoSettings("camera",id)

    if(permission["microphone"] != "granted")toggleVideoSettings("mic",id)

    return
  }


  if(permission["camera"] != "granted") turnOffCamera($("#videoButton")[0],false)

  if(permission["microphone"] != "granted") turnOffMic($("#audioButton")[0],false)

  
}

async function joining(peerID){


 const permissions =  await findPermission()
 const videoConstraint = permissions["camera"] === "granted" ? {facingMode :"environment"}: false
 const audioConstraint = permissions["microphone"] === "granted" ? true : false
 const constrain  = {
   video:videoConstraint,
   audio:audioConstraint
 }


let  stream
  try {

    (!videoConstraint && !audioConstraint)  ?
    stream = new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({ width:640, height:480 })])  : stream =  await navigator.mediaDevices.getUserMedia(constrain)   
     createCall(stream,permissions)

     socket.emit("joining",{peerId:peerID,name:username,userID:userID,permissions:permissions})
  
    } catch (error) {
   
      console.log(error)

      
  
  }





}

//creating if they dont have audio
const createEmptyAudioTrack = () => {
  fakeStream =true
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return Object.assign(track, { enabled: true });
}

const createEmptyVideoTrack = ({ width, height }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width, height });
  canvas.getContext('2d').fillRect(0, 0, width, height);

  const stream = canvas.captureStream();
  const track = stream.getVideoTracks()[0];

  return Object.assign(track, { enabled: true });
};


// carousel script

function moveforward(){
let limit = numberOfGrid;
if(numberOfGrid == 5){

  limit = 1;
}

  //append the first child to last
  for(let i = 0; i< limit; i++){
    let firstChild = $(videoContainer).children().first()
    if(limit == 1 && numberOfGrid != 5 && numberOfUser >= 2)firstChild = $(videoContainer).children()[1]
    $(videoContainer).append(firstChild);


  }


}



function moveback(){
  const limit = numberOfGrid;
 for(let i = 0; i< limit; i++){
    let firstChild = $(videoContainer).children().last()

    $(videoContainer).prepend(firstChild);
    if(limit == 1 &&  numberOfGrid != 5 &&  numberOfUser >= 2)$(videoContainer).prepend($('.my-video'));

  }

}




let numberOfGrid = 5;
let nakapiliba= false


function pickGrid(){

  switch(numberOfUser){
         
    case 1:
      addClassGrid("video-grid-5",5)
    break
    case 2:
      addClassGrid("video-grid-1",1)
    break

    case 3:
      addClassGrid("video-grid-3",3)

    break;

    default:
      addClassGrid("video-grid-4",4)

    break;

   } 


}
function addClassGrid(className , gridNumber){

  $(videoContainer).removeClass()
  $(videoContainer).addClass(className)
  numberOfGrid = gridNumber;
  
}


function manualPickGrid(){

  numberOfGrid++;
  if(numberOfGrid == 1  && numberOfUser >=2){
    addClassGrid("video-grid-1" , numberOfGrid)
    $(videoContainer).prepend($(".my-video"));
    nakapiliba = true;
   
  }
  if(numberOfGrid == 2 && numberOfUser >=2){
    addClassGrid("video-grid-2" , numberOfGrid)
    nakapiliba = true;
  
  }

  if(numberOfGrid == 3 && numberOfUser >= 3){
    addClassGrid("video-grid-3" , numberOfGrid)
    nakapiliba = true;
    

  }
  if(numberOfGrid == 4 && numberOfUser >= 4){
    addClassGrid("video-grid-4" , numberOfGrid)
    nakapiliba = true;
  

  }
  if(numberOfGrid == 5){
    addClassGrid("video-grid-5" , numberOfGrid)
    nakapiliba = true;
  

  }


  if(numberOfGrid >= 6) numberOfGrid = 0;
  if(!nakapiliba) manualPickGrid()
  if(nakapiliba) nakapiliba = false
   


}



function createNotifcation(message){

  if(message["sendChat"])createMessage({sender:"Server",message:message["message"],name:"Server"})


let div = $("<div style = 'display:none;' class = 'color1'><span></span></div>")
if(message['leave'])div = $("<div style = 'display:none;' class = 'color2'><span></span></div>")
$(div).find("span").text(message["message"])
$("#notification-up").append(div)
$(div).on("click",()=>$(div).remove())

$(div).slideDown( 300, function() {
setTimeout(()=>$(this).remove(),2000)
});

}

function createVideoWrapper(stream,ID){
  const divElement = document.createElement("div")
  const anotherDiv = "<div><div><i class='fa-solid fa-microphone-slash'></i><i class='fa-solid fa-video-slash'></i></div></div>"


  $(divElement).addClass("video-wrapper")
  $(divElement).html(anotherDiv)


  const videoelemet = document.createElement("video")
 
 $(videoelemet).data("data-id",ID)
 $(videoelemet).attr("data-id",ID)
 $(videoelemet).attr('webkit-playsinline', '');
 $(videoelemet).attr('playsinline', '');


  videoelemet.srcObject = stream
 
  $(divElement).append(videoelemet)
 $(videoelemet).on("loadedmetadata",()=>{
    
  videoelemet.play()

   })
 
  $(videoContainer).append(divElement)

}

function createMyStream(stream,ID){

  const divElement = document.createElement("div")
  const anotherDiv = "<div><div><i class='fa-solid fa-microphone-slash'></i><i class='fa-solid fa-video-slash'></i></div></div>"
  $(divElement).html(anotherDiv)
  $(divElement).addClass("my-video")


  const videoelemet = document.createElement("video")

 
  $(videoelemet).data("data-id",ID)
  $(videoelemet).attr("data-id",ID)
  $(videoelemet).attr('webkit-playsinline', '');
  $(videoelemet).attr('playsinline', '');

  
  videoelemet.srcObject = stream
 
  $(divElement).append(videoelemet)
  $(videoelemet).on("loadedmetadata",()=>{
    videoelemet.muted = "muted";
    videoelemet.play()
   })
 
  $(videoContainer).prepend(divElement)




}

function createUsers(data){
  let time = new Date();
  time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  const object =    $("<div class='user'><div><i class='fa-solid fa-user'></i></div><div><div><span>Joined: "+time+"</span></div><div><span></span></div></div></div>")
  const span = $(object).find("div:nth-child(2) > div:nth-child(2) span")
  $(span).text("Name: "+data["name"])
  $(object).data("data-id",data["userID"])
  console.log(data["userID"])
  $("#users").append($(object))
  $("#numberUsers").text(localData.length)

}

function removeUsers(id){
 $("#users").children().toArray().filter((e)=> $(e).data("data-id")==id)[0].remove()
 $("#numberUsers").text(localData.length)

}



function createMessage(message){
  // message["sender"] ="me"
  let time = new Date();
  time = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })


 const messageObject = "<div class ='chat'><div><span></span></div><div><span></span></div><div><span>"+time+"</span></div></div>"

 const html = $.parseHTML(messageObject)
 $("#chat").append(html)

 switch(message["sender"]){

  case "me":
      $(html).children().first().children().first().css("color","#2f59f5").text(message["name"])

  break;

  case "them":
  $(html).children().first().children().first().css("color","black").text(message["name"])

  break;

  default:

  $(html).children().first().children().first().css("color","red").text(message["name"])

 }
$(html).children("div:nth-child(2)").children().first().text(message["message"])

$(html)[0].scrollIntoView()


}

function chat(){

  let message = $("#message").val()
  message = message.replace(/(\r\n|\r|\n){2}/g, '$1').replace(/(\r\n|\r|\n){3,}/g, '$1\n');
  
  if(message.trim() =="" || message.trim() ==null){
  console.log("spaces only");
  return
  }

const data = {sender:"me",message:message,name:username}
  createMessage(data)

  data["sender"]="them"

socket.emit("sendMessage",data)
$("#message").val("")
$("#message")[0].focus()

}

function checkIfchatboxIsHidden(){
  if($("#chatbox").css("display") == "flex" && $("#sideBody").css("display") == "flex")return

  //creating notif 

 const numberofmessage =  Number($("#messageNotif span").first().text())+1
 console.log(numberofmessage)
 $("#messageNotif span").first().text(numberofmessage)
 $("#messageNotif").show()

 
}

function resetNotif(){

  if($("#chatbox").css("display") != "flex")return
  $("#messageNotif").hide()
  $("#messageNotif span").first().text(0)
}
