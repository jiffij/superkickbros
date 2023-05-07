var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 480,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
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
}

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var body;
function create() {
    map = this.make.tilemap({key: 'map', tileHeight: 16, tileWidth: 16});
    const tileset = map.addTilesetImage('3', 'base_tiles');
    groundLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;
    player = this.physics.add.sprite(16, 16, 'cat1');

    player.body.setSize(16,16);
    player.body.setOffset(26,40);
    player.setBounce(0.2, 0.2);
    player.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, player);

    cursors = this.input.keyboard.addKeys(
        'W,A,S,D'
    );
}

function update(){
    if(cursors.W.isDown && player.body.onFloor()){
        player.body.setVelocityY(-500);
    }else if(cursors.S.isDown){

    }else if(cursors.A.isDown){
        player.setScale(-1,1);
        player.body.setVelocityX(-200);
    }else if(cursors.D.isDown){
        player.setScale(1,1);
        player.body.setVelocityX(200);
    }
}

var game = new Phaser.Game(config);