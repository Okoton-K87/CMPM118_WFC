let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { x: 0, y: 0 }
        }
    },
    width: 1936, // Fit the canvas size for better readability
    height: 1056, // Adjust height to show all tiles and leave space for text
    scene: [Load, MapScene, MapGenerate, TestAutoTilingScene] // Add Load, MapScene, MapGenerate
};

const game = new Phaser.Game(config);
