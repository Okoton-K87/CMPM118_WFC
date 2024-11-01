function reverseString(s) {
    let arr = s.split('');
    arr = arr.reverse();
    return arr.join('');
}

function compareEdge(a, b) {
    return a === reverseString(b);
}

class Tile {
    constructor(scene, img, edges, i) {
        this.scene = scene;  // Store the Phaser scene
        this.img = img;
        this.edges = edges;
        this.up = [];
        this.right = [];
        this.down = [];
        this.left = [];

        if (i !== undefined) {
            this.index = i;
        }
    }

    analyze(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            let tile = tiles[i];

            // Tile can't match itself
            if (tile.index === this.index) continue;

            // UP
            if (compareEdge(tile.edges[2], this.edges[0])) {
                this.up.push(i);
            }
            // RIGHT
            if (compareEdge(tile.edges[3], this.edges[1])) {
                this.right.push(i);
            }
            // DOWN
            if (compareEdge(tile.edges[0], this.edges[2])) {
                this.down.push(i);
            }
            // LEFT
            if (compareEdge(tile.edges[1], this.edges[3])) {
                this.left.push(i);
            }
        }
    }

    rotate(num) {
        const angle = (Math.PI / 2) * num; // Rotate by 90 degrees * num
        const rotatedImageKey = `${this.index}_rotated_${num}`; // Unique key for rotated image
    
        if (!this.scene.textures.exists(rotatedImageKey)) {
            // Retrieve the source image for this texture
            const sourceImage = this.scene.textures.get(this.img).getSourceImage();
    
            // Create a canvas texture to draw the rotated image
            const rotatedTexture = this.scene.textures.createCanvas(rotatedImageKey, sourceImage.width, sourceImage.height);
            const ctx = rotatedTexture.context;
            
            ctx.clearRect(0, 0, sourceImage.width, sourceImage.height); // Clear canvas before drawing
            ctx.save();
            ctx.translate(sourceImage.width / 2, sourceImage.height / 2); // Center rotation
            ctx.rotate(angle);
            ctx.drawImage(sourceImage, -sourceImage.width / 2, -sourceImage.height / 2); // Draw rotated image
            ctx.restore();
    
            rotatedTexture.refresh(); // Refresh the texture after drawing
        }
    
        // Generate new edges after rotation
        const newEdges = [];
        const len = this.edges.length;
        for (let i = 0; i < len; i++) {
            newEdges[i] = this.edges[(i - num + len) % len];
        }
    
        // Return a new Tile instance with the rotated image key and updated edges
        return new Tile(this.scene, rotatedImageKey, newEdges, this.index);
    }    
    
}

export default Tile;
