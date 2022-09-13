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

//////////////////////////////////////////////////////////////////////////////////////
// Puzzle Generation

// A *board matrix*, or board, consists of a 2D array of numbers
// 0 means "empty", 1 means "wall", 2+ means "tile with that value"
// The goal of this code is to generate interesting board matrices to solve

// This function generates a fresh "final" board state (solution state)
// with maybe some walls (maybe not) and a single tile with a larger
// value on it. This is the state that we want the user to get
// the board into in order to "win"
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

// Return true if m1 and m2 have the same size and contain all the same numbers
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

// Make a totally new matrix with the same row, col dimensions as m,
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
    [-1, 0],   // To go "forward", subtract 1 from row and do nothing to column
    [1, 0],
    [0, -1],
    [0, 1]
];

// If given a direction that is up/down, return a direction to the right.
// If given a direction that is left/right, return a directon toward the bottom (down).
function getPerpendicularDirection(direction) {
    if (direction[1] == 0) {
        return [0, 1];
    } else {
        return [-1, 0];
    }
}

// Given that start is [r, c] and direction is [dr, dc], return the array
// consisting of every entry in matrix starting at [r, c] and stepping in the [dr, dc]
// direction until you reach the end. For instance, if matrix has 4 rows and 3 cols,
// and start = [1, 0] and direction is [0, 1], this returns positions
// [1,0], [1,1], [1, 2], and [1,3] in a 4-element list.
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

// get list of horizontal segments
// what if the wall is on the far left or far right of the row?

/*
    to get segments for one row:

        c = 0
        while (c < total number of cols) {
            if (mat[r,c] is wall) {
                c++;
            } else {
                c2 = c;
                step c2 to the right until it's adjacent to either a wall
                    or the end of the board (so push c2 to the last empty
                    board position you can)
                append [[r, c], [r, c2]] to the list
                c = c2 + 1;
            }
        }
*/

// page = header
// for each item:
//     page += item
//     if we should page break:
//         page ++ footer
//         output page
//         page = header
// page += footer
// output page
function getHorizontalSegments(matrix) {
    // let allSegments = [];
    // for (let r = 0; r < matrix.length; r++) {
    //     let segment = [];
    //     let start = [r, 0];
    //     let end = [];
    //     segment.push(start);
    //     for (let c = 0; c < matrix[r].length; c++) {
    //         if (matrix[r][c] == 1) {
    //             end = [r, c - 1];
    //             segment.push(end);
    //             allSegments.push(segment);
    //             // start = [r, c + 1];
    //             // segment = [];
    //             // segment.push(start);
    //         } else {
    //             end = [r, c];
    //         }
    //     }
    //     segment.push(end);
    //     allSegments.push(segment);
    // }
    // return allSegments;

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

// get list of vertical segments
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
// return a new list consisting of every possible list where
// the first element is taken from l1, the second from l2, and so on.
// For instance, if we pass in [[1, 2, 3], [a, b], [7, 6]],
// we get [[1, a, 7], [1, a, 6], [1, b, 7], [1, b, 6], [2, a, 7], ..., [3, b, 6]].
//          0   0   0   0 0 1      0 1 0     0 1 1       1 0 0
// 000, 001, 010, 011, 100, 101, 110, 111, 200, 201, 210, 211
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
        
        // push the current position onto the results list
        let newList = [];
        for (let i = 0; i < l.length; i++) {
            newList.push(l[i][zeroes[i]]);
        }
        lists.push(newList);

        // step the position forward
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
//
// Don't worry (yet) about situations like [4, 4, 4] where technically the
// user couldn't have pressed left to get this because the 4's would have combined
// Just call this a "yes" and move on
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
    
    // We know the seg[0] position is NOT 0
    // Step to the right until you encounter a 0
    // Remember that index. Every index AFTER that should be 0
    let result = true;
    let n = 0;
    //while (n < segment.length && segment[i] != 0)
    //    n++;
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

// 1. For the horizontal and vertical directions, repeat all of the following.
// 2. Decompose the board into segments. Call this list S.
// 3. For each segment s in S, determine whether the situation could have
//    arisen as the result of a left, right, up, or down action.
// 4. If *all* of the segments in S could have arisen as the result of a
//    action of type a (say a is left, right, up, or down), then:
// 5. Compute the past states for each segment s in S which could have led 
//    to the current condition via action a. Call these p(s), and the set of all
//    p(s) is P.
// 6. Use possibleNewLists to select every possible combination of
//    items from P. Every one of these is a new board we could explore
//    backwards into.

// Push all the tiles as far as possible to the `direction` direction,
// where direction is a [dr, dc] pair in {[-1, 0], [1, 0], [0, -1], [0, 1]}
function pushTiles(matrix, direction) {
    // adapt the moveLeft, etc. code to take in a direction which has
    // a dr and dc pair.
    const [dr, dc] = direction;

    // if dr == 0, we're moving left and right (the column is changing)
    // if dc == 0, we're moving up and down (the row is changing)
    const perp_dr = (dr == 0 ? 1 : 0);
    const perp_dc = (dc == 0 ? 1 : 0);
    
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