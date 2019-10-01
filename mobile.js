'use strict';

var webcamElement  = document.getElementById('webcam');
var videoSelect    = document.querySelector('select#videoSource');
var predictText    = document.getElementById('prediction');
let net;

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

async function app() {
  console.log('Loading mobilenet..');
  predictText.innerText = `
  Loading mobilenet
  `
  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  predictText.innerText = `
  Sucessfully loaded model
  `
  console.log( mobilenet);

  getStream().then(getDevices).then(gotDevices);

  while (true) {
      // Get the most likely class and confidences from the classifier module.
      net.classify(webcamElement).then(predictions => {
        console.log('Predictions: ');
        console.log(predictions);
        console.log(predictions[0]);
        predictText.innerText = `Prediction: ${predictions[0].className}`
    });

    await tf.nextFrame();
  }
}

app();
