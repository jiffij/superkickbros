import {cat, status, keyState} from '../Sprite.js';

const Random = Phaser.Math.Between;

const COLOR_PRIMARY = 0x6F1515;
const COLOR_LIGHT = 0x000000;
const COLOR_DARK = 0xffffff;



class GameEnd extends Phaser.Scene {
    constructor() {
        super({
            key: 'examples'
        })
    }

    preload() { 
        this.load.image('background', 'assets/background.jpg');
        this.load.spritesheet('cat1', 'assets/cat1.png', {frameWidth: 64, frameHeight: 64});
        this.load.spritesheet('cat2', 'assets/cat2.png', {frameWidth: 64, frameHeight: 64});
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });      
    }

    create() {
        const bgColor = Phaser.Display.Color.HexStringToColor("#000000");
        bgColor.alpha = 0.5;
        this.cameras.main.setBackgroundColor(bgColor.color);

        const button = this.add.text(650, 47, '⭐Back', { fill: '#fff',fontStyle: 'bold',})
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // navigate to another scene
                this.scene.start('GameScene');
            })
            .on('pointerover', () => {
                // change color on hover
                button.setFill('#F9E83E');
            })
            .on('pointerout', () => {
                // change back to original color
                button.setFill('#fff');
            });
            button.setFontSize(20);

        const titleText = this.add.text(this.game.config.width / 2, 40, 'You Win!', {
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#F9E83E'
          }).setOrigin(0.5, 0);
          
        const name1 = this.add.text(65, 140, 'player1', {
            fontSize: 18,
            color: '#3CD33A'
        });

        const name2 = this.add.text(660, 140, 'player2', {
            fontSize: 18,
            color: '#3CD33A'
        });

        const player1 = this.add.sprite(this.game.config.width / 8, this.game.config.height / 2-20, 'cat1');
        player1.setScale(3);

        const player2 = this.add.sprite(this.game.config.width / 8*7-20, this.game.config.height / 2-20, 'cat2');
        player2.setScale(-3,3);

        this.anims.create(
            {
                key: 'dance',
                frames: this.anims.generateFrameNumbers('cat1', { start: cat.dance.start, end: cat.dance.end}),
                frameRate: 10,
                repeat: -1
            });

        this.anims.create(
            {
                key: 'shutdown',
                frames: this.anims.generateFrameNumbers('cat1', { start: cat.shutdown.start, end: cat.shutdown.end}),
                frameRate: 8,
                repeat: 0
            });
        player1.play('dance');
        player2.play('shutdown');

        
            
        const container1 = this.add.container(this.game.config.width / 8-68, this.game.config.height / 2+80);
        const graphics1 = this.add.graphics();
        container1.add(graphics1);
        graphics1.lineStyle(1, 0xffffff, 1);
                
        var height = 40;
        var width = 130;
        graphics1.strokeRoundedRect(0, 0, width, height, 10);
        const text1 = this.add.text(width/2, height/2, 'score1', {
            fontSize: 15,
            color: '#ffffff'
        });
        text1.setOrigin(0.5,0.5);
        container1.add(text1);

        const container2 = this.add.container(this.game.config.width / 8*7-68, this.game.config.height / 2+80);
        const graphics2 = this.add.graphics();
        container2.add(graphics2);
        graphics2.lineStyle(1, 0xffffff, 1);
                
        var height = 40;
        var width = 130;
        graphics2.strokeRoundedRect(0, 0, width, height, 10);
        const text2 = this.add.text(width/2, height/2, 'score2', {
            fontSize: 15,
            color: '#ffffff'
        });
        text2.setOrigin(0.5,0.5);
        container2.add(text2);

        //table
        var scrollMode = 0; // 0:vertical, 1:horizontal
        var gridTable = this.rexUI.add.gridTable({
            x: 397.5,
            y: 270,
            width: (scrollMode === 0) ? 350 : 420,
            height: (scrollMode === 0) ? 300 : 300,

            scrollMode: scrollMode,

            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, 0x000000).setStrokeStyle(1, 0xffffff),

            table: {
                cellWidth: (scrollMode === 0) ? undefined : 60,
                cellHeight: (scrollMode === 0) ? 60 : undefined,

                columns: 1,

                mask: {
                    padding: 5,
                },

                reuseCellContainer: true,
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 5, 20, 0, 0x888484),
                thumb: this.rexUI.add.roundRectangle(0, 0, 10, 20, 5, 0xDFDFDF),
            },
          
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },

            header: this.rexUI.add.label({
                width: (scrollMode === 0) ? undefined : 30,
                height: (scrollMode === 0) ? 30 : undefined,

                orientation: scrollMode,
                background: this.rexUI.add.roundRectangle(0, 0, 10, 20, 10, 0x000000),//.setStrokeStyle(1, 0xffffff),
                text: this.add.text(0, 0, 'World Ranking'),
                align: 'center'
            }),

            //footer: GetFooterSizer(this, scrollMode),

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

                table: 10,
                header: 10,
                footer: 10,
            },

            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: height,

                        orientation: scrollMode,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(1, COLOR_DARK),
                        //icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0x0),
                        text: scene.add.text(0, 0, ''),

                        space: {
                            icon: 10,
                            left: (scrollMode === 0) ? 15 : 0,
                            top: (scrollMode === 0) ? 0 : 15,
                        }
                    });
                    console.log(cell.index + ': create new cell-container');
                } else {
                    console.log(cell.index + ': reuse cell-container');
                }

                // Set properties from item value
                cellContainer.setMinSize(width, height); // Size might changed in this demo
                cellContainer.getElement('text').setText(item.id+1); // Set text of text object
                //cellContainer.getElement('icon').setFillStyle(item.color); // Set fill color of round rectangle object
                cellContainer.getElement('background').setStrokeStyle(1, COLOR_DARK).setDepth(0);
                return cellContainer;
            },
            items: CreateItems(50)
        })
            .layout();
        //.drawBounds(this.add.graphics(), 0xff0000);

        //this.print = this.add.text(0, 0, '');
        //gridTable
            // .on('cell.down', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'pointer-down ' + cellIndex + ': ' + cellContainer.text + '\n';
            // }, this)
            // .on('cell.up', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'pointer-up ' + cellIndex + ': ' + cellContainer.text + '\n';
            // }, this)
            // .on('cell.over', function (cellContainer, cellIndex, pointer) {
            //     cellContainer.getElement('background')
            //         .setStrokeStyle(3, 0xF9E83E)
            //         .setDepth(1);
            // }, this)
            // .on('cell.out', function (cellContainer, cellIndex, pointer) {
            //     cellContainer.getElement('background')
            //         .setStrokeStyle(1, COLOR_DARK)
            //         .setDepth(0);
            // }, this);
            // .on('cell.click', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'click ' + cellIndex + ': ' + cellContainer.text + '\n';
          
            //     var nextCellIndex = cellIndex + 1;
            //     var nextItem = gridTable.items[nextCellIndex];
            //     if (!nextItem) {
            //         return;
            //     }
            //     nextItem.color = 0xffffff - nextItem.color;
            //     gridTable.updateVisibleCell(nextCellIndex);
          
            // }, this)
            // .on('cell.1tap', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += '1 tap (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.2tap', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += '2 taps (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.pressstart', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'press-start (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.pressend', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'press-end (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.swiperight', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'swipe-right (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.swipeleft', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'swipe-left (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.swipeup', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'swipe-up (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)
            // .on('cell.swipedown', function (cellContainer, cellIndex, pointer) {
            //     this.print.text += 'swipe-down (' + cellIndex + ': ' + cellContainer.text + ')\n';
            // }, this)      
      
        // this.add.text(800, 600, 'Reset item')
        //     .setOrigin(1, 1)
        //     .setInteractive()
        //     .on('pointerdown', function () {
        //         var itemCount = Random(10, 50);
        //         gridTable
        //             .setItems(CreateItems(itemCount))
        //             .scrollToBottom()
        //         console.log(`Create ${itemCount} items`)
        //     })  
        
        
        // this.anims.create(
        //     {
        //         key: 'dance',
        //         frames: this.anims.generateFrameNumbers('cat1', { start: cat.dance.start, end: cat.dance.end}),
        //         frameRate: 10,
        //         repeat: -1
        //     });

        // this.anims.create(
        //     {
        //         key: 'shutdown',
        //         frames: this.anims.generateFrameNumbers('cat1', { start: cat.shutdown.start, end: cat.shutdown.end}),
        //         frameRate: 8,
        //         repeat: 0
        //     });

        // player1.play('dance');
    }

    update() {
    }
}

