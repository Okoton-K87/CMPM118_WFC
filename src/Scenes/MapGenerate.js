class MapGenerate extends Phaser.Scene {
    constructor() {
        super("mapGenerateScene");
    }

    create() {
        const tileSize = 16; // No scaling, native 16x16 tile size
        const mapWidth = Math.floor(1936 / tileSize);  // 121 tiles in width
        const mapHeight = Math.floor(1056 / tileSize); // 66 tiles in height

        this.noiseScale = 10; // Initial noise scale

        noise.seed(Math.random()); // Seed the noise

        // Generate the grid with noise-based terrain
        this.grid = this.generateGrid(mapWidth, mapHeight);

        // Draw the grid with the transition handling
        this.drawGrid(this.grid, tileSize);

        // Text to indicate what is happening
        document.getElementById('description').innerHTML = `
            <h2>MapGenerate</h2>
            <p>Procedural Map Generated. Press "R" to regenerate. "," and "." to control noise scale</p>
        `;

        // Add key press listeners for regenerating and adjusting the noise scale
        this.input.keyboard.on("keydown-R", () => {
            noise.seed(Math.random()); // Re-seed the noise for a new random map
            this.scene.restart(); // Restart the scene
        });

        // Use ',' key to shrink the noise scale
        this.input.keyboard.on("keydown-COMMA", () => {
            this.noiseScale = Math.max(1, this.noiseScale - 1); // Shrink noise sample window
            this.grid = this.generateGrid(mapWidth, mapHeight);
            this.drawGrid(this.grid, tileSize);
        });

        // Use '.' key to grow the noise scale
        this.input.keyboard.on("keydown-PERIOD", () => {
            this.noiseScale += 1; // Grow noise sample window
            this.grid = this.generateGrid(mapWidth, mapHeight);
            this.drawGrid(this.grid, tileSize);
        });

        // this.createDownloadableMap(this.grid);

    }

    // Generate grid based on noise values
    generateGrid(mapWidth, mapHeight) {
        let grid = [];
        for (let y = 0; y < mapHeight; y++) {
            let row = [];
            for (let x = 0; x < mapWidth; x++) {
                let value = noise.simplex2(x / this.noiseScale, y / this.noiseScale);

                if (value < -0.2) {
                    row.push('w'); // Water
                } else if (value < 0.4) {
                    row.push('g'); // Grass
                } else {
                    row.push('m'); // Mountain
                }
            }
            grid.push(row);
        }
        return grid;
    }

    // Draw the grid and handle transitions between water, grass, and mountain
    drawGrid(grid, tileSize) {
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                let symbol = grid[y][x];

                if (symbol === 'w') {
                    // Place the water tile at (0, 0)
                    this.placeTile(x, y, 3, 1);
                    this.drawContext(grid, x, y, "g", 3, 1);

                } else if (symbol === 'g') {
                    // 10% chance to place a tree instead of grass
                    if (Math.random() < 0.1) {
                        // Place a tree at (18, 9)
                        this.placeTile(x, y, 5, 0);
                        this.placeTile(x, y, 18, 9);
                    } else if (Math.random() < 0.15) {
                        this.placeTile(x, y, 5, 0);
                        this.placeTile(x, y, 19, 9);
                    }else {
                        // Place the base grass tile at (6, 0)
                        this.placeTile(x, y, 5, 0);
                    }

                } else if (symbol === 'm') {
                    // Place a mountain tile at (5, 7)
                    this.placeTile(x, y, 8, 10);

                    // Randomly select from (3, 7), (3, 10), or (3, 13) for the transition
                    let randomOption = Phaser.Math.Between(0, 2);
                    let options = [
                        [3, 7],  // Option 1
                        [3, 10], // Option 2
                        [3, 13]  // Option 3
                    ];

                    let [ti, tj] = options[randomOption]; // Get random coordinates
                    this.drawContext(grid, x, y, "g", ti, tj); // Use randomly selected coordinates
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

    // createDownloadableMap(grid) {
    //     // Convert the grid to a string
    //     let mapString = grid.map(row => row.join("")).join("\n");
    
    //     // Create a Blob object for the map data
    //     let blob = new Blob([mapString], { type: 'text/plain' });
    //     let url = URL.createObjectURL(blob);
    
    //     // Create a download link
    //     let link = document.createElement('a');
    //     link.href = url;
    //     link.download = 'generated_map.txt';
    
    //     // Trigger the download
    //     link.click();
    
    //     // Revoke the URL after download
    //     URL.revokeObjectURL(url);
    // }
    
}
