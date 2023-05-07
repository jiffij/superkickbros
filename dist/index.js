import {cat, status} from './Sprite.js';
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
}

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var ball;
var enemy;
let kickMagnitude = 700;
let angle = 45; // in degrees
let radians = Phaser.Math.DegToRad(angle);

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
    enemy.body.allowGravity = false;
    this.physics.add.collider(groundLayer, enemy);
    if(enemyStates.dir === 'left') enemy.setScale(-1,1);

    //add ball
    ball = this.physics.add.image(400, 16, 'ball');
    ball.setScale(0.01);
    ball.setBounce(0.5);
    ball.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, ball);
    this.physics.add.collider(player, ball);
    this.physics.add.collider(enemy, ball);

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

    setInterval(()=>{
        socket.emit('update', states);
    }, 20)

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

function updateEnemyState(phaser){
    enemy.setPosition(enemyStates.position.x, enemyStates.position.y);
    enemy.body.updateBounds();
}

function update(){
    if(cursors.W.isDown && player.body.onFloor()){
        player.body.setVelocityY(-500);
    }else if(cursors.S.isDown){

    }

    if(cursors.A.isDown){
        states.dir = 'left';
        player.setScale(-1,1);
        player.body.setVelocityX(-200);
        states.state = status.walk;
    }else if(cursors.D.isDown){
        states.dir = 'right';
        player.setScale(1,1);
        player.body.setVelocityX(200);
        states.state = status.walk;
    }else{
        player.body.setVelocityX(0);
        states.state = status.stand;
    }

    cursors.SPACE.once('down', function() {
        let distance = Phaser.Math.Distance.Between(player.body.x, player.body.y, ball.body.x, ball.body.y);
        let velocityx;
        if(distance < 30){
            velocityx = (player.body.x > ball.body.x)? -200: 200;
            if((velocityx > 0 && states.dir === 'right') || (velocityx < 0 && states.dir === 'left')){
                ball.body.setVelocity(velocityx,700);
            }

        }


    });

    states.position = player.body.position;
    // console.log(states.position);
    updateAnimState();

    updateEnemyState(this);
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
    var game = new Phaser.Game(config);
});

socket.on('update', (serverStates)=>{
    for(let id in serverStates){
        if(id !== socket.id){
            enemyStates = serverStates[id];
            // console.log(enemyStates.position);
        }
    }
});

