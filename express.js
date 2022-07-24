const { existsSync, mkdirSync, createWriteStream } = require('fs');
const {Base64Decode} = require("base64-stream");
const express = require('express')
const cors = require('cors');

const DIRECTORY = 'files';

const app = express()
app.use(cors());

app.get('/', function (req, res) {
  console.log('hello');
  res.send('Hello World')
})

app.post('/', function (req, res) {
  const body = JSON.parse(req.headers.params);
  const dir = `./${DIRECTORY}/${body.album}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  req.pipe(createWriteStream(`${dir}/${body.name}`));
  req.on('end', () => {
    res.send({ status: 200, message: 'File saved' })
  });
})

app.post('/parts', function (req, res) {
  console.log(req.body)
  const body = JSON.parse(req.headers.params);
  const dir = `./${DIRECTORY}/${body.album}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  req.pipe(new Base64Decode()).pipe(createWriteStream(`${dir}/${body.name}`, { flags: 'a' }));
  req.on('end', () => {
    res.send({ status: 200, message: 'File part saved' })
  });
})

app.listen(18091)

module.exports = {
  express: app
}