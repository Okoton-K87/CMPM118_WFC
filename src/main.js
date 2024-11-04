import WaveFunctionCollapse from './Scenes/sketch.js';

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
    width: 400, // Adjusted for 25x25 grid with 16x16 tiles
    height: 400, // Adjusted for 25x25 grid with 16x16 tiles

    //green background
    backgroundColor:  '#84c46c',
    scene: [WaveFunctionCollapse] // Only Load and WaveFunctionCollapse scenes
    
};

const game = new Phaser.Game(config);
