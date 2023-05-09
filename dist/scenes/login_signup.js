
class HomeScene extends Phaser.Scene {
    constructor() {
        super({key: 'HomeScene'});
    }

    preload() {
        this.load.image('background', 'assets/background.jpg');
    }
    create() {
        const bgColor = Phaser.Display.Color.HexStringToColor("#EFD6BD");
        bgColor.alpha = 0.1;
        this.cameras.main.setBackgroundColor(bgColor.color);


    }
}


export default HomeScene;