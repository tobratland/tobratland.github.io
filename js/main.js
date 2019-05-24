import { world } from "./world.js";
import { player } from "./player.js";
import { models } from "./models.js";
import { settings } from "./settings.js";
import { weapons } from "./weapons.js";
<<<<<<< HEAD
import { score } from "./challengeModeScore.js";

=======
import { score } from "./challengeModeScore.js"
//test
>>>>>>> 266115ca4bdf8853b8edd73ed3799fbea1c812c6
let camera, scene, renderer, controls, loadingManager;
let wallNorth, wallEast, wallSouth, wallWest, target;
let axes0, axes1, axes2, axes3;
let prevTime = performance.now();
let direction = new THREE.Vector3();
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let mouseDown = false;
let RESOURCES_LOADED = false;
let velocity = new THREE.Vector3();
const USE_WIREFRAME = false;
let playerMesh;
let groundlevel = 10
let hud = document.getElementById("hud");
let meshes = {};
let weaponSelector = document.getElementById("weaponSelector");
let magazineSelector = document.getElementById("magazineSelector");
let barrelAttachmentSelector = document.getElementById("barrelAttachment");
let clearBulletsButton = document.getElementById("clearBulletsButton");
let selectedWeapon = weaponSelector.options[weaponSelector.selectedIndex].value;
let selectedMagazine =
  magazineSelector.options[magazineSelector.selectedIndex].value;
let reloadTime = 0;
let selectedBarrelAttachment =
  barrelAttachmentSelector.options[barrelAttachmentSelector.selectedIndex]
    .value;
let bulletsLeft =
  weapons.apexLegends[selectedWeapon].magazineSize[selectedMagazine];
var collidableMeshList = [];
let destroyedTargets = 0;
let recoilPattern = weapons.apexLegends[selectedWeapon].recoilPattern;
let bulletNumber = 0;
let countdownToShot = weapons.apexLegends[selectedWeapon].timeToFirstShot;
let shooting = false;
let circleArray = [];
let circle;
let moveSpeed = 400
let mute = document.getElementById("mute");
let muted = false;
//Cookies
let consentedToCookies;
let cookieConsentButton = document.getElementById("acceptCookies");
let cookieRejectionButton = document.getElementById("rejectCookies");
let privacyBlocker = document.getElementById("privacy");
let targets = [];
let numberOftargets = 6;
let scoreTime = score.time;
let startScoreTime = 0;
let endScoreTime = 0;
let scoreShotsFired = score.shotsFired;
let scoreReloaded = score.reloaded;
let scoreWeapon = score.weapon;
let crouching = false;
let sprinting = false;
export let controllMode = "mouse";
export let gamepads = {}
export let gamepadConnected = false;
let playMode = "training";
let shootingAudio = new Howl({
  src: [
    "../audio/" + weapons.apexLegends[selectedWeapon].audio.shoot + ".mp3",
    "../audio/" + weapons.apexLegends[selectedWeapon].audio.shoot + ".ogg"
  ]
});
let playingShootingAudio = false;

if (localStorage.getItem("consentedToCookies") != null) {
  consentedToCookies = localStorage.getItem("consentedToCookies");
  console.log(consentedToCookies);

  //privacyBlocker.style.visibility = "hidden"
}
if (consentedToCookies == "true") {
  privacyBlocker.style.visibility = "hidden";
} else {
  privacyBlocker.style.visibility = "visible";
}

