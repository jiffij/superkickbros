import {cat, status, keyState, mushroomSprite, hadoukenConfig} from './Sprite.js';
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
    this.load.spritesheet('mushroom', 'assets/Mario1/Characters/Enemies.png', {frameWidth: mushroomSprite.size, frameHeight: mushroomSprite.size});
    this.load.spritesheet('hadouken', 'assets/hadouken.png', {frameWidth: hadoukenConfig.width, frameHeight: hadoukenConfig.height});
}


var game;
var map;
var player;
var cursors;
var groundLayer, coinLayer;
var ball;
var enemy;
// var hadouken;
let kickMagnitude = 700;
let angle = 45; // in degrees
var net1;
var net2;
var cat1Score = 0;
var cat2Score = 0;
var text1;
var text2;
var mushroom;
var mushroomPos = new Phaser.Math.Vector2(mushroomSprite.initx, mushroomSprite.inity);
var mushroomPrePos = new Phaser.Math.Vector2(mushroomSprite.initx, mushroomSprite.inity);
var mushroomVelocity = 100;
var mushroomChangeDir = false;
var cat1velocity = 200;
var cat2velocity = 200;
let radians = Phaser.Math.DegToRad(angle);
var ballPos = new Phaser.Math.Vector2(400, 16);
var hadouken1;
var hadouken2;
let sequenceIndex = 0;

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

    this.anims.create(
        {
            key: 'fall',
            frames: this.anims.generateFrameNumbers(states.color, { start: cat.fall.start, end: cat.fall.end-2}),
            frameRate: 9,
            repeat: 0,
        }
    )

    player.play('stand');

    cursors = this.input.keyboard.addKeys(
        'W,A,S,D,SPACE,E,J,K,L'
    );

    //blue cat
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

    //mushroom
    mushroom = this.physics.add.sprite(mushroomSprite.initx, mushroomSprite.inity, 'mushroom');
    mushroom.body.setSize(16,16);
    mushroom.body.setOffset(8,16);
    mushroom.setBounce(0.2, 0.2);
    mushroom.setCollideWorldBounds(true);
    this.physics.add.collider(groundLayer, mushroom);
    this.physics.add.collider(mushroom, ball);
    this.physics.add.collider(mushroom, player);
    this.physics.add.collider(mushroom, enemy);
    if(states.color === 'cat1') mushroom.body.setVelocityX(mushroomVelocity);
    if(states.color === 'cat2') mushroom.body.allowGravity = false;
    // mushroom.body.setVelocityX(mushroomVelocity);

    this.physics.add.overlap(player, mushroom, () => {
        // Detect the direction of the collision
        const overlapX = Math.abs(player.x - mushroom.x);
        const overlapY = Math.abs(player.y - mushroom.y);

        if (overlapX > overlapY) {
            if (player.x < mushroom.x) {
                console.log('Collision from left');
            } else {
                console.log('Collision from right');
            }
            cat1velocity = 100;
            setTimeout(()=>{
                cat1velocity = 200;
            }, 2000);
        } else {
            if (player.y < mushroom.y) {
                console.log('Collision from above');
                mushroom.play('mushroomCollapse');
                setTimeout(()=>{
                    mushroom.play('mushroomWalk');
                }, 2000);
            } else {
                console.log('Collision from below');
            }
        }
    });

    this.physics.add.overlap(enemy, mushroom, () => {
        // Detect the direction of the collision
        const overlapX = Math.abs(enemy.x - mushroom.x);
        const overlapY = Math.abs(enemy.y - mushroom.y);

        if (overlapX > overlapY) {
            if (enemy.x < mushroom.x) {
                console.log('Collision from left');
            } else {
                console.log('Collision from right');
            }
            cat2velocity = 100;
            setTimeout(()=>{
                cat2velocity = 200;
            }, 2000);
        } else {
            if (enemy.y < mushroom.y) {
                console.log('Collision from above');
                mushroom.play('mushroomCollapse');
                setTimeout(()=>{
                    mushroom.play('mushroomWalk');
                }, 2000);
            } else {
                console.log('Collision from below');
            }
        }
    });

    // this.physics.add.collider(groundLayer, mushroom, ()=>{
    //     console.log('colliding');
    //     mushroomVelocity = -mushroomVelocity;
    //     mushroom.body.setVelocityX(mushroomVelocity);
    // })

    this.anims.create(
        {
            key: 'mushroomWalk',
            frames: this.anims.generateFrameNumbers('mushroom', {start: mushroomSprite.start, end: mushroomSprite.end}),
            frameRate: 4,
            repeat: -1,
        }
    );

    this.anims.create(
        {
            key: 'mushroomCollapse',
            frames: this.anims.generateFrameNumbers('mushroom', {start:mushroomSprite.collapse, end: mushroomSprite.collapse}),
            frameRate: 1,
            repeat: -1,
        }
    );

    mushroom.play('mushroomWalk');

    //blue cat animation
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
    this.anims.create(
        {
            key: 'enemyFall',
            frames: this.anims.generateFrameNumbers(enemyStates.color, { start: cat.fall.start, end: cat.fall.end-2}),
            frameRate: 9,
            repeat: 0,
        }
    )

    enemy.play('enemyStand');

    //hadouken
    hadouken1 = this.physics.add.sprite(800,480, 'hadouken');
    hadouken2 = this.physics.add.sprite(800,480, 'hadouken');
    hadouken1.body.allowGravity = false;
    hadouken2.body.allowGravity = false;
    hadouken1.visible = false;
    hadouken2.visible = false;


    this.anims.create(
        {
            key: 'HADOUKEN1',
            frames: this.anims.generateFrameNumbers('hadouken', {start: hadoukenConfig.start, end: hadoukenConfig.end}),
            frameRate: hadoukenConfig.end+1,
            repeat: 0,
        }
    );
    this.anims.create(
        {
            key: 'HADOUKEN2',
            frames: this.anims.generateFrameNumbers('hadouken', {start: hadoukenConfig.start, end: hadoukenConfig.end}),
            frameRate: hadoukenConfig.end+1,
            repeat: 0,
        }
    );

    // var hadouken = this.physics.add.sprite(player.body.position.x + 100, player.body.position.y, 'hadouken');

    //secret code "JKL"
    cursors.J.on('down', ()=>{
        if(sequenceIndex === 0) sequenceIndex = 1;
        else sequenceIndex = 0;
    });

    cursors.K.on('down', ()=>{
        if(sequenceIndex === 1) sequenceIndex = 2;
        else sequenceIndex = 0;
    });
    cursors.L.on('down', ()=>{
        if(sequenceIndex === 2) {
            if (!hadouken1.visible) {
                states.color === 'cat1' ?
                    hadouken('cat1', player.body.position) : socket.emit('hadoukenKey');
            }
        } else sequenceIndex = 0;
    });

    //events
    if(states.color === 'cat1'){
        setInterval(()=>{
            socket.emit('update', {cat1: states, cat2: enemyStates, ball: ballPos, mushroom: mushroomPos});//states
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
        socket.on('hadoukenKey', ()=>{
           hadouken('cat2', enemy.body.position);
        });
        this.physics.add.overlap(hadouken1, enemy, ()=>{
            if(enemyStates.state === status.fall) return;
            enemyStates.state = status.fall;
            enemy.body.immovable = true;
            setTimeout(()=>{
                enemyStates.state = status.stand;
                enemy.body.immovable = false;
            }, 2000);
            socket.emit('fall', 'cat2');
        });
        this.physics.add.overlap(hadouken2, player, ()=>{
            if(player.state === status.fall) return;
            states.state = status.fall;
            player.body.immovable = true;
            setTimeout(()=>{
                states.state = status.stand;
                player.body.immovable = false;
            }, 2000);
            socket.emit('fall', 'cat1');
        });
    }else{
        setInterval(()=>{
            socket.emit('updateKey', keyPressed);//states
        }, 10);
        socket.on('hadouken', (data)=>{
            hadouken(data.who, data.position);
        });
        socket.on('score', (score)=>{
            this.scene.restart();
            setTimeout(()=>{
                text1.setText(`Score: `+score['cat1']);
                text2.setText(`Score: `+score['cat2']);
            }, 1000);
        });
        socket.on('fall', (who)=>{
           var victimState = who === 'cat1'? enemyStates: states;
           victimState.state = status.fall;
           setTimeout(()=>{
               victimState.state = status.stand;
           }, 2000);
        });
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
        case status.fall:
            player.play('fall');
            break;
    }
    states.prestate = states.state;
}

function updateMushroom(){

    if(mushroomPos.x < 260 || mushroomPos.x > 530) {
        mushroomChangeDir = true;
    }
    if(mushroomChangeDir){
        mushroomVelocity = -mushroomVelocity;
        mushroomChangeDir = false;
    }
    mushroom.body.setVelocityX(mushroomVelocity);
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
        case status.fall:
            enemy.play('enemyFall');
            break;
    }
    enemyStates.prestate = enemyStates.state;
}

