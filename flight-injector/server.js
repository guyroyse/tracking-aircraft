import net from 'net'
import fs from 'fs'
import readline from 'readline'

// define the path to the ASD-B file to inject
const filePath = 'cmh-2023-04-24.dat'

// define the host and port of the dump1090 network socket
const host = 'localhost'
const port = 30001

// create the input stream for the file
const inputStream = fs.createReadStream(filePath)

// create a new socket object
const socket = new net.Socket()

// connect the socket to dump1090
socket.connect(port, host, () => console.log('Connected to dump1090'))

// handle errors on the socket
socket.on('error', err => {
  console.error(`Error: ${err}`)
  socket.destroy()
})

// handle the close event on the socket
socket.on('close', () => console.log('Connection closed'))

// create a readline interface to read the file line by line
const rl = readline.createInterface({ input: inputStream, crlfDelay: Infinity })

// used to compete the wait
let firstTimestamp = null

rl.on('line', line => {

  // split the line into timestamp and packet
  const [timestamp, packet] = line.split(' ')

  // if this is the first line, set the first timestamp
  if (firstTimestamp === null) firstTimestamp = new Date(timestamp).getTime()

  // calculate the time difference between this line's timestamp and the first timestamp
  const currentTimestamp = new Date(timestamp).getTime()
  const timeDifference = currentTimestamp - firstTimestamp

  setTimeout(() => {
    console.log(`Sending data: ${packet} @ ${timeDifference}`)
    socket.write(`${packet}\n`)
  }, timeDifference)

})

// handle the close event on the file stream
rl.on('close', () => console.log('Finished reading file'))
