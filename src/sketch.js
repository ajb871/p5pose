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
let prevPoses = [];

export function setSketch(sketch) {
  p5 = sketch;
}

export function setup() {
  p5.createCanvas(width*2, height);
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

}

export function draw() {
}

function drawPoses(poses) {
  p5.translate(width*1.5, 0); // move to far corner
  p5.scale(-1.0, 1.0);

  // Uses poses number to alter background
  let numPoses = poses.length;
  p5.tint(255, 255/numPoses);
  p5.image(video, 0, 0, video.width, video.height);
  
  //p5.fill(0,10);
  //p5.rect(0,0,width,height);

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
  //Debugging to read no. of poses
  console.log(poses.length);

   if(poses.length == 0){ //return if no poses
    return;
  }

  //(Org testing)get vars from pose[0]
  //const pose = poses[0];

  //Added poses.foreach loop in order to use multipose detection
  poses.forEach(function(pose, index){
    if(prevPoses[index] == undefined){
      prevPoses[index] = pose;
      //continue;
    }

    pose.pose.keypoints.forEach(function (keypoint, index2){
      //Set prev position to evaluate change in position
      let prevKeypoint = prevPoses[index].pose.keypoints[index2];

      //Create p5 vectors for evaluating distance And direction
      let preV = p5.createVector(prevKeypoint.position.x, prevKeypoint.position.y);
      let newV = p5.createVector(keypoint.position.x, keypoint.position.y);

      let dist = preV.dist(newV); //Calculate distance moved (total) 
      //let direc = p5.degrees(preV.angleBetween(newV)); //Calculate angle between points
      //let direc = p5.degrees(Math.atan2(preV.y - newV.y, preV.x - newV.x));
      let direc = {'x' : newV.x - preV.x,
                  'y' : newV.y - preV.y
                  }; //Issues with vectors

      //append these values to Pose/keypoints
      keypoint.dist = dist;
      keypoint.direc = direc;
      //by appening dif will be pased onto the DrawKeypoints to be easily read with a for loop
    });
    prevPoses[index] = pose; //set current pose to previous

    // Call Draw Keypoints
    drawKeypoints(pose); //would like to replace function with "update Keypoints"
  });



  /* /////////////Old Testing code with just leftEye position////////////
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
  ////////////////////////////////////////////////////////////////////////
}

function drawKeypoints(pose) {
  //Pose drawing/graphic function

  pose.pose.keypoints.forEach(function (keypoint,index){
      //Create vars for radius and color from dif values
      let dist = keypoint.dist;
      let direc = keypoint.direc;
      //console.log(index + ' : ' + direc);
      
      //debug for dist
      p5.push();
      p5.translate(keypoint.position.x,keypoint.position.y);
      p5.scale(-1.0,1.0);
      p5.fill(0);
      p5.textSize(12);
      //p5.text(p5.nf(direc,0,2),0,0);
      p5.pop();
      //debug for direc

      let fill = p5.color(0);
      let r = 5.0 + (dist*2.3); //Size -> Speed direct relationship

      fill = p5.color(10.0*Math.abs(dist),0,5.0*Math.abs(dist)); //Speed determine fill color
      if(direc.x < 0) {
        fill = p5.color(0, 5.0*Math.abs(dist), 10.0*Math.abs(dist)); //Speed determine fill color
      }


      if (keypoint.score > 0.5) {
        p5.fill(fill);
        p5.noStroke();
        p5.ellipse(keypoint.position.x, keypoint.position.y, r, r);

        //Draw strokes between all other keypoints
        pose.pose.keypoints.forEach((keypoint2) => {
          if (keypoint2.score > 0.5){ //Only "known" keypoints
            p5.stroke(fill); //use same fill for better understanding
            p5.line(keypoint.position.x, keypoint.position.y,keypoint2.position.x,keypoint2.position.y);
          }
       })
      }
  });
  // Special Draw Eyes function over top other graphics
  drawEyes(pose);
  // pose.pose.keypoints.forEach((keypoint) => {
    
  // })

  

  /////////////// Old Skeleton Drawing /////////////
  // pose.skeleton.forEach((skeleton) => {
  //       const [p1, p2] = skeleton;
  //       p5.stroke(255, 0, 0);
  //       p5.line(p1.position.x, p1.position.y, p2.position.x, p2.position.y);
  //       // p5.quad(p1.position.x,p1.position.y,p2.position.x,p2.position.y,p2.position.x,p2.position.y+10,p1.position.x,p1.position.y+10);
  // });
}


function drawEyes(pose){
  // Create array for both eyes
  // Check for eyes (error)
  if(!pose.pose.keypoints[1].position && !pose.pose.keypoints[2].position){
    return;
  }
  let eyes = [pose.pose.keypoints[1].position, pose.pose.keypoints[2].position];
  let distance = Math.abs(eyes[0].x - eyes[1].x); //calc distance to determine size
  let r = distance/2;
  let a = Math.atan2(eyes[0].y - eyes[1].y, eyes[0].x - eyes[1].x); //calc rotation angle for head turning

  //Draw eyes w/ push & pop
  eyes.forEach((eye) => {
    p5.push();
    p5.translate(eye.x, eye.y);
    p5.rotate(a);
    p5.fill(255);
    p5.ellipse(0,0, r, r/2); //whole eye
    p5.fill(0);
    p5.ellipse(0,0, r/4, r/4); //pupil
    p5.pop();
  });
}



/////////////////////////////OLD CODES/////////////////////////////////////////
// Draw ellipses over the detected keypoints
function drawKeypointsOld(poses) {
  poses.forEach((pose) =>
    pose.pose.keypoints.forEach((keypoint) => {
      if (keypoint.score > 0.5) {
        p5.fill(255);

        //If difference(speed if aboce a threshold, draw as RED)
        if(keypoint.dist > 15.0){
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