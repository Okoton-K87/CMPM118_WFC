class TestAutoTilingScene extends Phaser.Scene {
    constructor() {
        super("testAutoTilingScene");
    }

    create() {
        const tileSize = 16; // 16x16 tiles, no scaling
        const grid = this.createTestGrid(); // Create the test grid

        console.log("Test grid created:");
        console.table(grid); // Log the initial test grid

        this.drawGrid(grid, tileSize); // Render the grid and apply auto-tiling
    }

    // Pre-made grid for testing auto-tiling (water surrounded by grass in a rectangular shape, smaller grid)
    createTestGrid() {
        const grid = [
            ['g', 'g', 'g', 'g', 'g', 'g', 'g'],
            ['g', 'w', 'w', 'w', 'w', 'w', 'g'],
            ['g', 'w', 'w', 'w', 'w', 'w', 'g'],
            ['g', 'g', 'g', 'g', 'g', 'g', 'g']
        ];
        return grid;
    }

    // Function to draw the grid and apply auto-tiling
    drawGrid(grid, tileSize) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                let symbol = grid[y][x];

                if (symbol === 'w') {
                    // Water tile
                    this.placeTile(x, y, 3, 1); // Base water tile (adjust for your tileset)
                    this.drawContext(grid, x, y, "g", 3, 1); // Auto-tile with grass around water
                } else if (symbol === 'g') {
                    // Grass tile
                    this.placeTile(x, y, 5, 0); // Base grass tile (adjust for your tileset)
                }
            }
        }
    }

    // Function to place a tile at a specific grid location using tile coordinates from the sprite sheet
    placeTile(i, j, ti, tj) {
        const numTilesPerRow = 57; // The number of tiles per row in the sprite sheet
        const tileIndex = tj * numTilesPerRow + ti; // Calculate the frame index using row and column
        this.add.image(i * 16, j * 16, 'roguelikeTiles', tileIndex).setOrigin(0);
    }

    // Check neighbors and draw transition tiles (optional)
    drawContext(grid, i, j, target, ti, tj) {
        let code = this.gridCode(grid, i, j, target);
        const tileOffsets = this.lookup[code];
        if (tileOffsets) {
            const [tiOffset, tjOffset] = tileOffsets;
            console.log(`Drawing transition for tile at (${i}, ${j}) with offsets: ti=${tiOffset}, tj=${tjOffset}`);
            this.placeTile(i, j, ti + tiOffset, tj + tjOffset);
        }
    }

    // Check grid neighbors (N, S, W, E) for the target
    gridCode(grid, i, j, target) {
        console.log(`[Checking neighbors for tile at (${i}, ${j})]`);
        
        // Check north (y - 1)
        console.log("[northBit]");
        let northBit = this.gridCheck(grid, i, j - 1, target) ? 1 : 0;
        
        // Check south (y + 1)
        console.log("[southBit]");
        let southBit = this.gridCheck(grid, i, j + 1, target) ? 1 : 0;
        
        // Check east (x + 1)
        console.log("[eastBit]");
        let eastBit = this.gridCheck(grid, i + 1, j, target) ? 1 : 0;
        
        // Check west (x - 1)
        console.log("[westBit]");
        let westBit = this.gridCheck(grid, i - 1, j, target) ? 1 : 0;

        // Combine the bits into a 4-bit code
        let code = (northBit << 0) + (southBit << 1) + (eastBit << 2) + (westBit << 3);
        console.log(`[CODE] Neighbor check at (${i}, ${j}): North=${northBit}, South=${southBit}, East=${eastBit}, West=${westBit}, Code=${code}`);
        return code;
    }

    // Helper to check bounds and match the target tile
    gridCheck(grid, i, j, target) {
        // Check if the coordinates are within the bounds of the grid
        if (i >= 0 && i < grid[0].length && j >= 0 && j < grid.length) {
            const result = grid[j][i] === target; // Note the [j][i] indexing for y,x
            console.log(`Checking tile at (${i}, ${j}) against target '${target}': ${grid[j][i]} === ${target} -> ${result}`);
            return result;
        } else {
            // If out of bounds, log this condition and return false
            console.log(`Out of bounds check at (${i}, ${j}). Target was '${target}'.`);
            return false;
        }
    }

    // Lookup table for transitions
    lookup = [
        // W, E, S, N
        [0, 0],    // 0000
        [0, -1],   // 0001
        [0, 1],    // 0010
        [0, 0],    // 0011
        [1, 0],    // 0100
        [1, -1],   // 0101
        [1, 1],    // 0110
        [1, 0],    // 0111
        [-1, 0],   // 1000
        [-1, -1],  // 1001
        [-1, 1],   // 1010
        [-1, 0],   // 1011
        [0, 0],    // 1100
        [0, -1],   // 1101
        [0, 1],    // 1110
        [0, 0]     // 1111
    ];
}

// // Add the new scene to your game config
// let config = {
//     type: Phaser.AUTO,
//     width: 400,
//     height: 400,
//     scene: [TestAutoTilingScene],
//     parent: 'phaser-game',
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: { y: 0 }
//         }
//     }
// };

// const game = new Phaser.Game(config);
