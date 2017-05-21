var Settings = {
  _blockSize: 45,
  _arenaSize: { w: 10, h: 20 },

  _arenaColor: '#1c3134',
  _pieceColor: '#eee4da',
  _pieceFontColor: '#776e65',
  _gridColor: '#18494d',
  _bodyColor: '#ааа'
};

document.querySelector('body').style.backgroundColor = Settings._bodyColor;

var canvas = document.getElementById('tentris');

canvas.height = document.body.clientHeight - (document.body.clientHeight / 100 * 10);
canvas.width = canvas.height / 2;

Settings._blockSize = canvas.width / Settings._arenaSize.w;

var context = canvas.getContext('2d');

var Pieces = {
  _types: {
    T: {
      type: 'T',
      piecesColor: 'red',
      matrix: [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ]
    },

    O: {
      type: 'O',
      piecesColor: 'aqua',
      matrix: [
        [1, 1],
        [1, 1]
      ]
    },

    L: {
      type: 'L',
      piecesColor: 'orange',
      matrix: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ]
    },

    J: {
      type: 'J',
      piecesColor: 'blue',
      matrix: [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ]
    },

    I: {
      type: 'I',
      piecesColor: 'gold',
      matrix: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    },

    S: {
      type: 'S',
      piecesColor: 'silver',
      matrix: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ]
    },

    Z: {
      type: 'Z',
      piecesColor: 'yellow',
      matrix: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ]
    }
  },

  create: function(type) {
    var piece = null;

    if(type) {
      piece = Pieces._types[type];
    } else {
      var count = 0;

      for(var p in Pieces._types) {
        if(Math.random() < 1 / ++count) {
          piece = Pieces._types[p];
        }
      }
    }

    piece.matrix = Pieces.fillNumbers(piece.matrix);

    return piece;
  },

  fillNumbers: function(matrix) {
    matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if(value) {
          matrix[y][x] = Math.floor(Math.random() * (9 - 1 + 1)) + 1;
        }
      });
    });

    return matrix;
  },

  getColorByNumber: function(num) {
    switch(num) {
      case 1:
        return '#d3eb73';
      case 2:
        return '#d6d36a';
      case 3:
        return '#d9bb63';
      case 4:
        return '#dca35c';
      case 5:
        return '#de8b55';
      case 6:
        return '#e3734e';
      case 7:
        return '#e65b48';
      case 8:
        return '#e84341';
      case 9:
        return '#bf3f3c';
      case 10:
        return '#963b3a';
    }
  }
};

var Player = {
  position: { x: 0, y: 0 },
  piece: null,

  _level: 1,

  reset: function() {
    Player.piece = Pieces.create();
    Player.position.y = 0;
    Player.position.x = Math.floor(Arena.matrix[0].length / 2) - Math.floor(Player.piece.matrix[0].length / 2);
  },

  dropDown: function() {
    Player.position.y++;

    if(Game.collide()) {
      Player.position.y--;

      Game.merge();
      Player.reset();

      Game.sweepLines();
    }

    Game._dropCounter = 0;
  },

  move: function(direction) {
    Player.position.x += direction;

    if(Game.collide()) {
      Player.position.x -= direction;
    }
  },

  rotate: function(direction) {
    for(var y = 0; y < Player.piece.matrix.length; y++) {
      for(var x = 0; x < y; x++) {
        [
          Player.piece.matrix[x][y],
          Player.piece.matrix[y][x]
        ] = [
          Player.piece.matrix[y][x],
          Player.piece.matrix[x][y]
        ];
      }
    }

    if(direction > 0) {
      Player.piece.matrix.forEach(function(row) {
        row.reverse();
      });
    } else {
      Player.piece.matrix.reverse();
    }
  }
};

