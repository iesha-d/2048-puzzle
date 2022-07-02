class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    translate(xShift, yShift) {
        return new Point(this.x + xShift, this.y + yShift);
    }

    scale(factor) {
        return new Point(this.x * factor, this.y * factor);
    }

    // In animation, we typically have a target Point that you are approaching
    // and we want to step toward that point every frame. 
}






// Model-view-controller (MVC) architecture
//
// GUIs are really common - and programmers have spent a lot of collective time
// thinking about how to deal with writing GUI code.
//
// The MVC architecture is one of those overall approaches to creating a 
// well-structured graphical project.
//
// Model: Stores a representation of "what the user sees", sort of like
//   the state of the board, the list of objects, stuff like that.
//   If we were playing chess, the Model would be a matrix of 64 tiles
//   together with their contents, maybe the names of the players,
//   the game state ("playing", "finished",  etc.), and so on.
//   The Model has NO IDEA how to draw anything, receive user input,
//   or whatever. All it does is store WHAT is the situation, not HOW to
//   show it to the user.
//
//   For Pong: playing|finished, ball pos, paddle y-coords, player scores
//
// View: Draws Models on the screen, deals with issues of color, shape,
//   requesting additional animation information from model.
//
// Controller:
//   - Where the program starts. First builds Model, then View, then
//     it sits on top of everything.
//   - Events are handled here.
//     - On events, ask model to change or ask view to update

const ANIMATION_TIME = 0.5;

class Tile {
    constructor(r, c, val) {
        // Center of top-left tile is (0, 0).
        // We store tiles using (row, col) notation, so (2, 1) would be row 2 col 1

        // We store two (r, c) positions - one for the start of anim, one for the end of anim.
        // We store a t in range [0, 1]. If t = 0, we're at start. If t = 1, we're at end.
        // As far as the game is concerned, the tile is always "at the end".

        // (r0, c0) is where the tile was at t=0
        this.r0 = r;
        this.c0 = c;

        // (r1, c1) is where the tile is at t=1
        // Once we set this to a value, from the puzzle's perspective (because the puzzle doesn't really animate),
        // this is where the tile is
        this.r1 = r;
        this.c1 = c;
        
        this.val = val;
        this.t = 1;  // ranges 0-1

        // if non-zero, when this tile reaches t = 1, set val = triggerNewVal
        this.triggerNewVal = 0; 

        // if true, when this tile reaches t = 1, remove it from tile list
        this.triggerDestroy = false;  
    }

    // Returns the current row, col position as a two-element array [r, c]
    // where if t = 0, we have [r0, c0], if t = 1, we have [r1, c1],
    // and we smoothly interpolate between these two points for intermediate
    // values of t.
    getPosition() {
        let vr = this.r1 - this.r0;
        let vc = this.c1 - this.c0;

        return [this.t * vr + this.r0, this.t * vc + this.c0]
    }

    
}

class Model {
    constructor() {
        this.initializeState();
    }
    
    initializeState() {
        this.counter = 0;
        this.board = [
            "....",
            "..#.",
            "#...",
            "...."
        ]

        this.score = 0;
        this.tiles = [
            new Tile(0, 0, 4),
            new Tile(0, 2, 8),
            new Tile(1, 0, 4),
            new Tile(3, 0, 32),
            new Tile(3, 1, 16)
        ];
    }

    addToCounter(n) {
        this.counter += n;
    }

    // Builds an r x c matrix consisting of numbers
    // 0 for empty
    // 1 for wall
    // 2, 4, 8, ... for tiles
    generateBoardMatrix() {
        let result = [];
        for (let i = 0; i < this.board.length; i++) {
            let newRow = [];
            for (let n = 0; n < this.board[i].length; n++) {
                if (this.board[i][n] == ".") {
                    newRow.push(0);
                } else if (this.board[i][n] == "#") {
                    newRow.push(1);
                } else {
                    throw new Error(`unknown character ${this.board[i][n]}`);
                }
            }
            result.push(newRow);
        }

        // go through the list of tiles and replace existing 0's and 1's in result
        // with the values of the tiles at the correct positions
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            const row = tile.r1;
            const val = tile.val;
            const col = tile.c1;
            result[row][col] = val;
        }

