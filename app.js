'use strict';
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const app = express();

const port = process.env.PORT || 5000;

process.env.GOOGLE_APPLICATION_CREDENTIALS = './config/key.json'

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


app.post('/', (req, res) => {

  async function main() {

    const client = new textToSpeech.TextToSpeechClient();

    // Construct the request
    const request = {
      input: { text: req.body.text },
      // Select the language and SSML Voice Gender (optional)
      voice: { languageCode: req.body.lang, ssmlGender: 'NEUTRAL' },
      // Select the type of audio encoding
      audioConfig: { audioEncoding: 'MP3' },
    };

    // Performs the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    let filename = path.join(req.body.filename + '.mp3');
    await writeFile(filename, response.audioContent, 'binary');
    console.log(`Audio content written to file: ${filename}`);
    res.download(filename)
    //res.redirect('/')
    // await writeFile('output.mp3', response.audioContent, 'binary');
    // console.log('Audio content written to file: output.mp3');
  }

  main().catch(console.error);
})


app.listen(`${port}`, () =>
  console.log(`Server is listening ${port}`)
);