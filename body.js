'use strict';

var webcamElement  = document.getElementById('webcam');
var videoSelect    = document.querySelector('select#videoSource');
var predictText    = document.getElementById('prediction');

videoSelect.onchange = getStream;

function getDevices() {
  return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
  console.log('Got Devices ');
  window.deviceInfos = deviceInfos; // make available to console

  for (const deviceInfo of deviceInfos) {
    const option = document.createElement('option');
    console.log( deviceInfo );
    if (deviceInfo.kind === 'videoinput') {
      option.value = deviceInfo.deviceId;
      console.log(" Source  ", deviceInfo.deviceId );
      console.log(" Source  ", deviceInfo );
      console.log(" Source  ", deviceInfo.label );
      option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    }
  }
}

function gotStream( stream ) {
  console.log('Got stream ');
  window.stream = stream;
  console.log("Selected items");
  console.log(videoSelect.options);
  videoSelect.selectedIndex = [ ...videoSelect.options].findIndex(option => option.text == stream.getVideoTracks()[0].label);
  webcamElement.srcObject = stream;
  webcamElement.addEventListener('loadeddata',  () => resolve(), false);
}

function getStream() {
  console.log('Get stream ');
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }

  const videoSource = videoSelect.value;

  console.log("Video source", videoSource);

  const constraints = {
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };

  return navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function handleError(error) {
  console.log('Error: ', error);
}

console.log('Loading mobilenet..');
predictText.innerText = `
 Loading mobilenet
`
// Load the model.
var net = await bodyPix.load();
console.log('Sucessfully loaded model');
predictText.innerText = `
Sucessfully loaded model
`

async function app() {

  while (true) {
      // Get the most likely class and confidences from the classifier module.
      var outputStride = 16;
      var segmentationThreshold = 0.5;
      console.log(net);
      var segmentation = net.estimatePersonSegmentation(webcamElement, outputStride, segmentationThreshold);
      const rainbow = [
        [110, 64, 170], [106, 72, 183], [100, 81, 196], [92, 91, 206],
        [84, 101, 214], [75, 113, 221], [66, 125, 224], [56, 138, 226],
        [48, 150, 224], [40, 163, 220], [33, 176, 214], [29, 188, 205],
        [26, 199, 194], [26, 210, 182], [28, 219, 169], [33, 227, 155],
        [41, 234, 141], [51, 240, 128], [64, 243, 116], [79, 246, 105],
        [96, 247, 97],  [115, 246, 91], [134, 245, 88], [155, 243, 88]
      ];

      const invert = true;

      // the colored part image is an rgb image with a corresponding color from thee rainbow colors for each part at each pixel, and black pixels where there is no part.
      const coloredPartImage = bodyPix.toColoredPartImageData(segmentation, rainbow);
      const opacity = 0.7;
      const flipHorizontal = true;
      const maskBlurAmount = 0;
      const canvas = document.getElementById('canvas');
      console.log(canvas);
      // draw the colored part image on top of the original image onto a canvas.  The colored part image will be drawn semi-transparent, with an opacity of 0.7, allowing for the original image to be visible under.
      bodyPix.drawMask(
        canvas, imageElement, coloredPartImageData, opacity, maskBlurAmount,
        flipHorizontal);
      console.log(segmentation);
      await tf.nextFrame();
  }
}

load_model();
getStream().then(getDevices).then(gotDevices).then(app);
//app();
