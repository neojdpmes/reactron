const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { Server } = require('socket.io');

class Socket {
  directory = 'files';
  socket = new Server({
    maxHttpBufferSize: 1e10, // 100 MB
    pingInterval: 1000,
    pingTimeout: 10000
  });
  constructor() {
    this.socket.on('connection', (client) => {
      console.log('connection');
      this.socket.emit('welcome');

      client.on("upload", (image) => {
        console.log("Received image", image.name); // not displayed
        // Check if dir exists
        const dir = `${this.directory}/${image.album}`
        if (!existsSync(dir)) mkdirSync(dir);
        writeFileSync(`${dir}/${image.name}`, Buffer.from(image.data, 'base64'));
        client.emit('file-saved', { id: image.id, name: image.name, album: image.album });
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