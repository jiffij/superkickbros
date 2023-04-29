var config = {
    type: Phaser.CANVAS,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade', //default 是 Arcade physics
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
    }
};

function init() {
    console.log('init')
}

function preload() {
    this.load.image('background', 'assets/background.jpg');
}

var platforms;
function create() {
    this.add.image(300, 400, 'background')
    // platforms = this.physics.add.staticGroup();
    // platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    // platforms.create(600, 400, 'ground');
    // platforms.create(50, 250, 'ground');
    // platforms.create(750, 220, 'ground');
}

var game = new Phaser.Game(config);