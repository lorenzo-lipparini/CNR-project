'use strict'


const fs = require('fs-extra');

const { exec } = require('child_process');

const express = require('express');
const bodyParser = require('body-parser');


// Start the search of the port from 8000
let port = 8000;

// Find a port that is not being used, base the search on the existance of a corresponding out folder
while (fs.existsSync(`./out${++port}`)) { }

fs.mkdirSync(`./out${port}`);
fs.mkdirSync(`./out${port}/frames`);


const app = express();
app.use(bodyParser.json({ limit: '1gb' })); // Virtually limitless


app.use('/CNR', express.static('./build'));

// Make p5 easier to import
app.get('/p5.js', (req, res) => {
  res.sendFile(`${__dirname}/node_modules/p5/lib/p5.min.js`);
});

// Serve the same html for all the sketches
app.get('/CNR/*/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});


let videoInfo = undefined;
let receivedFrames = 0;

app.get('/video-service/new', (req, res) => {
  console.log('New video requested');

  // Clear the out folder
  fs.emptyDirSync(`./out${port}`);
  fs.mkdirSync(`./out${port}/frames`);

  // Reset all the variables
  videoInfo = undefined;
  receivedFrames = 0;

  res.sendStatus(200);
});

app.post('/video-service/push-frame', async ({ body: frame }, res) => {
  await fs.writeFile(`./out${port}/frames/${frame.id}.png`, frame.data, 'base64');

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
  if (videoInfo !== undefined && receivedFrames === videoInfo.framesNumber) {
    const { frameRate, resolution: res } = videoInfo; 

    console.log('All frames received, running FFmpeg...');

    const RUN_FFMPEG = `ffmpeg -r ${frameRate} -s ${res.x}x${res.y} -i ./out${port}/frames/%d.png -crf 1 -pix_fmt yuv420p ./out${port}/video.mp4`;
    exec(RUN_FFMPEG, () => {
      console.log('Done.\n');
    });
  }
}


app.listen(port, () => {
  console.log(`\n=== SERVER RUNNING ON PORT ${port} ===\n`);
});
