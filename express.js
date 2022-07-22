const { writeFileSync, existsSync, mkdirSync } = require('fs');
const express = require('express')
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');

const DIRECTORY = 'files';

const app = express()
app.use(fileUpload({ createParentPath: true }));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
  console.log('hello');
  res.send('Hello World')
})

app.post('/', function (req, res) {
  const file = req.files.file;
  const dir = `./${DIRECTORY}/${req.body.album}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${file.name}`, file.data);
  res.send({ status: 200, message: 'File saved' })
})

app.listen(18091)

module.exports = {
  express: app
}