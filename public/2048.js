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

}


function newFinalState(rows, cols, lastTile) {
    let finalState = [];
    let numWalls = Math.floor(Math.random() * (5));
    let wallRows = [];
    let wallCols = [];

    let choice = Math.floor(Math.random() * (5 - 1) + 1);
    let lastTileRow = 0;
    let lastTileCol = 0;
    if (choice == 1) {
        lastTileRow = Math.floor(Math.random() * (rows));
        lastTileCol = 0;
    } else if (choice == 2) {
        lastTileRow = Math.floor(Math.random() * (rows));
        lastTileCol = cols - 1;
    } else if (choice == 3) {
        lastTileRow = 0;
        lastTileCol = Math.floor(Math.random() * (cols));
    } else {
        lastTileRow = rows - 1;
        lastTileCol = Math.floor(Math.random() * (cols));
    }

    for (let i = 0; i < numWalls; i++) {
        wallRows.push(Math.floor(Math.random() * (rows - 2) + 1));
        wallCols.push(Math.floor(Math.random() * (cols - 2) + 1));
    }
    for (let r = 0; r < rows; r++) {
        let row = [];
        for (let c = 0; c < cols; c++) {
            row.push(0);
        }
        finalState.push(row);
    }
    for (let i = 0; i < numWalls; i++) {
        finalState[wallRows[i]][wallCols[i]] = 1;
    }
    finalState[lastTileRow][lastTileCol] = lastTile;
    return finalState;
}

