import React, {useRef, useState} from 'react';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities';
import { useSpeechSynthesis } from 'react-speech-kit';


function App() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const { speak } = useSpeechSynthesis();

  let yawn_thresh_60cm = 28;
  let audio = new Audio('./beep.mp3')
  

  const faceMesh = async () =>{
    const net = await facemesh.load({
      inputResolution:{width: 640, height: 480}, scale: 0.8
    });
    setInterval(()=>{
      detect(net)
    }, 3000)
  }

  

  const detect = async (net) => {
    if(typeof webcamRef.current !== 'undefined' && webcamRef.current !== null &&  webcamRef.current.video.readyState===4){
       const video = webcamRef.current.video;
       const videoWidth = webcamRef.current.video.videoWidth;
       const videoHeight = webcamRef.current.video.videoHeight;

       webcamRef.current.video.width = videoWidth;
       webcamRef.current.video.height = videoHeight;

       canvasRef.current.width = videoWidth;
       canvasRef.current.height = videoHeight;

       const face = await net.estimateFaces(video);

       const ctx = canvasRef.current.getContext('2d');
      drawMesh(face, ctx);

      //Yawn
      let yawn_x_coords = face[0].scaledMesh[13][0] - face[0].scaledMesh[14][0]
      let yawn_y_coords = face[0].scaledMesh[13][1] - face[0].scaledMesh[14][1]
      let yawn_distance = Math.sqrt(yawn_x_coords*yawn_x_coords + yawn_y_coords * yawn_y_coords)
      // console.log(yawn_distance);
      if(yawn_distance > yawn_thresh_60cm){
        speak({
           text: "You are Yawning"
        })
      }

      //Uder Development
      // Right Eye
      let reye_x_coords = face[0].scaledMesh[159][1] - face[0].scaledMesh[153][1]
      let reye_y_coords = face[0].scaledMesh[159][2] - face[0].scaledMesh[153][2]
      let reye_distance = Math.sqrt(reye_x_coords*reye_x_coords + reye_y_coords * reye_y_coords)
      let leye_x_coords = face[0].scaledMesh[386][1] -face[0].scaledMesh[380][1]
      let leye_y_coords = face[0].scaledMesh[386][2] -face[0].scaledMesh[380][2]
      let leye_distance = Math.sqrt(leye_x_coords*leye_x_coords + leye_y_coords*leye_y_coords)
      console.log(leye_distance, reye_distance)
      if(reye_distance < 8 && leye_distance < 8.5){
        speak({
          text: "You are feeling sleepy"
        })
      }

    }
  }

  faceMesh();



  return (

    <div className="App">
      <header className='App-header'>
        <Webcam ref={webcamRef} 
          style ={
            {
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 9,
              width: 640,
              height: 480
            }
          }
        />
        <canvas ref={canvasRef} 
          style ={
            {
              position: 'absolute',
              marginLeft: 'auto',
              marginRight: 'auto',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: 9,
              width: 640,
              height: 480
            }
          }
        />
      </header>
    </div>
  );
}

export default App;
