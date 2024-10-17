class MapScene extends Phaser.Scene {
    constructor() {
        super("mapScene");
    }

    create() {
        const tileSize = 16; // Original tile size
        const scale = 2; // Scaling factor
        const scaledTileSize = tileSize * scale; // New tile size after scaling
        const numTilesPerRow = 57; // Number of tiles in the first row
        const numRows = 31; // Total number of rows (tiles in each column)
        const spacing = 1; // 1-pixel spacing between tiles

        // Start the first tile exactly at (0, 0)
        let x = 0;
        let y = 0; // y will increase as we move down each row

        // Loop through all the rows and columns to place each tile
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numTilesPerRow; col++) {
                const tileIndex = row * numTilesPerRow + col;

                // Log the tile's (x, y) coordinates
                const coordX = col;
                const coordY = row;
                console.log(`Tile coordinates: (${coordX}, ${coordY})`);

                // Place the tile on the screen using the correct frame index
                this.add.image(x, y, 'roguelikeTiles', tileIndex)
                    .setOrigin(0)
                    .setScale(scale); // Scale the tile by 2x

                // Display the tile (x, y) coordinates on the tile for clarity
                this.add.text(x + scaledTileSize / 2, y + scaledTileSize / 2, `(${coordX}, ${coordY})`, {
                    fontSize: '8px',
                    color: '#ffffff',
                    backgroundColor: '#000000'
                }).setOrigin(0.5);

                // Update x position: scaled tile size + spacing
                x += (scaledTileSize + spacing);
            }
            // Reset x to 0 for the next row, and increase y for the new row
            x = 0;
            y += (scaledTileSize + spacing); // Move down by scaled tile size + spacing
        }

        // Add a message at the bottom to switch to the next scene
        this.add.text(10, 930, "Press S to go to the next scene", {
            fontSize: "12px",
            color: "#ffffff"
        });

        // Set up the key listener for "S" to switch scenes
        this.input.keyboard.on("keydown-S", () => {
            this.scene.start("mapGenerateScene");
        });
    }
}
