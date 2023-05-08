import {cat, status, keyState} from './Sprite.js';
// import {io} from "socket.io-client";
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
// import { io } from '';

var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 480,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update,
    }
};

function init() {
    console.log('init')
}

function preload() {
    this.load.image('background', 'assets/background.jpg');
    this.load.image('base_tiles','assets/Mario1/Tilesets/OverWorld.png');
    this.load.tilemapTiledJSON('map', 'assets/platform.json');
    this.load.spritesheet('cat1', 'assets/cat1.png', {frameWidth: 64, frameHeight: 64});
    this.load.spritesheet('cat2', 'assets/cat2.png', {frameWidth: 64, frameHeight: 64});
    this.load.image('ball', 'assets/ball.png');
    this.load.image('gate1', 'assets/gate1.png');
    this.load.image('gate2', 'assets/gate2.png');
}

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var ball;
var enemy;
let kickMagnitude = 700;
let angle = 45; // in degrees
var net1;
var net2;
var cat1Score = 0;
var cat2Score = 0;
var text1;
var text2;
let radians = Phaser.Math.DegToRad(angle);
var ballPos = new Phaser.Math.Vector2(400, 16);
var states = {
    dir: 'right',
    state: status.stand,
    prestate: status.stand,
    position: new Phaser.Math.Vector2(16, 16),
    color: 'cat1',
};

var enemyStates = {
    dir: 'right',
    state: status.stand,
    prestate: status.stand,
    position: new Phaser.Math.Vector2(16, 16),
    color: 'cat1',
}

var keyPressed = {
    dir: keyState.direction.none,
    verticleState: keyState.verticleState.none,
    kick: keyState.kick.none,
}

var enemyKeyPressed = {
    dir: keyState.direction.none,
    verticleState: keyState.verticleState.none,
    kick: keyState.kick.none,
}

function create() {
    map = this.make.tilemap({key: 'map', tileHeight: 16, tileWidth: 16});
    const tileset = map.addTilesetImage('3', 'base_tiles');
    groundLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    //add player
    player = this.physics.add.sprite(states.position.x, states.position.y, states.color);
    player.body.setSize(8,16);
    player.body.setOffset(26,40);
    player.setBounce(0.2, 0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, player);
    if(states.dir === 'left') player.setScale(-1,1);
    if(states.color === 'cat2') player.body.allowGravity = false;


    this.anims.create(
        {
            key: 'stand',
            frames: this.anims.generateFrameNumbers(states.color, { start: cat.stand.start, end: cat.stand.end}),
            frameRate: 8,
            repeat: -1
        });

    this.anims.create(
        {
            key: 'walk',
            frames: this.anims.generateFrameNumbers(states.color, { start: cat.walk.start, end: cat.walk.end}),
            frameRate: 8,
            repeat: -1
        });

    player.play('stand');

    cursors = this.input.keyboard.addKeys(
        'W,A,S,D,SPACE'
    );

    enemy = this.physics.add.sprite(enemyStates.position.x, enemyStates.position.y, enemyStates.color);
    enemy.body.setSize(8,16);
    enemy.body.setOffset(26,40);
    enemy.setBounce(0.2, 0.2);
    enemy.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, enemy);
    if(enemyStates.dir === 'left') enemy.setScale(-1,1);
    if(states.color === 'cat2') enemy.body.allowGravity = false;

    //add ball
    ball = this.physics.add.image(400, 16, 'ball');
    ball.setScale(0.01);
    ball.setBounce(0.5);
    ball.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, ball);
    this.physics.add.collider(player, ball);
    this.physics.add.collider(enemy, ball);
    if(states.color === 'cat2') ball.body.allowGravity = false;

    //add score
    text1 = this.add.text(0, 0, `Score: `+cat1Score, { fontSize: '16px', fill: '#ffadad' });
    text2 = this.add.text(700, 0, `Score: `+cat2Score, { fontSize: '16px', fill: '#93d3fa' });

    //add gate
    net1 = this.physics.add.image(8,428, 'gate1');
    net2 = this.physics.add.image(792, 428, 'gate2');
    net1.body.immovable = true;
    net2.body.immovable = true;
    net1.body.allowGravity = false;
    net2.body.allowGravity = false;
    net1.setScale(0.5, 0.8);
    net2.setScale(0.5, 0.8);
    if(states.color === 'cat1') {
        this.physics.add.overlap(net1, ball, () => {
            cat2Score++;
            text2.setText(`Score: ` + cat2Score);
            if (states.color === 'cat1') socket.emit('score', {cat1: cat1Score, cat2: cat2Score});
            this.scene.restart();
        })
        this.physics.add.overlap(net2, ball, () => {
            cat1Score++;
            text1.setText(`Score: ` + cat1Score);
            if (states.color === 'cat1') socket.emit('score', {cat1: cat1Score, cat2: cat2Score});
            this.scene.restart();
        })
    }

    this.anims.create(
        {
            key: 'enemyStand',
            frames: this.anims.generateFrameNumbers(enemyStates.color, { start: cat.stand.start, end: cat.stand.end}),
            frameRate: 8,
            repeat: -1
        });

    this.anims.create(
        {
            key: 'enemyWalk',
            frames: this.anims.generateFrameNumbers(enemyStates.color, { start: cat.walk.start, end: cat.walk.end}),
            frameRate: 8,
            repeat: -1
        });

    enemy.play('enemyStand');

    if(states.color === 'cat1'){
        setInterval(()=>{
            socket.emit('update', {cat1: states, cat2: enemyStates, ball: ballPos});//states
        }, 10);
        socket.on('kick',()=>{
            let distance = Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, ball.body.x, ball.body.y);
            let velocityx;
            if(distance < 30){
                velocityx = (enemy.body.x > ball.body.x)? -200: 200;
                if((velocityx > 0 && enemyStates.dir === 'right') || (velocityx < 0 && enemyStates.dir === 'left')){
                    ball.body.setVelocity(velocityx,700);
                }
            }
        });
    }else{
        setInterval(()=>{
            socket.emit('updateKey', keyPressed);//states
        }, 10)
    }
}