var Game = {
  _lastTime: 0,
  _dropCounter: 0,
  _dropInterval: 500,

  start: function() {
    Game.update();
  },

  draw: function() {
    // CLEAR CANVAS
    context.fillStyle = Settings._arenaColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // DRAW ARENA
    Game.drawMatrix(Arena.matrix, { x: 0, y: 0 });

    // DRAW PLAYER PIECE
    Game.drawMatrix(Player.piece.matrix, Player.position);

    // FILL GRID
    for(var x = 0; x < Settings._blockSize * Settings._arenaSize.w; x += Settings._blockSize) {
      context.moveTo(x, 0);
      context.lineTo(x, Settings._blockSize * Settings._arenaSize.h);
    }

    for(var y = 0; y < Settings._blockSize * Settings._arenaSize.h; y += Settings._blockSize) {
      context.moveTo(0, y);
      context.lineTo(Settings._blockSize * Settings._arenaSize.w, y);
    }

    context.strokeStyle = Settings._gridColor;
    context.stroke();
  },

  update: function(time) {
    time = time || 0;

    Game._dropCounter += (time - Game._lastTime);
    
    Game._lastTime = time;

    if(Game._dropCounter > Game._dropInterval) {
      Player.dropDown();
    }

    Game.draw();

    requestAnimationFrame(Game.update);
  },

  sweepLines: function() {
    Game.sweepNulled();

    function getStackToRemove(row, column) {      
      var y2 = y3 = row,
          x2 = x3 = column
          value = Arena.matrix[row][column];

      var stackToRemove = [{ row: row, column: column }];

      while(--y2 >= 0 && Arena.matrix[y2][column] === value) {
        stackToRemove.push({ row: y2, column: column });
      }

      while(++y3 < Arena.matrix.length && Arena.matrix[y3][column] === value) {
        stackToRemove.push({ row: y3, column: column });
      }

      while(++x2 < Arena.matrix[row].length && Arena.matrix[row][x2] === value) {
        stackToRemove.push({ row: row, column: x2 });
      }

      while(--x3 >= 0 && Arena.matrix[row][x3] === value) {
        stackToRemove.push({ row: row, column: x3 });
      }

      if(stackToRemove.length >= 3) {
        return stackToRemove;
      }

      return false;
    }

    var stackToRemove = [];

    Arena.matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if(value) {
          var stackToRemoveInCurrentPoint = getStackToRemove(y, x);

          if(stackToRemoveInCurrentPoint !== false) {
            stackToRemove = stackToRemove.concat(stackToRemoveInCurrentPoint);
          }
        }
      });
    });

    if(stackToRemove.length) {
      for(var i = 0; i < stackToRemove.length; i++) {
        Arena.matrix[stackToRemove[i].row][stackToRemove[i].column] = 0;
      }

      Game.sweepLines();
    }

    return false;
  },

  sweepNulled: function() {
    Arena.matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if(!value) {
          var y2 = y;

          if(--y2 >= 0 && Arena.matrix[y2][x] !== 0) {
            Arena.matrix[y][x] = Arena.matrix[y2][x];
            Arena.matrix[y2][x] = 0;

            return Game.sweepNulled();
          }
        }
      });
    });

    return false;
  },

  createMatrix: function(w, h) {
    var matrix = [];

    while(h--) {
      matrix.push(new Array(w).fill(0));
    }

    return matrix;
  },

  drawMatrix: function(matrix, offset) {
    matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if(value) {
          context.fillStyle = Pieces.getColorByNumber(matrix[y][x]);
          context.fillRect((x + offset.x) * Settings._blockSize, (y + offset.y) * Settings._blockSize, Settings._blockSize, Settings._blockSize);

          context.font = '24px Lora';
          context.fillStyle = Settings._pieceFontColor;
          context.fillText(
            matrix[y][x],
            (x + offset.x) * Settings._blockSize + (Settings._blockSize / 2) - 6, 
            (y + offset.y) * Settings._blockSize + (Settings._blockSize / 2) + 9
          ); 
        }
      });
    });
  },

  merge: function() {
    Player.piece.matrix.forEach(function(row, y) {
      row.forEach(function(value, x) {
        if(value) {
          Arena.matrix[y + Player.position.y][x + Player.position.x] = value;
        }
      });
    });
  },

  collide: function() {
    var [m, p] = [Player.piece.matrix, Player.position];

    for(var y = 0; y < m.length; y++) {
      for(x = 0; x < m[y].length; x++) {
        if(
          m[y][x] !== 0 &&
          (Arena.matrix[y + p.y] &&
          Arena.matrix[y + p.y][x + p.x]) !== 0
        ) { return true; }
      }
    }

    return false;
  }
};

var Arena = {
  matrix: Game.createMatrix(Settings._arenaSize.w, Settings._arenaSize.h)
};

Player.reset();
Game.start();

document.addEventListener('keydown', function(event) {
  switch(event.keyCode) {
    case 37: // LEFT
      Player.move(-1);
    break;

    case 39: // RIGHT
      Player.move(1);
    break;

    case 40: // DOWN
      Player.dropDown();
    break;

    case 81: // Q
      Player.rotate(-1);

      if(Game.collide()) {
        Player.rotate(1);
      }
    break;

    case 87: // W
      Player.rotate(1);

      if(Game.collide()) {
        Player.rotate(-1);
      }
    break;
  }
});
