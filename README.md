# 2048-puzzle
This repo houses a coding project for a reverse version of the popular game 2048, where the goal is to combine all the tiles into one tile instead of reaching the number 2048. This game also includes walls that prevent the user from moving the tiles through them. The code is written in JavaScript.

# Reading the Code
Almost everything is in 2048.JS. Here's how I have it organized:
- Functions that take in matrices and edit their contents are defined. These are
    used to edit the game board.
- The class `Tile` is used to create tiles on the board. 
- MVC is used to render the tiles on the board and animate them.