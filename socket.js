const { Server } = require('socket.io');
const path = require('path');
const { existsSync, mkdirSync, createWriteStream } = require('fs');

class Socket {
  directory = 'files';
  writeStream;
  fileParts = {};
  socket = new Server({
    maxHttpBufferSize: 10 * 1024*1024, // 100 MB
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

      client.on("upload-part", (image, callback) => {
        if (!(image.id in this.fileParts)) {
          this.fileParts[image.id] = 0;
          this.createStream(image);
        } else {
          this.fileParts[image.id] += 1;
        }
        console.log("Received part", `${this.fileParts[image.id]} - ${image.parts}`); // not displayed
        this.writeStream.write(Buffer.from(image.data, 'base64'));
        if ((this.fileParts[image.id] + 1) === image.parts) {
          this.writeStream.end();
          client.emit('file-saved', { id: image.id, name: image.name, album: image.album });
          delete this.fileParts[image.id];
        }
        callback('Done');
      })
     
      client.on("disconnect", (reason) => {
        console.log('disconnected', reason);
      });
    });

    this.socket.listen(18092);
  }

  createStream({ name, album, id }) {
    const dir = `./${this.directory}/${album}`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.writeStream = createWriteStream(`${dir}/${name}`);
  }

  /*
  createStream(album, name, data) {
    const dir = `./${this.directory}/${album}`;
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(`${dir}/${name}`, Buffer.from(data, 'base64'));
  }
  */

}

module.exports = {
  SocketService: new Socket()
}