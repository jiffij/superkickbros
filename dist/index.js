import {cat, status} from './Sprite.js';

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
var prestate = status.stand;
var state = status.stand;
let forceMagnitude = 100;
let angle = 45; // in degrees
let radians = Phaser.Math.DegToRad(angle);
var dir = 'right';
function create() {
    map = this.make.tilemap({key: 'map', tileHeight: 16, tileWidth: 16});
    const tileset = map.addTilesetImage('3', 'base_tiles');
    groundLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    //add player
    player = this.physics.add.sprite(16, 16, 'cat1');
    player.body.setSize(16,16);
    player.body.setOffset(26,40);
    player.setBounce(0.2, 0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, player);

    //add ball
    ball = this.physics.add.image(400, 16, 'ball');
    ball.setScale(0.01);
    ball.setBounce(0.5);
    ball.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, ball);
    this.physics.add.collider(player, ball);

    this.anims.create(
        {
            key: 'stand',
            frames: this.anims.generateFrameNumbers('cat1', { start: cat.stand.start, end: cat.stand.end}),
            frameRate: 8,
            repeat: -1
        });

    this.anims.create(
        {
            key: 'walk',
            frames: this.anims.generateFrameNumbers('cat1', { start: cat.walk.start, end: cat.walk.end}),
            frameRate: 8,
            repeat: -1
        });

    player.play('stand');

    cursors = this.input.keyboard.addKeys(
        'W,A,S,D,SPACE'
    );
}

function updateAnimState(){
    if(prestate === state) return;
    switch (state) {
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
    prestate = state;
}

function update(){
    if(cursors.W.isDown && player.body.onFloor()){
        player.body.setVelocityY(-500);
    }else if(cursors.S.isDown){

    }

    if(cursors.A.isDown){
        dir = 'left';
        player.setScale(-1,1);
        player.body.setVelocityX(-200);
        state = status.walk;
    }else if(cursors.D.isDown){
        dir = 'right';
        player.setScale(1,1);
        player.body.setVelocityX(200);
        state = status.walk;
    }else{
        player.body.setVelocityX(0);
        state = status.stand;
    }

    cursors.SPACE.once('down', function() {
        let distance = Phaser.Math.Distance.Between(player.body.x, player.body.y, ball.body.x, ball.body.y);
        let velocityx;
        if(distance < 30){
            velocityx = (player.body.x > ball.body.x)? -200: 200;
            if((velocityx > 0 && dir === 'right') || (velocityx < 0 && dir === 'left')){
                ball.body.setVelocity(velocityx,700);
            }

        }

        // ball.applyForce(new Phaser.Math.Vector2(forceMagnitude * Math.cos(radians), forceMagnitude * Math.sin(radians)))
    });

    updateAnimState();
}

var game = new Phaser.Game(config);