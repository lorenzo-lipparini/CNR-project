'use strict'


const fs = require('fs-extra');

const { exec } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');


const app = express();
app.use(bodyParser.json({ limit: '1gb' })); // Virtually limitless


app.use('/CNR', express.static('./build'));

// Make p5 easier to import
app.get('/p5.js', (req, res) => {
  res.sendFile(__dirname + '/node_modules/p5/lib/p5.min.js');
});

// Serve the same html for all the sketches
app.get('/CNR/*/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


let videoInfo = null;
let receivedFrames = 0;

app.get('/video-service/new', (req, res) => {
  console.log('New video requested');

  // Free the './out' directory from the data of the previous video
  fs.emptyDirSync('./out');
  fs.mkdirSync('./out/frames');

  // Reset all the variables
  videoInfo = null;
  receivedFrames = 0;

  res.sendStatus(200);
});

app.post('/video-service/push-frame', async ({ body: frame }, res) => {
  await fs.writeFile(`./out/frames/${frame.id}.png`, frame.data, 'base64');

  receivedFrames++;
  checkAllFramesReceived();

  res.sendStatus(200);
});

app.post('/video-service/give-info', (req, res) => {
  videoInfo = req.body;
  
  // The info might have been sent after all the frames
  checkAllFramesReceived();

  res.sendStatus(200);
});


function checkAllFramesReceived() {
  if (videoInfo !== null && receivedFrames === videoInfo.framesNumber) {
    const { frameRate, resolution: { x: resX, y: resY } } = videoInfo; 

    console.log('All frames received, running FFmpeg...');

    const RUN_FFMPEG = `ffmpeg -r ${frameRate} -s ${resX}x${resY} -i ./out/frames/%d.png -crf 1 -pix_fmt yuv420p ./out/video.mp4`;
    exec(RUN_FFMPEG, () => {
      console.log('Done.\n');
    });
  }
}


app.listen(8080);

console.log('\n=== SERVER RUNNING ===\n');
