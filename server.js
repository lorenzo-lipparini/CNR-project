'use strict'


const fs = require('fs-extra');

const { exec } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json({ limit: '1gb' })); // Virtually limitless


app.use('/CNR', express.static('./'));

// Make p5 and lib modules easier to import
app.get('/p5.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/p5/lib/p5.min.js');
});
app.use('/lib', express.static('./lib'));


let receivedFrames = 0;
let expectedFrames = -1;

app.get('/video-service/new', (req, res) => {
  // Free the './out' directory from the frames of the previous video
  fs.emptyDirSync('./out');

  // Reset all the variables
  receivedFrames = 0;
  expectedFrames = -1;

  res.sendStatus(200);
});

app.post('/video-service/push-frame', async ({ body: frame }, res) => {
  await fs.writeFile('./out/frame' + frame.id + '.png', frame.data, 'base64');

  receivedFrames++;
  checkAllFramesReceived();

  res.sendStatus(200);
});

app.post('/video-service/give-info', ({ body: videoInfo }, res) => {
  expectedFrames = videoInfo.framesNumber;
  
  // The info might be sent after all the frames
  checkAllFramesReceived();

  res.sendStatus(200);
});


function checkAllFramesReceived() {
  if (receivedFrames === expectedFrames) {
    console.log('All frames received, running FFmpeg...');

    const RUN_FFMPEG = 'ffmpeg -r 60 -i ./out/frame%d.png -crf 1 -pix_fmt yuv420p ./out/video.mp4';
    exec(RUN_FFMPEG, () => {
      console.log('Done.\n');
    });
  }
}


app.listen(8080);

console.log('\n=== SERVER RUNNING ===\n');
