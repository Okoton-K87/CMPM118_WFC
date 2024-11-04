import Cell from './cell.js';
import Tile from './tile.js';

let tiles = [];
const tileImages = [];
let grid = [];
const DIM = 20;

// Function to remove duplicate tiles based on their edges
function removeDuplicatedTiles(tiles) {
    const uniqueTilesMap = {};
    for (const tile of tiles) {
        const key = tile.edges.join(','); // ex: "ABB,BCB,BBA,AAA"
        uniqueTilesMap[key] = tile;
    }
    return Object.values(uniqueTilesMap);
}

class WaveFunctionCollapse extends Phaser.Scene {
    constructor() {
        super("waveFunctionCollapseScene");
    }

    preload() {
        // Load tile images as textures, not as displayed images
        for (let i = 0; i < 13; i++) {
            //this.load.image(`tile${i}`, `assets/circuit-coding-train/${i}.png`);
            this.load.image(`tile${i}`, `assets/pixel-roads/${i}.png`);
        }
    }

    create() {
        // Initialize tile images by storing texture keys instead of image objects
        for (let i = 0; i < 12; i++) {
            tileImages[i] = `tile${i}`; // Store texture keys only
        }

        tiles[0] = new Tile(this, tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
        tiles[1] = new Tile(this, tileImages[1], ['ABA', 'ABA', 'ABA', 'AAA']);
        tiles[2] = new Tile(this, tileImages[2], ['ABA', 'ABA', 'AAA', 'AAA']);
        tiles[3] = new Tile(this, tileImages[3], ['AAA', 'AAA', 'ABA', 'AAA']);
        tiles[4] = new Tile(this, tileImages[4], ['AAA', 'AAA', 'AAA', 'AAA']);
        tiles[5] = new Tile(this, tileImages[5], ['ABA', 'AAA', 'ABA', 'AAA']);
        tiles[6] = new Tile(this, tileImages[6], ['ABA', 'ABA', 'ABA', 'ABA']);
        //river tiles have C now to distinguish from roads
        tiles[7] = new Tile(this, tileImages[7], ['ACA', 'AAA', 'ACA', 'AAA']);
        tiles[8] = new Tile(this, tileImages[8], ['ACA', 'ACA', 'AAA', 'AAA']);
        //tiles 9 and 10 are the bridge tiles! they rotate but i wish they didnt
        tiles[9] = new Tile(this, tileImages[9], ['ACA', 'ABA', 'ADA', 'ABA']);
        tiles[10] = new Tile(this, tileImages[10], ['ADA', 'AAA', 'ACA', 'AAA']);
        //tree
        tiles[11] = new Tile(this, tileImages[11], ['AAA', 'AAA', 'AAA', 'AAA']);

        // // Initialize tiles with edges and setup as before
        // tiles[0] = new Tile(this, tileImages[0], ['AAA', 'AAA', 'AAA', 'AAA']);
        // tiles[1] = new Tile(this, tileImages[1], ['BBB', 'BBB', 'BBB', 'BBB']);
        // tiles[2] = new Tile(this, tileImages[2], ['BBB', 'BCB', 'BBB', 'BBB']);
        // tiles[3] = new Tile(this, tileImages[3], ['BBB', 'BDB', 'BBB', 'BDB']);
        // tiles[4] = new Tile(this, tileImages[4], ['ABB', 'BCB', 'BBA', 'AAA']);
        // tiles[5] = new Tile(this, tileImages[5], ['ABB', 'BBB', 'BBB', 'BBA']);
        // tiles[6] = new Tile(this, tileImages[6], ['BBB', 'BCB', 'BBB', 'BCB']);
        // tiles[7] = new Tile(this, tileImages[7], ['BDB', 'BCB', 'BDB', 'BCB']);
        // tiles[8] = new Tile(this, tileImages[8], ['BDB', 'BBB', 'BCB', 'BBB']);
        // tiles[9] = new Tile(this, tileImages[9], ['BCB', 'BCB', 'BBB', 'BCB']);
        // tiles[10] = new Tile(this, tileImages[10], ['BCB', 'BCB', 'BCB', 'BCB']);
        // tiles[11] = new Tile(this, tileImages[11], ['BCB', 'BCB', 'BBB', 'BBB']);
        // tiles[12] = new Tile(this, tileImages[12], ['BBB', 'BCB', 'BBB', 'BCB']);



        for (let i = 0; i < 12; i++) {
            tiles[i].index = i;
        }

        // Generate rotated and unique tiles
        const initialTileCount = tiles.length;
        for (let i = 0; i < initialTileCount; i++) {
            // Skip rotation for tiles 9, 10, and 11
            if (i === 9 || i === 10 || i === 11) {
                continue;
            }
            
            let tempTiles = [];
            for (let j = 0; j < 4; j++) {
                tempTiles.push(tiles[i].rotate(j));
            }
            tempTiles = removeDuplicatedTiles(tempTiles);
            tiles = tiles.concat(tempTiles);
        }

        // Analyze adjacency for each tile
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];
            tile.analyze(tiles);
        }

