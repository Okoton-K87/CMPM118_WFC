class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load the roguelike sprite sheet with 1-pixel gaps
        this.load.spritesheet("roguelikeTiles", "roguelikeSheet_transparent.png", {
            frameWidth: 16,  // Tile width
            frameHeight: 16, // Tile height
            margin: 0,       // 1-pixel margin between tiles
            spacing: 1       // 1-pixel spacing between tiles
        });

        // Add other assets if needed here
    }

    create() {
        // Move to the Map Scene after assets are loaded
        // this.scene.start("testAutoTilingScene");
        this.scene.start("mapGenerateScene");
    }
}