function updateAnimState(){
    if(states.prestate === states.state) return;
    switch (states.state) {
        case status.stand:
            player.play('stand');
            break;
        case status.walk:
            player.play('walk');
            break;
        case status.jump:
            break;
        case status.slide:
            break;
    }
    states.prestate = states.state;
}

function updateEnemyAnimState(){
    if(enemyStates.prestate === enemyStates.state) return;
    switch (enemyStates.state) {
        case status.stand:
            enemy.play('enemyStand');
            break;
        case status.walk:
            enemy.play('enemyWalk');
            break;
        case status.jump:
            break;
        case status.slide:
            break;
    }
    enemyStates.prestate = enemyStates.state;
}

function updateEnemyState(phaser){
    enemy.setPosition(enemyStates.position.x, enemyStates.position.y);
    enemy.body.updateBounds();
}

function updateAll(){
    player.setPosition(states.position.x, states.position.y);
    enemy.setPosition(enemyStates.position.x, enemyStates.position.y);
    ball.setPosition(ballPos.x, ballPos.y);
    states.dir === 'left'? player.setScale(-1,1): player.setScale(1,1);
    enemyStates.dir === 'left'? enemy.setScale(-1,1): enemy.setScale(1,1);
    updateAnimState();
    updateEnemyAnimState();
}

function enemyAction(){
    if(enemyKeyPressed === null) return;
    switch (enemyKeyPressed.verticleState) {
        case keyState.verticleState.jump:
            if(enemy.body.onFloor()){
                enemy.body.setVelocityY(-500);
            }
            break;
        case keyState.verticleState.slide:
            break;
        case keyState.verticleState.none:
            break;
    }

    switch (enemyKeyPressed.dir) {
        case keyState.direction.left:
            enemyStates.dir = 'left';
            enemy.setScale(-1,1);
            enemy.body.setVelocityX(-200);
            enemyStates.state = status.walk;
            break;
        case keyState.direction.right:
            enemyStates.dir = 'right';
            enemy.setScale(1,1);
            enemy.body.setVelocityX(200);
            enemyStates.state = status.walk;
            break;
        case keyState.direction.none:
            enemy.body.setVelocityX(0);
            enemyStates.state = status.stand;
            break;
    }

    // if(enemyKeyPressed.kick ===  keyState.kick.kick){
    //     let distance = Phaser.Math.Distance.Between(enemy.body.x, enemy.body.y, ball.body.x, ball.body.y);
    //     let velocityx;
    //     if(distance < 30){
    //         velocityx = (enemy.body.x > ball.body.x)? -200: 200;
    //         if((velocityx > 0 && enemyStates.dir === 'right') || (velocityx < 0 && enemyStates.dir === 'left')){
    //             ball.body.setVelocity(velocityx,700);
    //         }
    //     }
    // }

}

