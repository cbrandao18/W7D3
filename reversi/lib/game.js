const readline = require("readline");
const Piece = require("./piece.js");
const Board = require("./board.js");

/**
 * Sets up the game with a board and the first player to play a turn.
 */
function Game () {
  this.board = new Board();
  this.turn = "black";
};

/**
 * Flips the current turn to the opposite color.
 */
Game.prototype._flipTurn = function () {
  this.turn = (this.turn == "black") ? "white" : "black";
};

// Dreaded global state!
let rlInterface;

/**
 * Creates a readline interface and starts the run loop.
 */
Game.prototype.play = function () {
  rlInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  this.runLoop(function () {
    rlInterface.close();
    rlInterface = null;
  });
};

/**
 * Gets the next move from the current player and
 * attempts to make the play.
 */
Game.prototype.playTurn = function (callback) {
  this.board.print();
  rlInterface.question(
    `${this.turn}, where do you want to move?`,
    handleResponse.bind(this)
  );

  function handleResponse(answer) {
    const pos = JSON.parse(answer);
    if (!this.board.validMove(pos, this.turn)) {
      console.log("Invalid move!");
      this.playTurn(callback);
      return;
    }

    this.board.placePiece(pos, this.turn);
    this._flipTurn();
    callback();
  }
};


/**
 * Evaluates all the possible moves to make and from that, makes the move that
 * will produce the most flipped pieces.
 */
Game.prototype.AITurn = function (callback){
  // this.board.print();

  let highestScore = 0;
  let highestScorePos;

  // iterate over our moveList
  // loop through our Board.DIRS
  // call _positionsToFlip with that move and direction
  // check if it returns more positions to flip than our current highest
  // if so, then replace our highest score and highest score pos
  
  let moveList = this.board.validMoves("white");
  
  for (let i = 0; i < moveList.length; i++) {
    for (let j = 0; j < Board.DIRS.length; j++) {
      let flipPieces = this.board.positionsToFlip(this.board, moveList[i], "white", Board.DIRS[j]);
      if (flipPieces && flipPieces.length > highestScore) {
        highestScore = flipPieces.length;
        highestScorePos = moveList[i];
      }
    }
  }

  this.board.placePiece(highestScorePos, "white");
  console.log(`Computer player moved to ${highestScorePos}`);
  this._flipTurn();
  callback();
};


/**
 * Continues game play, switching turns, until the game is over.
 */
Game.prototype.runLoop = function (overCallback) {
  if (this.board.isOver()) {
    console.log("The game is over!");
    overCallback();
  } else if (!this.board.hasMove(this.turn)) {
    console.log(`${this.turn} has no move!`);
    this._flipTurn();
    this.runLoop();
  } else if (this.turn === "black"){
    this.playTurn(this.runLoop.bind(this, overCallback));
  } else {
    this.AITurn(this.runLoop.bind(this, overCallback));
  }
};

module.exports = Game;