//overlay canvas for reticle
const crosshairCanvas = document.getElementById("xhair");
const crosshairCtx = crosshairCanvas.getContext("2d");
crosshairCtx.strokeStyle = "#39ff14";
crosshairCtx.fillStyle = "#39ff14";
crosshairCtx.lineWidth = 2;
crosshairCanvas.style.display = "none";
hud.style.display = "none";
crosshairCtx.clearRect(0, 0, 30, 30);
crosshairCtx.fillRect(13, 13, 4, 4);

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    document.getElementById("fovValue").value,
    window.innerWidth / window.innerHeight,
    1,
    1000
  ); //sets the type of camera, size of the camera and min/max viewdistance. This is my eyes
  controls = new THREE.PointerLockControls(camera);

  const blocker = document.getElementById("blocker");
  const playButton = document.getElementById("playButton");
  const challengeButton = document.getElementById("challengeButton");
  const controllerButtonGamePad = document.getElementById(
    "controllerButtonGamePad"
  );
  const controllerButtonMouse = document.getElementById(
    "controllerButtonMouse"
  );
  changeController();
  controllerButtonGamePad.addEventListener("click", function() {
    controllMode = "gamePad";
    console.log(controllMode);
    changeController();
  });
  controllerButtonMouse.addEventListener("click", function() {
    controllMode = "mouse";
    console.log(controllMode);
    changeController();
  });
  //create the scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(world.colorOfWorld); //sets the scene backgroundcolor
  scene.fog = new THREE.Fog(0xffffff, 0, 750); // sets fog for the scene

  //adds light to the scene
  const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
  light.position.set(0.5, 1, 0.75);
  scene.add(light);

  scene.add(controls.getObject()); //adds the pointerlockcontrols to the scene

  loadingManager = new THREE.LoadingManager();

  loadingManager.onProgress = function(item, loaded, total) {
    console.log(item, loaded, total);
  };
  loadingManager.onLoad = function() {
    console.log("loaded all resources");
    RESOURCES_LOADED = true;
    onResoucesLoaded();
  };
  // add cookie consent
  cookieConsentButton.addEventListener("click", function() {
    privacyBlocker.style.visibility = "hidden";
    consentedToCookies = true;
    localStorage.setItem("consentedToCookies", true);
  });
  cookieRejectionButton.addEventListener("click", function() {
    privacyBlocker.style.visibility = "hidden";
    consentedToCookies = false;
    localStorage.setItem("consentedToCookies", false);
  });

  //add eventlisteners to the playbutton to make click lock controls and adds eventlisteners to the controls to lock/unlock pointerlock
  playButton.addEventListener(
    "click",
    function() {
      controls.lock();
      playMode = "training";
    },
    false
  );
  challengeButton.addEventListener(
    "click",
    function() {
      controls.lock();
      playMode = "challenge";
      clearTargets();
      endScoreTime = 0;
      scoreShotsFired = 0;
      scoreReloaded = 0;
      scoreWeapon = selectedWeapon;

      if ((targets = [])) {
        addMovingTargets();
      }
    },
    false
  );
  clearBulletsButton.addEventListener(
    "click",
    function() {
      //removes hits from scene.
      for (let i = 0; i < targets.length; i++) {
        clearHits(targets[i]);
      }
      clearMisses();
      clearTargets();
    },
    false
  );
  //when the player locks the controls, aka clicks play and leaves the options screen
  controls.addEventListener("lock", function() {
    blocker.style.visibility = "hidden";
    crosshairCanvas.style.display = "block";
    hud.style.display = "block";
    selectWeapon(); //selects weapon
    selectMagazine(); //selects magazinesize
    selectBarrelMod(); //selects barrelmod
    changeFov(); //updates the fov
    changeMouseSensitivity(); // updates mouse sens
    changeCountdownToShot(); // updates the countdown to the first shot
    updateMute(); //checks if muted
    updateAudio(); //updates the audio to fit the weapon
    recoilPattern = weapons.apexLegends[selectedWeapon].recoilPattern;
    bulletNumber = 0;
    player.canShoot = true;
    bulletsLeft =
      weapons.apexLegends[selectedWeapon].magazineSize[selectedMagazine];
  });

  controls.addEventListener("unlock", function() {
    blocker.style.visibility = "visible";
    crosshairCanvas.style.display = "none";
    hud.style.display = "none";
    player.canShoot = false;
    if (playMode === "challenge") {
      scoreTime = (endScoreTime - startScoreTime).toFixed(3) + " seconds";
      updateScore();
    }
  });

  //for loading models
  for (var _key in models) {
    (function(key) {
      var mtlLoader = new THREE.MTLLoader(loadingManager);
      mtlLoader.load(models[key].mtl, function(materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader(loadingManager);

        objLoader.setMaterials(materials);
        objLoader.load(models[key].obj, function(mesh) {
          mesh.traverse(function(node) {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
          models[key].mesh = mesh;
        });
      });
    })(_key);
  }

  /* CREATE PLAYER */
  function createPlayer() {
    playerMesh = new THREE.Mesh(player.mesh.geomerty, player.mesh.material);
    scene.add(playerMesh);
  }

  /* CREATE WORLD  */

  // floor
  const floor = new THREE.Mesh( //creates floor
    new THREE.PlaneGeometry(250, 250, 20, 20), // width, height, widthSegments, heightsegments
    new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
  );
  const roof = new THREE.Mesh( //creates floor
    new THREE.PlaneGeometry(250, 250, 20, 20), // width, height, widthSegments, heightsegments
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
  );
  floor.rotation.x -= Math.PI / 2; //rotates the floor so it actually is on the floor
  floor.receiveShadow = true; //allows the floor to receive shadows
  scene.add(floor); //adds the floor to the scene
  roof.rotation.x -= Math.PI / 2; //rotates the roof so it actually is on the roof
  roof.position.y = 100;
  roof.material.side = THREE.DoubleSide;
  scene.add(roof); //adds the roof to the scene
  //walls
  const wallheight = world.MAP_HEIGHT; //sets wall atributes from world.js
  const wallwidth = world.MAP_SIZE; //sets wall atributes from world.js
  const wallcolor = world.wallColor; //sets wall atributes from world.js
  var geometry = new THREE.PlaneGeometry(wallwidth, wallheight);
  var material = new THREE.MeshBasicMaterial({
    color: wallcolor,
    side: THREE.DoubleSide
  });
  wallNorth = new THREE.Mesh(geometry, material);
  wallSouth = new THREE.Mesh(geometry, material);
  wallEast = new THREE.Mesh(geometry, material);
  wallWest = new THREE.Mesh(geometry, material);
  scene.add(wallNorth, wallSouth, wallEast, wallWest); //Adds walls to scene
  collidableMeshList.push(
    wallNorth,
    wallSouth,
    wallEast,
    wallWest,
    floor,
    roof
  );

  //targets
  let target1Geometry = new THREE.CircleGeometry(4, 16);
  let target1Material = new THREE.MeshBasicMaterial({ color: 0x641143 });
  let target1 = new THREE.Mesh(target1Geometry, target1Material);
  let target2Geometry = new THREE.CircleGeometry(6, 16);
  let target2Material = new THREE.MeshBasicMaterial({ color: 0x641143 });
  let target2 = new THREE.Mesh(target2Geometry, target2Material);
  let target3Geometry = new THREE.CircleGeometry(10, 16);
  let target3Material = new THREE.MeshBasicMaterial({ color: 0x641143 });
  let target3 = new THREE.Mesh(target3Geometry, target3Material);
  scene.add(target1);
  scene.add(target2);
  scene.add(target3);

  target1.position.z -= 124.99;
  target1.position.y += 15;
  target1.position.x += 18;
  target2.position.z -= 124.99;
  target2.position.y += 15;
  target3.position.z -= 124.99;
  target3.position.y += 15;
  target3.position.x -= 25;
  //positoning North wall
  wallNorth.position.z -= 125;
  wallNorth.position.y += wallheight / 2;

  //positoning south wall
  wallSouth.position.z += 125;
  wallSouth.position.y += wallheight / 2;

  //positoning east wall
  wallEast.position.x -= 125;
  wallEast.position.y += wallheight / 2;
  wallEast.rotation.y -= Math.PI / 2;
  //positoning west wall
  wallWest.position.x += 125;
  wallWest.position.y += wallheight / 2;
  wallWest.rotation.y += Math.PI / 2;

  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  //
  window.addEventListener("resize", onWindowResize, false);

  let onKeyDown = function(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        
        moveForward = true;
        break;
      case 37: // left
      case 65: // a
        moveLeft = true;
        break;
      case 40: // down
      case 83: // s
        moveBackward = true;
        break;
      case 39: // right
      case 68: // d
        moveRight = true;
        break;
      case 32: // space
        if (player.canJump === true) velocity.y += 300; //if canjump is true, jumps
        player.canJump = false; //sets canjump to false, to prevent double jumping
<<<<<<< HEAD
        break;
      case 16: // shift
      sprinting = true;
      if(!crouching) {
        moveSpeed = 600
      }
        break;  
=======
        break //just a test
>>>>>>> 266115ca4bdf8853b8edd73ed3799fbea1c812c6

      case 82: // r
        reload();
        break;
    }
  };
  let onKeyUp = function(event) {
    switch (event.keyCode) {
      case 38: // up
      case 87: // w
        moveForward = false;
        break;
      case 37: // left
      case 65: // a
        moveLeft = false;
        break;
      case 40: // down
      case 83: // s
        moveBackward = false;
        break;
      case 39: // right
      case 68: // d
        moveRight = false;
        break;
      case 16: // shift
        sprinting = false;
        moveSpeed = 400
        break;  
    }
  };
  const onMouseDown = function() {
    /* startGunRotationX = controls.getObject().children[ 0 ].rotation.x
            startGunRotationY =  controls.getObject().rotation.y */
    mouseDown = true;
    shooting = true;
  };

  const onMouseUp = function() {
    mouseDown = false;
    shooting = false;
    shootingAudio.stop();
    playingShootingAudio = false;
    bulletNumber = 0;
    changeCountdownToShot();
  };
  const reload = function() {
    if (bulletsLeft === 0 && playMode === "challenge") {
      reloadTime =
        weapons.apexLegends[selectedWeapon].reloadTime.empty[selectedMagazine];
    } else if (bulletsLeft > 0 && playMode === "challenge") {
      reloadTime =
        weapons.apexLegends[selectedWeapon].reloadTime.loaded[selectedMagazine];
    } else {
      reloadTime = 0;
    }
    if (playMode === "challenge") {
      scoreReloaded++;
    }
    shootingAudio.stop();
    playingShootingAudio = false;
    console.log(reloadTime);
    bulletNumber = 0;
    bulletsLeft =
      weapons.apexLegends[selectedWeapon].magazineSize[selectedMagazine];

    changeCountdownToShot();
  };

  document.addEventListener("keydown", onKeyDown, false);
  document.addEventListener("keyup", onKeyUp, false);
  window.addEventListener("mousedown", onMouseDown, false);
  window.addEventListener("mouseup", onMouseUp, false);

  createPlayer();
} //end of init
function changeCountdownToShot() {
  countdownToShot = weapons.apexLegends[selectedWeapon].timeToFirstShot;
}

