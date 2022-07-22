const { Server } = require('socket.io');
const ss = require('socket.io-stream');
const path = require('path');

class Socket {
  directory = 'files';
  partedFiles = {};
  socket = new Server({
    maxHttpBufferSize: 1e10, // 100 MB
    perMessageDeflate: false,
    pingInterval: 1000,
    pingTimeout: 10000
  });
  constructor() {
    this.socket.on('connection', (client) => {
      console.log('connection');
      this.socket.emit('welcome');

      client.on("upload", (image) => {
        console.log("Received image", image.name); // not displayed
        this.createFile(image.album, image.name, image.data);
        client.emit('file-saved', { id: image.id, name: image.name, album: image.album });
      })

      client.on("upload-part", (image) => {
        console.log("Received part", image.part); // not displayed
        if (!(image.id in this.partedFiles)) this.partedFiles[image.id] = {};
        this.partedFiles[image.id]  [image.part] = image.data;
        if (Object.keys(this.partedFiles[image.id]).length === image.parts) {
          this.createFile(image.album, image.name, Object.values(this.partedFiles[image.id]).join(''));
          client.emit('file-saved', { id: image.id, name: image.name, album: image.album });
          delete this.partedFiles[image.id];
        }
      })
     
      client.on("disconnect", (reason) => {
        console.log('disconnected', reason);
      });
    });

    this.socket.listen(18092);
  }

}

module.exports = {
  SocketService: new Socket()
}