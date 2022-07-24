const { writeFileSync, existsSync, mkdirSync, createWriteStream } = require('fs');
const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');

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

app.listen(18091)

module.exports = {
  express: app
}