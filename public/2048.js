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
            ".#....",
            "...##.",
            "......",
            "#.....",
            "......",
            "...##.",
            "......",
            "#.....",
            "......"
        ];

        this.score = 0;
        this.tiles = [
            new Tile(2, 3, 4),
            new Tile(3, 4, 64)
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
            this.model.addToCounter(-100);
        } else if (key == 'ArrowUp') {
            this.model.addToCounter(100);
        }
    }

    // Gets called roughly 60x/sec
    // msElapsed is time since we started the webpage
    onTick(msElapsed) {
        let msDelta = msElapsed - this.previousTick;
        this.previousTick = msElapsed;

        this.model.addToCounter(1);

        this.view.render(this.model);
    }
}

const CONTROLLER = new Controller();