function update(){
    if(states.color === 'cat1') {
        if (cursors.W.isDown && player.body.onFloor()) {
            // keyPressed.verticleState = keyState.verticleState.jump;
            player.body.setVelocityY(-500);
        } else if (cursors.S.isDown) {
            // keyPressed.verticleState = keyState.verticleState.slide;
        } else {
            // keyPressed.verticleState = keyState.verticleState.none;
        }

        if (cursors.A.isDown) {
            states.dir = 'left';
            player.setScale(-1, 1);
            player.body.setVelocityX(-200);
            states.state = status.walk;
            // keyPressed.dir = keyState.direction.left;
        } else if (cursors.D.isDown) {
            states.dir = 'right';
            player.setScale(1, 1);
            player.body.setVelocityX(200);
            states.state = status.walk;
            // keyPressed.dir = keyState.direction.right;
        } else {
            player.body.setVelocityX(0);
            states.state = status.stand;
            // keyPressed.dir = keyState.direction.none;
        }

        // keyPressed.kick = keyState.kick.none;
        cursors.SPACE.once('down', function () {
            let distance = Phaser.Math.Distance.Between(player.body.x, player.body.y, ball.body.x, ball.body.y);
            let velocityx;
            // keyPressed.kick = keyState.kick.kick;
            if (distance < 30) {
                velocityx = (player.body.x > ball.body.x) ? -200 : 200;
                if ((velocityx > 0 && states.dir === 'right') || (velocityx < 0 && states.dir === 'left')) {
                    ball.body.setVelocity(velocityx, 700);
                }
            }
        });

        states.position = player.body.position;
        enemyStates.position = enemy.body.position;
        ballPos = ball.body.position;
        updateAnimState();
        updateEnemyAnimState();
        enemyAction();
    }else{//player 2
        if (cursors.W.isDown) {
            keyPressed.verticleState = keyState.verticleState.jump;
        } else if (cursors.S.isDown) {
            keyPressed.verticleState = keyState.verticleState.slide;
        } else {
            keyPressed.verticleState = keyState.verticleState.none;
        }

        if (cursors.A.isDown) {
            keyPressed.dir = keyState.direction.left;
        } else if (cursors.D.isDown) {
            keyPressed.dir = keyState.direction.right;
        } else {
            keyPressed.dir = keyState.direction.none;
        }

        keyPressed.kick = keyState.kick.none;
        cursors.SPACE.once('down', function () {
            socket.emit('cat2kick');
            keyPressed.kick = keyState.kick.kick;
        });
        updateAll();
    }
}

const socket = io();

socket.emit('join');

socket.on('num', (num)=>{
    if(num === 1){
        states.dir = 'left';
        states.position = new Phaser.Math.Vector2(784, 16);
        states.color = 'cat2';
    }else{
        enemyStates.dir = 'left';
        enemyStates.position = new Phaser.Math.Vector2(784, 16);
        enemyStates.color = 'cat2';
    }
    if(states.color === 'cat1') {
        socket.on('updateKey', (keypress) => {
            enemyKeyPressed = keypress;
        });
    }else{//cat2
        socket.on('update', (serverStates) => {
            states = serverStates['cat2'];
            enemyStates = serverStates['cat1'];
            ballPos = serverStates['ball'];
        });
        socket.on('score', (score)=>{
            text1.setText(`Score: `+score['cat1']);
            text2.setText(`Score: `+score['cat2']);
        })
    }
    var game = new Phaser.Game(config);
});