        return result;
    }

    generateTileReferenceMatrix() {
        let result = [];

        // fill result with nulls just as in generateBoardMatrix
        for (let i = 0; i < this.board.length; i++) {
            let newRow = [];
            for (let n = 0; n < this.board[i].length; n++) {
                newRow.push(null);
            }
            result.push(newRow);
        }
        // for every tile, change the (r1, c1) cell of result to point at that tile
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            const row = tile.r1;
            const col = tile.c1;
            result[row][col] = tile;
        }
        return result
    }


    // Adds delta to the .t of every tile on the board,
    // but makes sure that no tile's .t exceeds 1
    addTime(delta) {
        for (let i = 0; i < this.tiles.length; ) {
            const tile = this.tiles[i];
            tile.t = Math.min(1, tile.t + delta);

            if (tile.t >= 1 && tile.triggerDestroy) {
                this.tiles.splice(i, 1); // deletes tiles[i]
            }
            else if (tile.t >= 1 && tile.triggerNewVal > 0) {
                tile.val = tile.triggerNewVal;
                this.triggerNewVal = 0;
                i++;
            }
            else {
                i++;
            }
        }
    }

    moveLeft() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let r = 0; r < board.length; r++) {
            //     M = list of L.length 0's
            //     copy all 1's from L to M
            let M = [];
            for (let c = 0; c < board[r].length; c++) {
                M.push(board[r][c] === 1 ? 1 : 0);
            }

            let j = 0;
            let last_added = 0;
            let last_tile = null;
    
            for (let c = 0; c < board[r].length; c++) {
                if (board[r][c] == 1) {
                    j = c + 1;
                    last_added = 0;
                } else if (board[r][c] != 0) {
                    if (board[r][c] == last_added) {
                        M[j - 1] = board[r][c] * 2;
                        
                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].c1 = j - 1;
                        tiles[r][c].triggerDestroy = true;
                        last_tile.triggerNewVal = last_tile.val * 2;

                        last_added = 0;
                        last_tile = null;
                        tiles[r][c].t = 0;
                    } else {
                        M[j] = board[r][c];
                        last_added = board[r][c];
                        last_tile = tiles[r][c];

                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].c1 = j;
                        tiles[r][c].t = 0;
                        j++;
                    }
                }
            }
               
            console.log(M);
            // update actual tiles to match M
        }
        
    }

    moveRight() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let r = 0; r < board.length; r++) {
            //     M = list of L.length 0's
            //     copy all 1's from L to M
            let M = [];
            for (let c = 0; c < board[r].length; c++) {
                M.push(board[r][c] === 1 ? 1 : 0);
            }

            let j = board[r].length - 1;
            let last_added = 0;
            let last_tile = null;
    
            for (let c = board[r].length - 1; c >= 0; c--) {
                if (board[r][c] == 1) {
                    j = c - 1;
                    last_added = 0;
                } else if (board[r][c] != 0) {
                    if (board[r][c] == last_added) {
                        M[j + 1] = board[r][c] * 2;
                        
                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].c1 = j + 1;
                        tiles[r][c].triggerDestroy = true;
                        last_tile.triggerNewVal = last_tile.val * 2;

                        last_added = 0;
                        last_tile = null;
                        tiles[r][c].t = 0;
                    } else {
                        M[j] = board[r][c];
                        last_added = board[r][c];
                        last_tile = tiles[r][c];

                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].c1 = j;
                        tiles[r][c].t = 0;
                        j--;
                    }
                }
            }
               
            console.log(M);
            // update actual tiles to match M
        }
    }
    
    moveUp() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let c = 0; c < board[0].length; c++) {
            //     M = list of L.length 0's
            //     copy all 1's from L to M
            let M = [];
            for (let r = 0; r < board.length; r++) {
                M.push(board[r][c] === 1 ? 1 : 0);
            }

            let j = 0;
            let last_added = 0;
            let last_tile = null;
    
            for (let r = 0; r < board.length; r++) {
                if (board[r][c] == 1) {
                    j = r + 1;
                    last_added = 0;
                } else if (board[r][c] != 0) {
                    if (board[r][c] == last_added) {
                        M[j - 1] = board[r][c] * 2;
                        
                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].r1 = j - 1;
                        tiles[r][c].triggerDestroy = true;
                        last_tile.triggerNewVal = last_tile.val * 2;

                        last_added = 0;
                        last_tile = null;
                        tiles[r][c].t = 0;
                    } else {
                        M[j] = board[r][c];
                        last_added = board[r][c];
                        last_tile = tiles[r][c];

                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].r1 = j;
                        tiles[r][c].t = 0;
                        j++;
                    }
                }
            }
               
            console.log(M);
            // update actual tiles to match M
        }
    }

    moveDown() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let c = 0; c < board[0].length; c++) {
            //     M = list of L.length 0's
            //     copy all 1's from L to M
            let M = [];
            for (let r = 0; r < board.length; r++) {
                M.push(board[r][c] === 1 ? 1 : 0);
            }

            let j = board.length - 1;
            let last_added = 0;
            let last_tile = null;
    
            for (let r = board.length - 1; r >= 0; r--) {
                if (board[r][c] == 1) {
                    j = r - 1;
                    last_added = 0;
                } else if (board[r][c] != 0) {
                    if (board[r][c] == last_added) {
                        M[j + 1] = board[r][c] * 2;
                        
                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].r1 = j + 1;
                        tiles[r][c].triggerDestroy = true;
                        last_tile.triggerNewVal = last_tile.val * 2;

                        last_added = 0;
                        last_tile = null;
                        tiles[r][c].t = 0;
                    } else {
                        M[j] = board[r][c];
                        last_added = board[r][c];
                        last_tile = tiles[r][c];

                        tiles[r][c].r0 = tiles[r][c].r1;
                        tiles[r][c].c0 = tiles[r][c].c1;
                        tiles[r][c].r1 = j;
                        tiles[r][c].t = 0;
                        j--;
                    }
                }
            }
               
            console.log(M);
            // update actual tiles to match M
        }
    }
}

