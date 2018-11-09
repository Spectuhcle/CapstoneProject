const timeView = document.getElementById('time-view');
const canvasWrapper = document.getElementById('canvas-wrapper');

//three.js setup
var scene, camera, fov, aspectRatio, nearPlane,
 farPlane, height, width, renderer, container;
//game mape setup
var gameMap, leftWall, rightWall, closeWall, farwall;

var client = username;

var gameObjects = [];
var sprites = {};

var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
    blue:0x68c3c0,
    'YELLOW': 0xffff00,
    'RED': 0xf25346,
    'GREEN': 0x008000,
    'BLUE': 0x68c3c0
};

var Directions = {
    'LEFT': Math.PI / 2,
    'RIGHT': 3 * Math.PI / 2,
    'UP':  3 * Math.PI,
    'DOWN': 0
};

function createScene() {
    height = window.innerHeight;
    width = window.innerWidth;

    scene = new THREE.Scene();

    aspectRatio = width/height;
    fov = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fov, aspectRatio, nearPlane, farPlane
    );

    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });

    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    canvasWrapper.appendChild(renderer.domElement);
}

function handleWindowResize() {
    height = window.innerHeight;
    width = window.innerWidth;
    renderer.setSize(width, height);
    camera.aspect = width/height;
    camera.updateProjectionMatrix();
}