function clearHits(target) {
  for (let i = 0; i < target.hits.length; i++) {
    scene.remove(target.hits[i]);
  }
  target.hits = [];
}
function clearTargets() {
  for (let i = 0; i < targets.length; i++) {
    let selectedObject = scene.getObjectByName(targets[i].name);
    scene.remove(selectedObject);
    clearHits(targets[i]);
    collidableMeshList = collidableMeshList.filter(function(obj) {
      return obj.name != targets[i].name;
    });
  }
}
function clearMisses() {
  for (let i = 0; i < circleArray.length; i++) {
    let m = scene.getObjectByName("miss");
    scene.remove(m);
  }
  circleArray = [];
}
function changeController() {
  if (controllMode === "gamePad") {
    controllerButtonGamePad.style.backgroundColor = "green";
    controllerButtonGamePad.style.color = "white";
    controllerButtonGamePad.style.textDecoration = "none";
    controllerButtonMouse.style.backgroundColor = "red";
    controllerButtonMouse.style.textDecoration = "line-through";
    controllerButtonMouse.style.color = "grey";

    window.addEventListener(
      "gamepadconnected",
      function(e) {
        gamepadHandler(e, true);
        gamepadConnected = true
      },
      false
    );

    window.addEventListener(
      "gamepaddisconnected",
      function(e) {
        gamepadHandler(e, false);
        gamepadConnected = false
      },
      false
    );
  } else if (controllMode === "mouse") {
    controllerButtonMouse.style.backgroundColor = "green";
    controllerButtonMouse.style.color = "white";
    controllerButtonMouse.style.textDecoration = "none";
    controllerButtonGamePad.style.backgroundColor = "red";
    controllerButtonGamePad.style.textDecoration = "line-through";
    controllerButtonGamePad.style.color = "grey";
  }
}
function selectWeapon() {
  selectedWeapon = weaponSelector.options[weaponSelector.selectedIndex].value;
}
function gamepadHandler(event, connecting) {
  var gamepad = event.gamepad;

  if (connecting) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
}
function addMovingTargets() {
  for (let i = 0; i < numberOftargets; i++) {
    let targetgeometry = new THREE.SphereGeometry(
      randomNumberinRange(3, 6),
      32,
      32
    );
    target = new THREE.Mesh(
      targetgeometry,
      new THREE.MeshLambertMaterial({ color: 0xffff00f })
    );
    target.position.x = randomNumberinRange(-125, 125);
    target.position.y = randomNumberinRange(0, 50);
    target.position.z = randomNumberinRange(-125, 125);

    target.castShadow = true;
    scene.add(target);
    collidableMeshList.push(target);
    target.name = "target" + i;
    target.hits = [];
    target.speedX = randomNumberinRange(-0.7, 0.7);
    target.speedY = randomNumberinRange(-0.7, 0.7);
    target.speedZ = randomNumberinRange(-0.7, 0.7);
    targets.push(target);
  }
}
function selectBarrelMod() {
  selectedBarrelAttachment =
    barrelAttachmentSelector.options[barrelAttachmentSelector.selectedIndex]
      .value;
}
function selectMagazine() {
  selectedMagazine =
    magazineSelector.options[magazineSelector.selectedIndex].value;
}