class View {
    constructor(controller) {
        this.controller = controller;
        this.counter = document.getElementById("counter");
        this.canvas = document.getElementById("canvas");

        document.addEventListener("keydown", (event) => {
            let key = event.key;
            controller.onKey(key);
            console.log(event);
        });

        // This will be called 60x/second
        requestAnimationFrame((msElapsed) => {
            // msElapsed is time since last call to requestAnimationFrame
            this.tick(msElapsed);
        });
    }

    // Calculates the (x, y) coordinates corresponding to 
    // a (row, col) coordinate on the board. The row and col can be
    // fractional (so it's fine to be at, say, row 0.2.) 
    // This mapping places the board dead center in the middle
    // of the canvas and ensures that if the board is not square
    // there is padding on the left and right or top and bottom
    // so that the board is in the middle. It also scales the board
    // up to take up as much of the canvas as possible.
    getBoardCanvasMapping(model, row, col) {
        let size = this.canvas.width;
        let rows = model.board.length;
        let cols = model.board[0].length;

        // see miro whiteboard
        let h, k, s;
        if (rows > cols) {
            s = size / rows;
            h = s * (rows - cols) / 2;
            k = 0;
        } else {
            s = size / cols;
            h = 0;
            k = s * (cols - rows) / 2;
        }

        return [
            h + s * col, k + s * row
        ];
    }

    render(model) {
        this.renderCounter(model.counter);
        this.renderCanvas(model);

        for (let tiles = 0; tiles < model.tiles.length; tiles++) {
            this.renderTile(model, model.tiles[tiles]);
        }
    }

    renderCounter(n) {
        this.counter.innerHTML = n;
    }

    renderCanvas(model) {
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 500, 500);

        // Draw a small black rect at (counter % 500, 0)
        ctx.fillStyle = "#000000";
        ctx.fillRect(model.counter % 500, 0, 10, 20);

        for (let row = 0; row < model.board.length; row++) {
            for (let col = 0; col < model.board[0].length; col++) {
                let [x0, y0] = this.getBoardCanvasMapping(model, row, col);
                let [x1, y1] = this.getBoardCanvasMapping(model, row+1, col+1);

                if (model.board[row][col] === '.') {
                    ctx.fillStyle = '#ccc';
                } else {
                    ctx.fillStyle = '#555';
                }

                ctx.fillRect(x0, y0, x1-x0, y1-y0);
            }
        }
    }

    // Draw [tile] on the canvas at its current (r, c) position (use the tile's .t)
    // and use the value of the tile to draw its number centered in the middle 
    // of the tile
    renderTile(model, tile) {
        var ctx = this.canvas.getContext("2d");
        ctx.fillStyle = "#000000";
        let [r, c] = tile.getPosition();
        let [x, y] = this.getBoardCanvasMapping(model, r, c);
        let [x2, y2] = this.getBoardCanvasMapping(model, r + 1, c + 1);
        ctx.fillRect(x, y, x2 - x, y2 - y);

        // ctx.measureText('Hello') -> measure
        // measure.width   pixel width of the text

        // ctx.font = `${fontsize}px Arial`
        ctx.fillStyle = "#ffffff";
        let width = x2 - x;
        let height = y2 - y;
        let fontsize = 16;
        ctx.font = `${fontsize}px Arial`;
        let size = ctx.measureText(tile.val);
        let x3 = ((width - size.width) / 2) + x;
        let y3 = ((height + fontsize) / 2) + y;
        ctx.fillText(tile.val, x3, y3);
    }

    tick(msElapsed) {
        this.controller.onTick(msElapsed);

        requestAnimationFrame((msElapsed) => {
            this.tick(msElapsed);
        });
    }
}

class Controller {
    constructor() {
        this.view = new View(this);
        this.model = new Model();
        this.previousTick = 0;
    }

    onKey(key) {
        if (key == 'ArrowDown') {
            //this.model.addToCounter(-100);
            this.model.moveDown();
        } else if (key == 'ArrowUp') {
            //this.model.addToCounter(100);
            this.model.moveUp();
            console.log(this.model.tiles);
        } else if (key == 'ArrowLeft') {
            this.model.moveLeft();
        } else if (key == 'ArrowRight') {
            this.model.moveRight();
        }
    }

    // Gets called roughly 60x/sec
    // msElapsed is time since we started the webpage
    onTick(msElapsed) {
        let msDelta = msElapsed - this.previousTick;
        this.previousTick = msElapsed;

        this.model.addToCounter(1);
        this.model.addTime(msDelta / 1000 * 4.5);

        this.view.render(this.model);
    }
}

/* reality:
        t1 = a slip of paper, "addr 1000"
    t2 = a slip of paper, "addr 1001"
        ta = [1000, 0, 0, 1001, 0, 1000]

        1000: Tile(1, 2, 2048)
        1001: Tile(2, 3, 64)

        let t1 = new Tile(1, 2, 2048);
        let t2 = new Tile(2, 3, 64);
        let ta = [t1, null, null, t2, null, t1];
        console.log(ta);

        t1.val = 4096;
        console.log(ta);
*/

const CONTROLLER = new Controller();