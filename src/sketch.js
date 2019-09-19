// import "p5/lib/addons/p5.dom";

const scale = 1;
const width = 640 * scale;
const height = 480 * scale;

// setSketch sets this
let p5;

//logging data
let label;

// setup initializes this
let video;
let osc;

//Pose vars
let preveyePos;
let prevPose;

export function setSketch(sketch) {
  p5 = sketch;
}

export function setup() {
  p5.createCanvas(width, height);
  p5.background(0);
  video = p5.select('video') || p5.createCapture(p5.VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  const poseNet = ml5.poseNet(video, () => p5.select('#status').hide());

  // Every time we get a new pose, draw it
  poseNet.on('pose', drawPoses);
  
  // Hide the video element, and just show the canvas
  video.hide();

  //field for pose values
  label = p5.createDiv();
  label.position(5, height + 50);
  label.style('font-size', '12pt');

  //init audio button
  const audioButton = p5.createButton('click to start audio');
  audioButton.position(5, height + 100);
  audioButton.mouseClicked(() => {
    p5.userStartAudio().then(() => {
      audioButton.remove();
      osc = new window.p5.Oscillator();
      // now you can call osc methods to make sound happen
        osc.start();

    });
  });
}

export function draw() {
}

function drawPoses(poses) {
  p5.translate(width, 0); // move to far corner
  p5.scale(-1.0, 1.0);
  //p5.tint(255, 100);
  p5.image(video, 0, 0, video.width, video.height);
  
  //p5.fill(0,10);
  // p5.rect(0,0,width,height);

  readSpeed(poses);
  //drawKeypoints(poses);
  //drawSkeleton(poses);
  //playAudio(poses);
}

//want to eventually detect speed, direction, and distance from camera
//(distance between eyes/shoulders/hips..etc)

//Right now I'm only use Xpos of Left eye on ONE pose to evealuate spped (testing purposes)
//will need to flush out system to work for multiple joints AND multiple poses(arrays baybey)

//Function to read and compare speeds of pose keypoints
function readSpeed(poses){
   if(poses.length == 0){ //return if no poses
    return;
  }

  //get vars from pose[0]
  const pose = poses[0];

  if(prevPose == undefined){
    prevPose = pose;
    return;
  }
  pose.pose.keypoints.forEach(function (keypoint, index){
    let prevKeypoint = prevPose.pose.keypoints[index];
    //Calc difference (distance moved)    
    let dif = Math.abs(prevKeypoint.position.x - keypoint.position.x);
    let dir; //I'm going to remember how to use vectors(?) and trig to find the direction of movement
    keypoint.dif = dif; //append to pose
  });
  prevPose = pose; //set current pose to previous


  /* //Testing code with just leftEye position
  const eye = pose[1];
  const eyePos = eye.position;
  label.html('LeftEye: ' + JSON.stringify(eyePos));
  if(preveyePos == undefined){ //return if no prev ref
   preveyePos = eyePos;
   return;
  }
  //calculate difference (distance moved)
  let eyedif = Math.abs(preveyePos.x - eyePos.x);
  preveyePos = eyePos;
  */

  drawKeypoints(pose); //would like to replace function with "update Keypoints"

//Next Steps:
  //Create array of PREVIOUS pose[0](or pose[n] eventually) keypoint positions
  //Array of vectors {(x,y),(x,y)...}
  //use a loop to go through this array 

  //instead of "analyzed poses" loop, just append speed,dir+distance to end of org poses array, and pass that to drawKeypoints
}

function drawKeypoints(pose) {
  //pose drawing

  pose.pose.keypoints.forEach(function (keypoint,index){
      //Create vars for radius and color from dif values
      let dif = keypoint.dif;
      let fill = p5.color(5.0*dif,0,10.0*dif);
      let r = 5.0 + (dif*1.3);

      if (keypoint.score > 0.5) {
        p5.fill(fill);
        p5.noStroke();
        p5.ellipse(keypoint.position.x, keypoint.position.y, r, r);
      }
  });

  pose.pose.keypoints.forEach((keypoint) => {
    pose.pose.keypoints.forEach((keypoint2) => {
      p5.stroke(0,0,keypoint.dif*10.0);
      p5.line(keypoint.position.x, keypoint.position.y,keypoint2.position.x,keypoint2.position.y);
    })
  })

  drawEyes(pose);
  // pose.skeleton.forEach((skeleton) => {
  //       const [p1, p2] = skeleton;
  //       p5.stroke(255, 0, 0);
  //       p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
  //       // p5.quad(p1.position.x,p1.position.y,p2.position.x,p2.position.y,p2.position.x,p2.position.y+10,p1.position.x,p1.position.y+10);
  // });
}


function drawEyes(pose){
  let leftEye = pose.pose.keypoints[1].position;
  let rightEye = pose.pose.keypoints[2].position;

  let distance = Math.abs(leftEye.x - rightEye.x);
  let r = distance/2;
  let a = Math.atan2(leftEye.y - rightEye.y,leftEye.x - rightEye.x);

  p5.push();
  p5.translate(leftEye.x,leftEye.y);
  p5.rotate(a);
  p5.fill(255);
  p5.ellipse(0,0, r, r/2);
  p5.fill(0);
  p5.ellipse(0,0, r/4, r/4);
  p5.pop();

  p5.push();
  p5.translate(rightEye.x,rightEye.y);
  p5.rotate(a);
  p5.fill(255);
  p5.ellipse(0,0, r, r/2);
  p5.fill(0);
  p5.ellipse(0,0, r/4, r/4);
  p5.pop();

}



/////////////////////////////////////////////////////////
// Draw ellipses over the detected keypoints
function drawKeypointsOld(poses) {
  poses.forEach((pose) =>
    pose.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        p5.fill(255);

        //If difference(speed if aboce a threshold, draw as RED)
        if(keypoint.dif > 15.0){
          p5.fill(255,0,0);
        }
        p5.noStroke();
        p5.ellipse(keypoint.position.x, keypoint.position.y, 5, 5);
        //Not my favorite way of doing this, but having trouble with
        if(keypoint.part == 'rightEye' || keypoint.part == 'leftEye'){
          p5.fill(255);
          p5.ellipse(keypoint.position.x,keypoint.position.y, 20,10);
          p5.fill(0);
          p5.ellipse(keypoint.position.x,keypoint.position.y, 5,5);
        }
      }
    })

  )
}

//Other interests: rendering different kinds of bodies / forms (blobs/shapes other than skeleton)

function drawSkeleton(poses) {
    poses.forEach((pose) => {
      pose.skeleton.forEach((skeleton) => {
        const [p1, p2] = skeleton;
        p5.stroke(255, 0, 0);
        p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
        //p5.quad(p1.position.x,p1.position.y,p2.position.x,p2.position.y,p2.position.x,p2.position.y+10,p1.position.x,p1.position.y+10);
      });
    });
}

// Audio from in-class demos
function playAudio(poses){
  if(poses.length == 0){
    return;
  }
  if(!osc){
    return;
  }
  const pose = poses[0].pose;
  const keypoints = pose.keypoints;

  //calculate distance between hands(wrists)
  const leftWrist = keypoints[9].position;
  const rightWrist = keypoints[10].position;

  const distance = Math.abs(rightWrist.x - leftWrist.x);
  const avgHeight = (leftWrist.y + rightWrist.y)/2;
  const scaled = distance / width;

  //console.info(distance);
  osc.freq(440 * scaled);
}