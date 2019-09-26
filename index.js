'use strict';

var classifier     = knnClassifier.create();
var webcamElement  = document.getElementById('webcam');
var videoSelect    = document.querySelector('select#videoSource');
var predictText    = document.getElementById('prediction');
var buttonA        = document.getElementById('class-a');
var buttonB        = document.getElementById('class-b');
var buttonC        = document.getElementById('class-c');
var buttonD        = document.getElementById('class-d');
var buttonE        = document.getElementById('class-e');
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
  predictText.innerText = `
  Loading mobilenet
  `
  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');
  predictText.innerText = `
  Sucessfully loaded model
  `
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
  buttonA.addEventListener('click', () => addExample(0));
  buttonB.addEventListener('click', () => addExample(1));
  buttonC.addEventListener('click', () => addExample(2));
  buttonD.addEventListener('click', () => addExample(3));
  buttonE.addEventListener('click', () => addExample(4));

  predictText.innerText = `
  Button set clicks setup
  `

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      console.log(result);
      console.log(result.confidences);
      console.log(result.confidences.length);
      console.log(result.confidences[0]);
      var item = "Unknown"
      if ( result.classIndex == 0) {
        item = "Item 1";
      } else if ( result.classIndex == 1) {
        item = "Item 2";
      } else if ( result.classIndex == 2) {
        item = "Item 3";
      } else if ( result.classIndex == 3) {
        item = "Item 4";
      } else if ( result.classIndex == 4) {
        item = "Item 5";
      }

      var classNum = Object.keys(result.confidences).length;
      if ( classNum > 0 ) {
        if ( result.confidences[0] == 0 ){
          buttonA.style.backgroundColor = "#FF0000";
          console.log("Red");
        } else if ( result.confidences[0] < 0.4 ){
          buttonA.style.backgroundColor = "#FF9E00";
          console.log("Orange");
        } else if ( result.confidences[0] < 0.8 ){
          buttonA.style.backgroundColor = "#FFF600";
          console.log("Yellow");
        } else {
          buttonA.style.backgroundColor = "#00FF00";
          console.log("Green");
        }
      }

      if ( classNum > 1 ) {
        if ( result.confidences[1] == 0 ){
          buttonB.style.backgroundColor = "#FF0000";
          console.log("Red");
        } else if ( result.confidences[1] < 0.4 ){
          buttonB.style.backgroundColor = "#FF9E00";
          console.log("Orange");
        } else if ( result.confidences[1] < 0.8 ){
          buttonB.style.backgroundColor = "#FFF600";
          console.log("Yellow");
        } else {
          buttonB.style.backgroundColor = "#00FF00";
          console.log("Green");
        }
      }


      if ( classNum > 2 ) {
        if ( result.confidences[2] == 0 ){
          buttonC.style.backgroundColor = "#FF0000";
          console.log("Red");
        } else if ( result.confidences[2] < 0.4 ){
          buttonC.style.backgroundColor = "#FF9E00";
          console.log("Orange");
        } else if ( result.confidences[2] < 0.8 ){
          buttonC.style.backgroundColor = "#FFF600";
          console.log("Yellow");
        } else {
          buttonC.style.backgroundColor = "#00FF00";
          console.log("Green");
        }
      }

      if ( classNum > 3 ) {
        if ( result.confidences[3] == 0 ){
          buttonD.style.backgroundColor = "#FF0000";
          console.log("Red");
        } else if ( result.confidences[3] < 0.4 ){
          buttonD.style.backgroundColor = "#FF9E00";
          console.log("Orange");
        } else if ( result.confidences[3] < 0.8 ){
          buttonD.style.backgroundColor = "#FFF600";
          console.log("Yellow");
        } else {
          buttonD.style.backgroundColor = "#00FF00";
          console.log("Green");
        }
      }

      if ( classNum > 4 ) {
        if ( result.confidences[4] == 0 ){
          buttonE.style.backgroundColor = "#FF0000";
          console.log("Red");
        } else if ( result.confidences[4] < 0.4 ){
          buttonE.style.backgroundColor = "#FF9E00";
          console.log("Orange");
        } else if ( result.confidences[4] < 0.8 ){
          buttonE.style.backgroundColor = "#FFF600";
          console.log("Yellow");
        } else {
          buttonE.style.backgroundColor = "#00FF00";
          console.log("Green");
        }
      }

      var confidence =  result.confidences[result.classIndex];
      if ( confidence < 0.7 ) {
        item = "Unknown";
      }
      if ( item == "Unknown") {
        predictText.innerText = `Prediction: ${item}
        `
      } else {
        predictText.innerText = `Prediction: ${item} Probability: ${result.confidences[result.classIndex]}
        `
      }
    } else {
      predictText.innerText = `Nothing to detect
      `
    }
    await tf.nextFrame();
  }
}

app();