// Returns true if m1 and m2 have the same size and contain all the same numbers
function matricesEqual(m1, m2) {
    if (m1.length == m2.length && m1[0].length == m2[0].length) {
        for (let r = 0; r < m1.length; r++) {
            for (let c = 0; c < m1[r].length; c++) {
                if (m1[r][c] != m2[r][c]) {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
}

// Makes a totally new matrix with the same row, col dimensions as m,
// and fill it with all the values from m.
function copyMatrix(m) {
    let copy = [];
    for (let r = 0; r < m.length; r++) {
        let row = [];
        for (let c = 0; c < m[r].length; c++) {
            row.push(m[r][c]);
        }
        copy.push(row);
    }
    return copy;
}

// Directions specified as [row, col] changes
const DIRECTIONS = [
    [-1, 0],  
    [1, 0],
    [0, -1],
    [0, 1]
];

// If given a direction that is up/down, returns a direction to the right.
// If given a direction that is left/right, returns a directon toward the bottom (down).
function getPerpendicularDirection(direction) {
    if (direction[1] == 0) {
        return [0, 1];
    } else {
        return [-1, 0];
    }
}

function collectAxis(matrix, start, direction) {
    let positions = [];
    let sr = start[0], sc = start[1];
    while (sr < matrix.length && sc < matrix[0].length) {
        positions.push(start);
        sr += direction[0];
        sc += direction[1];
    }
    return positions;
}

// gets list of horizontal segments

function getHorizontalSegments(matrix) {

    let allSegments = []
    for (let r = 0; r < matrix.length; r++) {
        let c = 0;
        while (c < matrix[r].length) {
            if (matrix[r][c] == 1) {
                c++;
            } else {
                let c2 = c;
                while (c2 < matrix[r].length) {
                    if (matrix[r][c2] == 1) {
                        break;
                    }
                    c2++;
                }
                allSegments.push([[r, c], [r, c2 - 1]]);
                c = c2 + 1;
            }
        }
    }
    return allSegments;
}

// gets list of vertical segments
function getVerticalSegments() {
    let allSegments = [];
    for (let c = 0; c < matrix[0].length; c++) {
        let r = 0;
        while (r < matrix.length) {
            if (matrix[r][c] == 1) {
                r++;
            } else {
                let r2 = r;
                while (r2 < matrix.length) {
                    if (matrix[r2][c] == 1) {
                        break;
                    }
                    r2++;
                }
                allSegments.push([[r, c], [r2 - 1, c]]);
                r = r2 + 1;
            }
        }
    }
    return allSegments;
}


// Given a list of lists [l1, l2, l3, ...], 
// returns a new list consisting of every possible list where
// the first element is taken from l1, the second from l2, and so on.

function possibleNewLists(l) {
    let lists = [];
    let num = [];
    let zeroes = [];
    for (let i = 0; i < l.length; i++) {
        num.push(l[i].length - 1);
    }
    for (let i = 0; i < num.length; i++) {
        zeroes.push(0);
    }
    let total = 1;
    for (let i = 0; i < l.length; i++) {
        total *= l[i].length;
    }

    while (lists.length < total) {
        console.log(zeroes);
        
        // pushes the current position onto the results list
        let newList = [];
        for (let i = 0; i < l.length; i++) {
            newList.push(l[i][zeroes[i]]);
        }
        lists.push(newList);

        // steps the position forward
        let n = zeroes.length - 1;
        while (n >= 0) {
            if (zeroes[n] < l[n].length - 1) {
                zeroes[n]++;
                for (let n2 = n + 1; n2 < zeroes.length; n2++) {
                    zeroes[n2] = 0;
                }
                break;
            } else {
                n--;
            }
        }
        
    }

    return lists; 
}

// Returns true if the segment (a contiguous region of 0's and 2-4-8-16
// tiles) could have arisen as the result of the player shifting all the tiles
// to the left/top (the low indices).

function noTiles(segment) {
    for (let i = 0; i < segment.length; i++) {
        if (segment[i] != 0 && segment[i] != 1) {
            return false;
        }
    }
    return true;
}

function allTiles(segment) {
    for (let i = 0; i < segment.length; i++) {
        if (segment[i] == 0) {
            return false;
        }
    }
    return true;
}

function couldHaveBeenShiftLow(segment) {
    if (noTiles(segment)) {
        return true;
    } else if (allTiles(segment)) {
        return true;
    } else if (segment[0] == 0) {
        return false;
    }
    
    let result = true;
    let n = 0;
    for (let i = 0; i < segment.length; i++) {
        if (segment[i] == 0) {
            n = i;
            break;
        }
    }
    for (let i = n + 1; i < segment.length; i++) {
        if (segment[i] != 0 && segment[i] != 1) {
            result = false;
            break;
        }
    }
    
    return result;
}

function pushTiles(matrix, direction) {
    const [dr, dc] = direction;

    // if dr == 0, moves left and right (the column is changing)
    // if dc == 0, moves up and down (the row is changing)
    const perp_dr = (dr == 0 ? 1 : 0);
    const perp_dc = (dc == 0 ? 1 : 0);
    
}



const ANIMATION_TIME = 0.5;

class Tile {
    constructor(r, c, val) {
        // Center of top-left tile is (0, 0).
        // Store tiles using (row, col) notation, so (2, 1) would be row 2 col 1

        // Store two (r, c) positions - one for the start of anim, one for the end of anim.
        // Store a t in range [0, 1]. If t = 0, we're at start. If t = 1, we're at end.
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

        // if non-zero, when this tile reaches t = 1, sets val = triggerNewVal
        this.triggerNewVal = 0; 

        // if true, when this tile reaches t = 1, removes it from tile list
        this.triggerDestroy = false;  
    }

    // Returns the current row, col position as a two-element array [r, c]
    // where if t = 0, we have [r0, c0], if t = 1, we have [r1, c1],
    // and we smoothly interpolate between these two points for intermediate
    // values of t.
    getPosition() {
        let vr = this.r1 - this.r0;
        let vc = this.c1 - this.c0;


        return [
            this.r0 + (-1 * vr) * ((Math.cos(Math.PI * this.t) - 1) / 2),
            this.c0 + (-1 * vc) * ((Math.cos(Math.PI * this.t) - 1) / 2)
        ]
    }

    
}

// n is a power of 2
// decomposes n into a randomly selected set of other smaller powers of 2 that all add up to n
function decomposeTotal(n, splitProb = 1.1) {
    if (n > 2 & Math.random() < splitProb) {
        let result = decomposeTotal(n / 2, splitProb - 0.15);
        for (let item of decomposeTotal(n / 2, splitProb - 0.15)) {
            result.push(item);
        }
        return result;
    } else {
        return [n];
    }
}

function newRandomBoard() {
    let tileNumbers = decomposeTotal(2 ** (Math.floor(Math.random() * (9 - 7) + 7)));

    let tiles = [];
    let board = [];
    let numberOfWalls = 4;
    let side = 4;
    while (tileNumbers.length > 0.7 * side * side) {
        side++;
    }

    for (let r = 0; r < side; r++) {
        let row = "";
        for (let c = 0; c < side; c++) {
            let random = Math.floor(Math.random() * 5);
            if (random == 1 && numberOfWalls > 0) {
                row += '#';
                numberOfWalls--;
            } else { 
                row += '.';
            }
        }
        board.push(row);
    }
    console.log(board);
    for (let i = 0; i < tileNumbers.length; i++) {
        let cycles = 0;
        while (cycles < 100000) {
            // generates a random placement (r, c)
            // if it's available, places the tile there and break
            // if it's not, keeps looping
            let r = (Math.floor(Math.random() * side));
            let c = (Math.floor(Math.random() * side));
            if (isEmpty(r, c, tiles, board)) {
                tiles.push(new Tile(r, c, tileNumbers[i]));
                break;
            }
            cycles++;
        }

        if (cycles >= 100000) {
            console.log(`Infinite loop detected for i=${i} in newRandomBoard`);
            console.log(board);
            console.log(tiles);
            break;
        }
    }

    return {
        tiles: tiles,
        board: board
    }
}

function isEmpty(r, c, tiles, board) {
    for (let i = 0; i < tiles.length; i++) {
        if ((tiles[i].r1 == r && tiles[i].c1 == c) || board[r][c] == '#') {
            return false;
        }
    }
    return true;
}

class Model {
    constructor() {
        this.initializeState();
    }
    
    initializeState() {
        this.counter = 0;
        let createdBoard = newRandomBoard();
        this.board = createdBoard.board;

        this.score = 0;
        this.tiles = createdBoard.tiles;
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

        // goes through the list of tiles and replace existing 0's and 1's in result
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
        // for every tile, changes the (r1, c1) cell of result to point at that tile
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
        }
        
    }

    moveRight() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let r = 0; r < board.length; r++) {
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
        }
    }
    
    moveUp() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let c = 0; c < board[0].length; c++) {
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
        }
    }

    moveDown() {
        let board = this.generateBoardMatrix();
        let tiles = this.generateTileReferenceMatrix();
        
        for (let c = 0; c < board[0].length; c++) {
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
        //this.renderCounter(model.counter);
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

    // Draws [tile] on the canvas at its current (r, c) position (use the tile's .t)
    // and uses the value of the tile to draw its number centered in the middle 
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

        /* if (tile.val >= 128 && model.board.length >= 6) {
            fontsize = 38;
        } else if (tile.val >= 128) {
            fontsize = 50;
        }*/ 
        let tileWidth = 500 / model.board.length;
        let fontsize = 0.7 * tileWidth;
        let size;
        while (true) {
            ctx.font = `${fontsize}px Arial`;
            size = ctx.measureText(tile.val);
            //console.log("Font size for \"" + tile.val + "\" is " + size);
            
            if (size.width > 0.7 * tileWidth) {
                fontsize *= 0.95;
            } else {
                break;
            }
        }
        
        let x3 = ((width - size.width) / 2) + x;
        let actualHeight = size.actualBoundingBoxAscent + size.actualBoundingBoxDescent;
        let y3 = ((height + fontsize * 0.7) / 2) + y;
        console.log(actualHeight);
        //console.log(`(x3,y3)=(${x3},${y3}) for w,h ${width},${height} s.w,s.h ${size.width},${size.height} x,y ${x},${y} tileWidth ${tileWidth} font ${ctx.font}`)
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

const CONTROLLER = new Controller();