function updateAll(){
    player.setPosition(states.position.x, states.position.y);
    enemy.setPosition(enemyStates.position.x, enemyStates.position.y);
    ball.setPosition(ballPos.x, ballPos.y);
    mushroom.setPosition(mushroomPos.x, mushroomPos.y);
    states.dir === 'left'? player.setScale(-1,1): player.setScale(1,1);
    enemyStates.dir === 'left'? enemy.setScale(-1,1): enemy.setScale(1,1);
    updateAnimState();
    updateEnemyAnimState();
}

function enemyAction(){
    if(enemyKeyPressed === null) return;
    if(enemyStates.state === status.fall) return;
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
            enemy.body.setVelocityX(-cat2velocity);
            enemyStates.state = status.walk;
            break;
        case keyState.direction.right:
            enemyStates.dir = 'right';
            enemy.setScale(1,1);
            enemy.body.setVelocityX(cat2velocity);
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

function hadouken(who, position){
    if(who === 'cat1') {
        if(states.color === 'cat1') socket.emit('hadouken', {who: 'cat1', position: position});
        hadouken1.setPosition(position.x, position.y);
        hadouken1.play('HADOUKEN1');
        hadouken1.visible = true;
        states.dir === 'left' ? hadouken1.setScale(-1, 1) : hadouken1.setScale(1, 1);
        hadouken1.body.setVelocityX(states.dir === 'left' ? -100 : 100);
        setTimeout(() => {
            hadouken1.body.setVelocityX(0);
            hadouken1.visible = false;
            hadouken1.setPosition(800, 480);
        }, 1500);
    }else{
        if(states.color === 'cat1') socket.emit('hadouken', {who: 'cat2', position: position});
        hadouken2.setPosition(position.x, position.y);
        hadouken2.play('HADOUKEN2');
        hadouken2.visible = true;
        enemyStates.dir === 'left' ? hadouken2.setScale(-1, 1) : hadouken2.setScale(1, 1);
        hadouken2.body.setVelocityX(enemyStates.dir === 'left' ? -100 : 100);
        setTimeout(() => {
            hadouken2.body.setVelocityX(0);
            hadouken2.visible = false;
            hadouken2.setPosition(800, 480);
        }, 1500);
    }
}

function update(){
    if(states.color === 'cat1') {
        if(states.state !== status.fall) {
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
                player.body.setVelocityX(-cat1velocity);
                states.state = status.walk;
                // keyPressed.dir = keyState.direction.left;
            } else if (cursors.D.isDown) {
                states.dir = 'right';
                player.setScale(1, 1);
                player.body.setVelocityX(cat1velocity);
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

            //hadouken
            // cursors.E.once('down', function () {
            //         if (!hadouken1.visible) {
            //             hadouken('cat1', player.body.position);
            //         }
            //     }
            // );
        }

        //update position
        states.position = player.body.position;
        enemyStates.position = enemy.body.position;
        ballPos = ball.body.position;
        mushroomPos = mushroom.body.position;
        updateAnimState();
        updateEnemyAnimState();
        enemyAction();
        updateMushroom();
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

        //hadouken
        // cursors.E.once('down', function () {
        //     if(!hadouken1.visible){
        //         socket.emit('hadoukenKey');
        //     }
        // });

        updateAll();
    }
}

const socket = io();

// socket.emit('join');

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
            mushroomPos = serverStates['mushroom'];
        });
    }
    game = new Phaser.Game(config);
});

function startgame() {
    console.log('This function is workable')
    socket.emit('join');
    //game = new Phaser.Game(config);
    console.log('The game has generated')
}