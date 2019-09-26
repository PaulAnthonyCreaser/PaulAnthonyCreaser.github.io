'use strict';

var classifier    = knnClassifier.create();
var webcamElement = document.getElementById('webcam');
var videoSelect   = document.querySelector('select#videoSource');
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

console.log("get stream");
console.log("get devices");
getStream().then(getDevices).then(gotDevices);

function handleError(error) {
  console.log('Error: ', error);
}

async function app() {
  console.log('Loading mobilenet..');
  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');
    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));
  document.getElementById('class-e').addEventListener('click', () => addExample(4));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);
      const classes = ['A', 'B', 'C', 'D', 'E'];
      var item = "Unknown"
      if ( result.classIndex == 0) {
        item = document.getElementById('text-a').value;
      } else if ( result.classIndex == 1) {
        item = document.getElementById('text-b').value;
      } else if ( result.classIndex == 2) {
        item = document.getElementById('text-c').value;
      } else if ( result.classIndex == 3) {
        item = document.getElementById('text-d').value;
      } else if ( result.classIndex == 4) {
        item = document.getElementById('text-e').value;
      }

      var confidence =  result.confidences[result.classIndex];
      if ( confidence < 0.7 ) {
        item = "Unknown";
      }
      if ( item == "Unknown") {
        document.getElementById('console').innerText = `
        Prediction: ${item}
        `
      } else {
        document.getElementById('console').innerText = `
        Prediction: ${item} Probability: ${result.confidences[result.classIndex]}
        `
      }
    } else {
      document.getElementById('console').innerText = `
      Nothing to detect
      `
    }
    await tf.nextFrame();
  }
}

app();