var CreateItems = function (count) {
    var data = [];
    for (var i = 0; i < count; i++) {
        data.push({
            id: i,
            color: Random(0, 0xffffff)
        });
    }
    return data;
}


var GetFooterSizer = function (scene, orientation) {
    return scene.rexUI.add.sizer({
        orientation: orientation
    })
        .add(
            CreateFooterButton(scene, 'Reset', orientation),   // child
            1,         // proportion
            'center'   // align
        )
        .add(
            CreateFooterButton(scene, 'Exit', orientation),    // child
            1,         // proportion
            'center'   // align
        )
}

var CreateFooterButton = function (scene, text, orientation) {
    return scene.rexUI.add.label({
        height: (orientation === 0) ? 40 : undefined,
        width: (orientation === 0) ? undefined : 40,
        orientation: orientation,
        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_DARK),
        text: scene.add.text(0, 0, text),
        icon: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_LIGHT),
        align: 'center',
        space: {           
            icon: 10
        }
    })
        .setInteractive()
        .on('pointerdown', function () {
            console.log(`Pointer down ${text}`)
        })
        .on('pointerover', function(){
            this.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('pointerout', function(){
            this.getElement('background').setStrokeStyle();
        })  
}

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 480,
    scene: GameEnd
};

var game = new Phaser.Game(config);
export default GameEnd;