function changeFov() {
  camera.fov = document.getElementById("fovValue").value;
  camera.updateProjectionMatrix();
}
function updateAudio() {
  shootingAudio = new Howl({
    src: [
      "../audio/" + weapons.apexLegends[selectedWeapon].audio.shoot + ".mp3",
      "../audio/" + weapons.apexLegends[selectedWeapon].audio.shoot + ".ogg"
    ]
  });
}
function changeMouseSensitivity() {
  settings.sens = document.getElementById("MouseSensNumber").value;
  camera.updateProjectionMatrix();
}

function updateScore() {
  if (destroyedTargets == targets.length) {
    document.getElementById("defeatedTargets").innerHTML =
      "You destroyed all of the targets, good job friend!";
  } else {
    document.getElementById("defeatedTargets").innerHTML =
      "You only got " +
      destroyedTargets +
      " out of " +
      targets.length +
      " targets, not good!";
  }

  document.getElementById("timeUsed").innerHTML = "Time used: " + scoreTime;
  document.getElementById("shotsFired").innerHTML =
    "Shots Fired: " + scoreShotsFired;
  document.getElementById("reloadedTimes").innerHTML =
    "Amount of times you reloaded: " + scoreReloaded;
  document.getElementById("weaponSelected").innerHTML =
    "Weapon used: " + scoreWeapon;
}
function updateMute() {
  mute = document.getElementById("mute").checked;

  mute === true ? (muted = true) : (muted = false); //trying shorthand if
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

//when all resources are loaded, call this function. Puts loaded resources in the map.
function onResoucesLoaded() {
  meshes["gun"] = models.gun.mesh.clone();

  //positions the meshes
  meshes["gun"].position.set(1, -2, -2.5);
  meshes["gun"].rotation.y = -Math.PI;
  meshes["gun"].scale.set(70, 70, 70);

  controls.getPitch().add(meshes["gun"]);
}

function randomNumberinRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shoot() {
  //handles everything that happens when the player shoots except for sound
  let shotPosition = new THREE.Vector3();
  const cameraDirection = controls
    .getDirection(new THREE.Vector3(0, 0, 0))
    .normalize()
    .clone();
  let rayCaster = new THREE.Raycaster();
  let hitGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  let hitMateral = new THREE.MeshBasicMaterial({ color: 0x0e0909 });
  circle = new THREE.Mesh(hitGeometry, hitMateral);
  circle.material.side = THREE.DoubleSide;
  rayCaster.set(controls.getObject().position, cameraDirection);
  let intersects = rayCaster.intersectObjects(collidableMeshList);

  shotPosition = intersects[0].point;
  scene.add(circle);
  for (let i = 0; i < targets.length; i++) {
    if (intersects[0].object.name == "target" + [i]) {
      targets[i].hits.push(circle);
      circle.name = "hit";
    } else {
      circle.name = "miss";
    }
  }

  circleArray.push(circle);

  circle.position.set(shotPosition.x, shotPosition.y, shotPosition.z);

  countdownToShot =
    weapons.apexLegends[selectedWeapon].recoilPattern[bulletNumber].t;
  let recoilXMin;
  let recoilXMax;
  let recoilYMin;
  let recoilYMax;
  //controlling recoil
  if (
    selectedBarrelAttachment === "barrelExtensionLevelOne" &&
    selectedWeapon != "flatline" &&
    selectedWeapon != "havocNoTurbo" &&
    selectedWeapon != "havocTurbo"
  ) {
    recoilXMin = recoilPattern[bulletNumber].xMin * 0.9;
    recoilXMax = recoilPattern[bulletNumber].xMax * 0.9;
    recoilYMin = recoilPattern[bulletNumber].yMin * 0.9;
    recoilYMax = recoilPattern[bulletNumber].yMax * 0.9;
  } else if (
    selectedBarrelAttachment === "barrelExtensionLevelTwo" &&
    selectedWeapon != "flatline" &&
    selectedWeapon != "havocNoTurbo" &&
    selectedWeapon != "havocTurbo"
  ) {
    recoilXMin = recoilPattern[bulletNumber].xMin * 0.85;
    recoilXMax = recoilPattern[bulletNumber].xMax * 0.85;
    recoilYMin = recoilPattern[bulletNumber].yMin * 0.85;
    recoilYMax = recoilPattern[bulletNumber].yMax * 0.85;
  } else if (
    selectedBarrelAttachment === "barrelExtensionLevelThree" &&
    selectedWeapon != "flatline" &&
    selectedWeapon != "havocNoTurbo" &&
    selectedWeapon != "havocTurbo"
  ) {
    recoilXMin = recoilPattern[bulletNumber].xMin * 0.8;
    recoilXMax = recoilPattern[bulletNumber].xMax * 0.8;
    recoilYMin = recoilPattern[bulletNumber].yMin * 0.8;
    recoilYMax = recoilPattern[bulletNumber].yMax * 0.8;
  } else {
    recoilXMin = recoilPattern[bulletNumber].xMin;
    recoilXMax = recoilPattern[bulletNumber].xMax;
    recoilYMin = recoilPattern[bulletNumber].yMin;
    recoilYMax = recoilPattern[bulletNumber].yMax;
  }

  controls.getObject().children[0].rotation.x =
    controls.getObject().children[0].rotation.x +
    randomNumberinRange(recoilYMin, recoilYMax) * 0.0003;
  controls.getObject().rotation.y =
    controls.getObject().rotation.y +
    randomNumberinRange(recoilXMin, recoilXMax) * 0.0003;

  bulletNumber++;
  bulletsLeft--;
  if (playMode === "challenge") {
    scoreShotsFired++;
  }
}

function animate() {
  requestAnimationFrame(animate);
  let timeToAnimate = performance.now(); //gives metric to measure the time from start of animation, to end.
  let time = performance.now();
  let delta = (time - prevTime) / 1000;
  if(controllMode === "gamePad" && gamepadConnected) {
    gamepads = navigator.getGamepads();
    axes0 = gamepads[0].axes[0]
    axes1 = gamepads[0].axes[1]
    axes2 = gamepads[0].axes[2]
    axes3 = gamepads[0].axes[3]
    controls.getObject().rotation.y -= axes2.toFixed(1) * 0.005 * settings.sens
    controls.getPitch().rotation.x -= axes3.toFixed(1) * 0.005 * settings.sens
    
  }
  
  for (let i = 0; i < targets.length; i++) {
    if (targets[i].position.y >= 50) {
      targets[i].speedY = randomNumberinRange(-0.3, -0.8);
    }
    if (targets[i].position.y <= 5) {
      targets[i].speedY = randomNumberinRange(0.3, 0.8);
    }
    if (targets[i].position.x >= 125) {
      targets[i].speedX = randomNumberinRange(-0.3, -0.8);
    }
    if (targets[i].position.x <= -125) {
      targets[i].speedX = randomNumberinRange(0.3, 0.8);
    }
    if (targets[i].position.z >= 125) {
      targets[i].speedZ = randomNumberinRange(-0.3, -0.8);
    }
    if (targets[i].position.z <= -125) {
      targets[i].speedZ = randomNumberinRange(0.3, 0.8);
    }
  }

  for (let i = 0; i < targets.length; i++) {
    //Moves hits with targets
    if (targets[i].hits.length > 0) {
      for (let j = 0; j < targets[i].hits.length; j++) {
        targets[i].hits[j].position.x += targets[i].speedX;
        targets[i].hits[j].position.y += targets[i].speedY;
        targets[i].hits[j].position.z += targets[i].speedZ;
      }
      if (targets[i].hits.length > 1) {
        targets[i].material.color.setHex(0xfffff);
      }
      if (targets[i].hits.length > 3) {
        targets[i].material.color.setHex(0xff0000);
      }
      if (targets[i].hits.length > 4) {
        let selectedObject = scene.getObjectByName(targets[i].name);
        scene.remove(selectedObject);
        clearHits(targets[i]);
        collidableMeshList = collidableMeshList.filter(function(obj) {
          return obj.name != targets[i].name;
        });
        destroyedTargets++;
      }
    }
  }

  for (let i = 0; i < targets.length; i++) {
    targets[i].position.x += targets[i].speedX;
    targets[i].position.y += targets[i].speedY;
    targets[i].position.z += targets[i].speedZ;
  }

  /* shooting, movement including jumping */
  if (controls.isLocked === true) {
    velocity.x -= velocity.x * 8.0 * delta;
    velocity.z -= velocity.z * 8.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveLeft) - Number(moveRight);
    direction.normalize(); // this ensures consistent movements in all directions

    //setting the playermesh' position to the controls object. Unelegant, but couldnt find a better way and didnt want to waste time on it.
    playerMesh.position.set(
      controls.getObject().position.x,
      controls.getObject().position.y,
      controls.getObject().position.z
    );

    //checks for attempt to move
    if (moveForward || moveBackward) velocity.z -= direction.z * moveSpeed * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * moveSpeed * delta;

    /* movement and collision for player in all directions */
    if (controls.getObject().position.z > world.MAP_SIZE / 2 - 2) {
      velocity.z = 0;
      controls.getObject().position.z = world.MAP_SIZE / 2 - 2;
    } else if (controls.getObject().position.z < -(world.MAP_SIZE / 2 - 2)) {
      velocity.z = 0;
      controls.getObject().position.z = -(world.MAP_SIZE / 2 - 2);
    } else if (controls.getObject().position.x > world.MAP_SIZE / 2 - 2) {
      velocity.z = 0;
      controls.getObject().position.x = world.MAP_SIZE / 2 - 2;
    } else if (controls.getObject().position.x < -(world.MAP_SIZE / 2 - 2)) {
      velocity.z = 0;
      controls.getObject().position.x = -(world.MAP_SIZE / 2 - 2);
    } else {
      controls.getObject().translateX(velocity.x * delta);
      controls.getObject().translateY(velocity.y * delta);
      controls.getObject().translateZ(velocity.z * delta);
    }

    //for updating bullets left in hud
    document.getElementById("bulletsLeft").innerHTML = bulletsLeft;
    document.getElementById("totalbullets").innerHTML =
      weapons.apexLegends[selectedWeapon].magazineSize[selectedMagazine];
    if (reloadTime > 0.1) {
      document.getElementById("bulletsLeft").innerHTML = "RELOADING";
    } else {
      document.getElementById("bulletsLeft").innerHTML = bulletsLeft;
    }
    //can the player jump and sets the player on ground while not jumping.
    if (controls.getObject().position.y <= groundlevel) {
      velocity.y = 0;
      controls.getObject().position.y = groundlevel;
      if(controls.getObject().position.y < 6) {
      player.canJump = false;
      } else {
        player.canJump = true;
      }
    }
    if (bulletsLeft <= 0) {
      shootingAudio.stop();
      playingShootingAudio = false;
    }
    
    /* shooting audio*/
    if (
      mouseDown &&
      !playingShootingAudio &&
      bulletsLeft > 0 &&
      reloadTime <= 0.1
    ) {
      if (!muted) {
        shootingAudio.play();
        playingShootingAudio = true;
      }
    }
    // call shoot to shoot bullets
    if(gamepads.length > 0) {
      if (
        (gamepads[0].buttons[7].pressed) &&
        countdownToShot <= 0 &&
        bulletsLeft > 0 &&
        reloadTime <= 0.1
      ) {
        shoot();
      }
    }else if (
      mouseDown &&
      countdownToShot <= 0 &&
      bulletsLeft > 0 &&
      reloadTime <= 0.1
    ) {
      shoot();
    }
    if (destroyedTargets >= numberOftargets) {
      destroyedTargets = 0;
      targets = [];
    }
    timeToAnimate = time - timeToAnimate;

    if (countdownToShot > 0) {
      if (shooting) {
        countdownToShot -= delta + timeToAnimate; //gives the most accurate countdown to shot. Takes into account time between frames and time during frames.
      } else {
        countdownToShot = countdownToShot;
      }
    }
    reloadTime -= delta + timeToAnimate;
    prevTime = time;
    if (playMode === "challenge" && destroyedTargets != targets.length) {
      endScoreTime += delta + timeToAnimate;
    }
  } //end of movement + jumping
  
  renderer.render(scene, camera);
} //end of animate
