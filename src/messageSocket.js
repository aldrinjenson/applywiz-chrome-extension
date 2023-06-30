class MessageSocket {
  constructor() {
    this.messageCallbacks = new Map();
  }

  on(message, callback) {
    console.log('received event: ', message);
    this.messageCallbacks.set(message, callback);
  }

  emit(message, data) {
    // chrome.runtime.sendMessage(message);
    console.log('emitting event: ', message);
    const callback = this.messageCallbacks.get(message);
    // If a matching callback is found, execute it
    if (callback) {
      callback(data);
    }
  }
}

// Create a new instance of MessageSocket
const mSocket = new MessageSocket();

export default mSocket;

// const socket = mSocket;
// console.log('bro');

// // Register an 'on' listener for a message
// socket.on('greeting', (data) => {
//   console.log(`Received greeting: ${data}`);
// });

// console.log('done');

// // Emit a message
// socket.emit('greeting', 'Hello, world!'); // This will trigger the callback defined above
