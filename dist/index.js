var config = {
    type: Phaser.CANVAS,
    width: 1000,
    height: 600,
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
    this.load.spritesheet('cat', 'assets/cat.png', {frameWidth: 50, frameHeight: 50});
}

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
function create() {
    map = this.make.tilemap({key: 'map', tileHeight: 16, tileWidth: 16});
    const tileset = map.addTilesetImage('3', 'base_tiles');
    groundLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);
    // this.add.image(300, 400, 'background');

    // platforms = this.physics.add.staticGroup();
    // platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    // platforms.create(750, 220, 'ground');
}

function update(){

}

var game = new Phaser.Game(config);