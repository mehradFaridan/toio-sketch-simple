const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const { NearestScanner } = require('@toio/scanner')
const app = express()
const server = http.Server(app)
const io = socketio(server)

app.use(express.static(__dirname))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/simulator', (req, res) => {
  res.sendFile(path.join(__dirname + '/simulator.html'))
})

server.listen(3000, () => {
  console.log('listening 3000')
})

let cube_global = null;
let cube_x;
let cube_y;
let cube_angle;

io.on('connection', async (socket) => {

  await new NearestScanner().start().then((cube) => {
    // console.log(cube);
    cube.connect()
    cube.on('id:position-id', (data) => {

      cube_x = data.x
      cube_y = data.y
      cube_angle = data.angle

      socket.emit('pos', { cubes: [data] })
    
    })

    cube_global = cube;

  })

  console.log('connected')

  // If click has occured, points will be sent to
  // server that the toio must move to
  socket.on('move', (x, y) => {

    if (cube_global){
      
      cube_global.move(...move(x, y, cube_x, cube_y, cube_angle), 100)
    
    }

  })

})



function move(targetX, targetY, cX, cY, cA) {

  // console.log("cube = ", cube)

  // console.log("targetX = ", targetX)
  // console.log("targetY = ", targetY)

  // console.log("cubeX = ", cube.x)
  // console.log("cubeY = ", cube.y)

  let diffX = targetX - cX
  let diffY = targetY - cY
  let distance = Math.sqrt(diffX ** 2 + diffY ** 2)

  // console.log("diffX = ", diffX)
  // console.log("diffX = ", diffX)
  // console.log("diffY = ", diffY)
  // console.log("distance = ", distance)
  
  if (distance < 5) {
    return [0, 0]
  }

  let relAngle = (Math.atan2(diffY, diffX) * 180) / Math.PI - cA
  //console.log("relAngle = ", relAngle)
  relAngle = relAngle % 360

  if (relAngle < -180) {
    relAngle += 360
  } 

  else if (relAngle > 180) {
    relAngle -= 360
  }

  let ratio = Math.abs(1 - Math.abs(relAngle) / 90)
  //console.log("Ratio = ", ratio)

  let speed = 40

  if (relAngle > 0 && relAngle <= 90) {
    // forward
    console.log('test1')

    return [speed, speed * ratio]
  } 

  else if (relAngle > 90) {
    // backward
    console.log('test2')

    return [-speed, -speed * ratio]
  } 

  else if (relAngle < 0 && relAngle >= -90) {
    // forward
    console.log('test3')

    return [speed * ratio, speed]
  } 

  else if (relAngle < -90) {
    // backward
    console.log('test4')

    return [-speed * ratio, -speed]
  }

  if (relAngle > 0) {
    console.log('test5')
    return [speed, speed * ratio]
  } 

  else {
    console.log('test6')
    return [speed * ratio, speed]
  }

}

// async function main(socket) {

// }




