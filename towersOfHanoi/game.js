const readline = require("readline");

function _makeBoard (){
    return [ [1,2,3],[],[] ];    
}

function Game(){
    this.towers = _makeBoard();
}

Game.prototype.run = function (overCallback){
    if (this.isWon()){
        console.log("The game is over!");
        overCallback();
    } else {
        this.promptMove(this.run.bind(this, overCallback));
    }
}

Game.prototype.print = function(){
    console.log(this.towers);
}

// Dreaded global state!
let reader;

Game.prototype.play = function(){
    reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    this.run(function(){
        reader.close();
        reader = null;
    });
};

Game.prototype.promptMove = function(callback) {
    this.print();
    reader.question("What is your move?", handleResponse.bind(this));

    function handleResponse(move){
        // checks if its a valid move
        // makes their move on the tower
        // prompt again for their next move
        const pos = JSON.parse(move);
        let startTowerIdx = pos[0];
        let endTowerIdx = pos[1];

        if (!this.isValidMove(startTowerIdx, endTowerIdx)) {
            console.log("Invalid move!");
            this.promptMove(callback);
            return;
        }

        this.move(startTowerIdx, endTowerIdx);
        callback();
    }
}

Game.prototype.isValidTower = function (towerIndex){
    return (towerIndex >= 0 && towerIndex < 3);
}

Game.prototype.isValidMove = function(startTowerIdx, endTowerIdx) {
    if (this.isValidTower(startTowerIdx) && this.isValidTower(endTowerIdx)){
        if (this.towers[startTowerIdx].length > 0) { //check if start tower has any discs to pull
            if (this.towers[endTowerIdx].length === 0) { //check if any discs are in the end tower
                return true; //if there aren't, then we can move the disc there
            } else if (this.towers[startTowerIdx][0] < this.towers[endTowerIdx][0]) {
                //if there are, then if the disc we're moving has to be less than the top-most disc in the end tower
                return true;
            }
        } 
    }
    return false;
}

Game.prototype.move = function(startTowerIdx, endTowerIdx) {
    if (this.isValidMove(startTowerIdx, endTowerIdx)) {
        let ele = this.towers[startTowerIdx].shift();
        this.towers[endTowerIdx].unshift(ele);
    } else {
        throw new Error("Not a valid move");
    }
}

Game.prototype.isWon = function() {
    return this.towers[0].length === 0 && (this.towers[1].length === 0 || this.towers[2].length === 0);
}


g = new Game();
g.play();