        // Initialize grid and add "R" key listener for manual restart
        this.startOver();
        this.input.keyboard.on("keydown-R", () => this.startOver());
    }

    startOver() {
        // Reset the grid and prepare for a new generation
        grid = [];
        for (let i = 0; i < DIM * DIM; i++) {
            grid[i] = new Cell(tiles.length);
        }
    }

    checkValid(arr, valid) {
        for (let i = arr.length - 1; i >= 0; i--) {
            let element = arr[i];
            if (!valid.includes(element)) {
                arr.splice(i, 1);
            }
        }
    }

    update() {
        const tileSize = Math.floor(this.sys.game.config.width / DIM); // Calculate precise tile size
        const w = tileSize;
        const h = tileSize;

        // Add a delay between each generation step
        const GENERATION_DELAY = 50; // Adjust this value to control the speed
        if (this.lastUpdate && this.time.now - this.lastUpdate < GENERATION_DELAY) {
            return;
        }
        this.lastUpdate = this.time.now;

        // Clear previous grid outlines to avoid overlap
        this.children.removeAll();

        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let cell = grid[i + j * DIM];
                if (cell.collapsed) {
                    let index = cell.options[0];

                    // Check if tile and its image are properly defined
                    if (tiles[index] && tiles[index].img) {
                        const tileTextureKey = tiles[index].img;
                        if (this.textures.exists(tileTextureKey)) {
                            this.add.image(i * w + w / 2, j * h + h / 2, tileTextureKey)
                                .setDisplaySize(w, h); // Aligns tile size exactly with grid cells
                        } else {
                            console.warn(`Texture key "${tileTextureKey}" does not exist.`);
                            this.startOver(); // Automatic restart if a texture key is missing
                            return;
                        }
                    } else {
                        console.warn(`Tile at index ${index} is undefined or missing img property.`);
                        this.startOver(); // Automatic restart if a tile is missing
                        return;
                    }
                } else {
                    // Display grid cell border only for cells that are not collapsed
                    this.add.rectangle(i * w + w / 2, j * h + h / 2, w, h)
                        .setStrokeStyle(1, 0x333333);
                }
            }
        }

        // Pick cell with least entropy
        let gridCopy = grid.slice();
        gridCopy = gridCopy.filter((a) => !a.collapsed);

        if (gridCopy.length === 0) return;

        gridCopy.sort((a, b) => a.options.length - b.options.length);

        let len = gridCopy[0].options.length;
        let stopIndex = 0;
        for (let i = 1; i < gridCopy.length; i++) {
            if (gridCopy[i].options.length > len) {
                stopIndex = i;
                break;
            }
        }

        if (stopIndex > 0) gridCopy.splice(stopIndex);
        const cell = Phaser.Utils.Array.GetRandom(gridCopy);
        cell.collapsed = true;
        const pick = Phaser.Utils.Array.GetRandom(cell.options);
        if (pick === undefined) {
            this.startOver(); // Automatic restart if an error occurs
            return;
        }
        cell.options = [pick];

        const nextGrid = [];
        for (let j = 0; j < DIM; j++) {
            for (let i = 0; i < DIM; i++) {
                let index = i + j * DIM;
                if (grid[index].collapsed) {
                    nextGrid[index] = grid[index];
                } else {
                    let options = new Array(tiles.length).fill(0).map((x, i) => i);
                    
                    // Look up
                    if (j > 0) {
                        let up = grid[i + (j - 1) * DIM];
                        let validOptions = [];
                        for (let option of up.options) {
                            if (tiles[option]) {
                                let valid = tiles[option].down;
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }
                    
                    // Look right
                    if (i < DIM - 1) {
                        let right = grid[i + 1 + j * DIM];
                        let validOptions = [];
                        for (let option of right.options) {
                            if (tiles[option]) {
                                let valid = tiles[option].left;
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }
                    
                    // Look down
                    if (j < DIM - 1) {
                        let down = grid[i + (j + 1) * DIM];
                        let validOptions = [];
                        for (let option of down.options) {
                            if (tiles[option]) {
                                let valid = tiles[option].up;
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }
                    
                    // Look left
                    if (i > 0) {
                        let left = grid[i - 1 + j * DIM];
                        let validOptions = [];
                        for (let option of left.options) {
                            if (tiles[option]) {
                                let valid = tiles[option].right;
                                validOptions = validOptions.concat(valid);
                            }
                        }
                        this.checkValid(options, validOptions);
                    }

                    nextGrid[index] = new Cell(options);
                }
            }
        }

        grid = nextGrid;
    }
}

export default WaveFunctionCollapse;