Wall = function(user, x, y, z, width, orientation) {
    var geo = new THREE.CubeGeometry(width, 75, 10);
    var mat = new THREE.MeshBasicMaterial({
        color: Colors.blue,
        side: THREE.DoubleSide,
      //  wireframe: true
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.width = width;
    this.start = [x, z];
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;
    this.user = user;
    if(orientation === 'UP' || orientation === 'DOWN') {
        this.mesh.rotation.y += Math.PI / 2;
    }

    scene.add(this.mesh);

    this.resize = function(end) {
        if(this.start[0] != end[0]) {
            this.mesh.position.x = (this.start[0] + end[0]) / 2;
        }
        else if(this.start[1] != end[1]) {
            this.mesh.position.z = (this.start[1] + end[1]) / 2;
        }
        var newWidth = (Math.abs(this.start[0] - end[0])) + (Math.abs(this.start[1] - end[1]));
       
        this.mesh.scale.set(newWidth/this.width, 1, 1);
    }
}

GameMap = function(size, x, y, z) {
    this.size = size
    var geo = new THREE.PlaneGeometry(this.size,this.size,700,30,10);
    var mat = new THREE.MeshBasicMaterial({
        color: 0xF08080,
        wireframe: true                            
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;

    var box = new THREE.Box3().setFromObject(this.mesh);
    farWall = new Wall("map", this.mesh.position.x, this.mesh.position.y, this.mesh.position.z - this.size / 2, this.size);
    closeWall = new Wall("map", this.mesh.position.x, this.mesh.position.y, this.mesh.position.z + this.size / 2, this.size);

    leftWall = new Wall("map", this.mesh.position.x - (this.size / 2), this.mesh.position.y, this.mesh.position.z, this.size);
    rightWall = new Wall("map", this.mesh.position.x + (this.size / 2), this.mesh.position.y, this.mesh.position.z, this.size);
    leftWall.mesh.rotation.y += Math.PI / 2;
    rightWall.mesh.rotation.y += Math.PI / 2;

    scene.add(this.mesh);
    scene.add(farWall.mesh);
    scene.add(closeWall.mesh);
    scene.add(leftWall.mesh);
    scene.add(rightWall.mesh);

    this.mesh.receiveShadow = true;
}

Bike = function(user, direction, x, y) {
    this.mesh = new THREE.Object3D();
    this.direction = direction;
    this.mesh.position.x = x;
    this.mesh.position.z = y;
    this.mesh.rotation.y = Directions[direction];
    this.wall = new Wall(this.user, this.mesh.position.x, this.mesh.position.y, this.mesh.position.z, 0.01, this.direction);
    console.log(direction);

    if(user === client) {
        camera.rotation.y = Directions[this.direction];
    }

    var mat = new THREE.MeshBasicMaterial({color: Colors.blue});
    var mat1 = new THREE.MeshBasicMaterial({color: Colors.blue});

    var bodyGeom = new THREE.BoxGeometry(20, 20, 50);
    var body = new THREE.Mesh(bodyGeom, mat);
    body.castShadow = true;
    body.receieveShadow = true;
    this.mesh.add(body);

    var wheelGeom = new THREE.CylinderGeometry(5, 5, 30, 15);
    var rearWheel = new THREE.Mesh(wheelGeom, mat1);
    var frontWheel = new THREE.Mesh(wheelGeom, mat1);
    rearWheel.rotation.x = Math.PI / 2;
    rearWheel.rotation.z = Math.PI / 2;

    frontWheel.rotation.x = Math.PI / 2;
    frontWheel.rotation.z = Math.PI / 2;

    rearWheel.position.y = -5;
    frontWheel.position.y = -5;
    rearWheel.position.z = 15;
    frontWheel.position.z = -15;
    this.mesh.add(rearWheel);
    this.mesh.add(frontWheel);

    scene.add(this.mesh);

    this.setCurrentPosition = function(direction) {
        this.direction = direction;
        console.log(direction);
        this.mesh.rotation.y = Directions[this.direction];
    }

    this.update = function() {
        this.wall.resize([this.mesh.position.x, this.mesh.position.z]);
    }

    this.setColor = function(clr) {
        for(var i = 0; i < this.mesh.children.length - 1; i++) {
            this.mesh.children[i].material.color.setHex(clr);
        }
    }
}

window.addEventListener('resize', handleWindowResize);

function Game () {
    this.run = function () {
        createScene();

        gameMap = new GameMap(5000,0,0,-100);
        camera.position.z += 200;
        camera.position.y += 50;
        //camera.rotation.x -= 10;
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    };
    this.playerTurn = function (username, location, direction) {
        sprites[username].mesh.position.x = location.x;
        sprites[username].mesh.position.z = location.y;
        sprites[username].setCurrentPosition(direction);
        if(username === client) {
            camera.rotation.y = Directions[this.direction];
        }
        gameObjects.push(sprites[username].wall);
        sprites[username].wall = new Wall(username, sprites[username].mesh.position.x, sprites[username].mesh.position.y, sprites[username].mesh.position.z, 1, direction);
    };
    this.playerCrashed = function (username, location) {
        console.log('player-crashed', username, location);
    };
    this.setPlayerLocation = function (username, x, y, direction, color) {
        if(username in sprites) {
            sprites[username].mesh.position.x = x;
            sprites[username].mesh.position.z = y;
            sprites[username].direction = direction;
            sprites[username].update();
            if(username === client) {
                camera.rotation.y = Directions.direction;
            }
        }
        else {
            this.addPlayer(username, x, y, color, direction);
        }
    };
    this.setPlayerColor = function (username, color) {
        console.log('set-player-color', username, color);
        sprites[username].setColor(color);
    };
    this.setTime = function (time) {

    };
    this.start = function (time) {
        console.log('start the game', time);
    };
    this.end = function (time) {
        console.log('end the game', time);
    };
    this.addPlayer = function (name, locationx, locationy, color, direction) {
        var player = new Bike(name, direction, locationx, locationy);
        player.setColor(Colors[color]);
        player.mesh.position.y = 25;
        sprites[name] = player;
        if(name === username) {
            sprites[name].mesh.add(camera);
        }
    };
    this.removePlayer = function (name) {
        scene.remove(sprites[name].mesh);
        scene.remove(sprites[name].wall.mesh);
        delete sprites[name];
        if(gameObjects.length != 0) {
            for(var i = gameObjects.length; i >= 0; i--) {
                if(gameObjects[i].user === name) {
                    console.log('removing wall');
                    scene.remove(gameObjects[i].mesh);
                    gameObjects.splice(i, 1);
                }
            }
        }  
    };
}

var game = new Game();
game.run();