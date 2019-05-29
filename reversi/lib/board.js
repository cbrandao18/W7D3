let Piece = require("./piece");

/**
 * Returns a 2D array (8 by 8) with two black pieces at [3, 4] and [4, 3]
 * and two white pieces at [3, 3] and [4, 4]
 */
function _makeGrid () {
  const grid = [];
  for (let i=0; i<8; i++){
    row = new Array(8);
    grid.push(row);
  }

  grid[3][4] = new Piece("black");
  grid[4][3] = new Piece("black");
  grid[3][3] = new Piece("white");
  grid[4][4] = new Piece("white");

  return grid;
}


/**
 * Constructs a Board with a starting grid set up.
 */
function Board () {
  this.grid = _makeGrid();
}

Board.DIRS = [
  [ 0,  1], [ 1,  1], [ 1,  0],
  [ 1, -1], [ 0, -1], [-1, -1],
  [-1,  0], [-1,  1]
];

/**
 * Returns the piece at a given [x, y] position,
 * throwing an Error if the position is invalid.
 */
Board.prototype.getPiece = function (pos) {
  if (!this.isValidPos(pos)){
    throw new Error("invalid move!");
  } else {
    let x = pos[0];
    let y = pos[1];
    return this.grid[x][y];
  }
};

/**
 * Checks if there are any valid moves for the given color.
 */
Board.prototype.hasMove = function (color) {
  if (this.validMoves(color).length === 0) {
    return false;
  }
  return true;
};

/**
 * Checks if the piece at a given position
 * matches a given color.
 */
Board.prototype.isMine = function (pos, color) {
  return this.getPiece(pos) && this.getPiece(pos).color === color;
};

/**
 * Checks if a given position has a piece on it.
 */
Board.prototype.isOccupied = function (pos) {
  return !(this.getPiece(pos) === undefined);
};

/**
 * Checks if both the white player and
 * the black player are out of moves.
 */
Board.prototype.isOver = function () {
  if ((this.hasMove("white") === false) && (this.hasMove("black") === false)) {
    return true;
  }
  return false;
};

/**
 * Checks if a given position is on the Board.
 */
Board.prototype.isValidPos = function (pos) {
  return (pos[0] >= 0 && pos[0] < 8) && (pos[1] >= 0 && pos[1] < 8);[]
}; 

/**
 * Recursively follows a direction away from a starting position, adding each
 * piece of the opposite color until hitting another piece of the current color.
 * It then returns an array of all pieces between the starting position and
 * ending position.
 *
 * Returns null if it reaches the end of the board before finding another piece
 * of the same color.
 *
 * Returns null if it hits an empty position.
 *
 * Returns null if no pieces of the opposite color are found.
 */
Board.prototype.positionsToFlip = function(board, pos, color, dir, piecesToFlip) {
    if (!piecesToFlip){
      piecesToFlip = [];
    } else {
      piecesToFlip.push(pos);
    }

    let nextX = pos[0] + dir[0];
    let nextY = pos[1] + dir[1];
    let nextPos = [nextX, nextY];

    if (!board.isValidPos(nextPos)){ //checks if it's off the board
      return null;
    } else if (!board.isOccupied(nextPos)){ //checks if it's an empty space
      return null;
    } else if (board.isMine(nextPos, color)){ //check if its the current players color
      return piecesToFlip.length === 0 ? null : piecesToFlip;
    } else { //check if its the opponents color 
      return this.positionsToFlip(board, nextPos, color, dir, piecesToFlip); // recursive call
    }
}



/**
 * Adds a new piece of the given color to the given position, flipping the
 * color of any pieces that are eligible for flipping.
 *
 * Throws an error if the position represents an invalid move.
 */
Board.prototype.placePiece = function (pos, color) {
    // Throws an error if the position represents an invalid move.
    if (!this.validMove(pos, color)){
      throw new Error("Not a valid move!");
    }

    // flip the color of any pieces that are eligible for flipping.
    let posToFlip = [];
    for (let i = 0; i < Board.DIRS.length; i++) {
      let posToAdd = this.positionsToFlip(this, pos, color, Board.DIRS[i]);
      if (posToAdd){
        posToFlip = posToFlip.concat(posToAdd);
      }
    }
    
    for (let j = 0; j < posToFlip.length; j++){
      let piece = this.getPiece(posToFlip[j]);
      piece.flip();
    }

    // Adds a new piece of the given color to the given position
    let x = pos[0];
    let y = pos[1];
    this.grid[x][y] = new Piece(color);
};

/**
 * Prints a string representation of the Board to the console.
 */
Board.prototype.print = function () {
  for (let i = 0; i < 8; i++) {
    let rowOutput = `${i}:`;
    for (let k = 0; k < 8; k++) {
      let pos = [i, k];
      rowOutput += (this.getPiece(pos) ? " " + this.getPiece([i, k]).toString() + " " : " _ ");
    }
    console.log(rowOutput)
  }
};

/**
 * Checks that a position is not already occupied and that the color
 * taking the position will result in some pieces of the opposite
 * color being flipped.
 */
Board.prototype.validMove = function (pos, color) {
  if (this.isOccupied(pos)){
    return false;
  } 

  // calls _positionsToFlip 
  // if it returns an empty array, return false bc its not valid
  // otherwise, return true

  for (let i = 0; i < Board.DIRS.length; i++){
    let piecesToFlip = this.positionsToFlip(this, pos, color, Board.DIRS[i]);
    if (piecesToFlip){
      return true;
    }
  }
  return false;

};

/**
 * Produces an array of all valid positions on
 * the Board for a given color.
 */
Board.prototype.validMoves = function (color) {
  let movesList = [];

  for (let i = 0; i < 8; i++) {
    for (let k = 0; k < 8; k++) {
      let pos = [i, k]
      if (this.validMove(pos, color)) {
        movesList.push(pos);
      }
    }
  }
  return movesList;
};

module.exports = Board;