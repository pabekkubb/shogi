function ObjectModel() {}

ObjectModel.prototype.initialize = function(target) {
  this.canvas = document.getElementById(target);
  if (!this.canvas || !this.canvas.getContext) {
    alert("No Canvas support in your browser...");
    return;
  }
  this.context = this.canvas.getContext("2d");
}

var host = 'localhost:3000';
var socket = io.connect('http://' + host + '/shogi');
var NAME = "NAME"
  , MASU_SIZE = 60
  , MASU_NUM = 9
  , ME
  , KOMA
  , DATA
  , CENTER = { x: 4, y: 4 };

var manager = new ObjectModel()
  ,  board = new ObjectModel()
  ,  finger = new ObjectModel()
  ,  komaList = new ObjectModel()
  ,  motiGoma = new ObjectModel();

function mirrorX(x, y) {
  return Math.round( (x - CENTER.x) * Math.cos(Math.PI) - 
       (y - CENTER.y) * Math.sin(Math.PI) + CENTER.x );
}

function mirrorY(x, y) {
  return Math.round( (x - CENTER.x) * Math.sin(Math.PI) +
       (y - CENTER.y) * Math.cos(Math.PI) + CENTER.y );
}

manager.init = function() {
  board.init(NAME);
  finger.init(NAME);
  komaList.init(NAME);
}

manager.run = function() {
  this.init();
  run();

  function run() {
    board.update();
    komaList.update();
    motiGoma.update("myKoma");
    motiGoma.update("enemyKoma");
    finger.run();
  };
}

manager.clear = function() {
  this.init();
  board.clear();
  motiGoma.init("myKoma");
  motiGoma.clear()
  motiGoma.init("enemyKoma");
  motiGoma.clear()
}

//==================================================

board.init = function(target) {
  this.initialize(target);
  this.size = { x: this.canvas.width, y: this.canvas.height};
}

board.update = function() {
  this.clear();
  this.draw();
}

board.clear = function() {
  this.context.clearRect(0, 0, this.size.x, this.size.y);
}

board.draw = function() {
  this.context.fillStyle = "#BD6600";
  this.context.fillRect(0, 0, this.size.x, this.size.y);
  this.context.strokeStyle= "#000000";
  for (var i=0; i<MASU_NUM; ++i) { //横
    this.context.beginPath();
    this.context.moveTo(0, i*MASU_SIZE);
    this.context.lineTo(board.size.x, i*MASU_SIZE);
    this.context.stroke();
  }
  for (var i=0; i<MASU_NUM; ++i) { //縦
    this.context.beginPath();
    this.context.moveTo(i*MASU_SIZE, 0);
    this.context.lineTo(i*MASU_SIZE, board.size.y);
    this.context.stroke();
  }
}

//==================================================

finger.init = function(target) {
  this.initialize(target);
  this.pos = { x: 4, y: 4 };
  this.koma = false;
  this.haveKoma = false;
  this.moti = false;
}

finger.run = function() {
  $("#NAME").mousemove( function(e) {
    finger.move(e, "board");
    if (finger.moti) {
      board.update();
      finger.context.fillStyle = "#FFD2FF";
      finger.context.fillRect( (finger.pos.x * MASU_SIZE) + 1,
                   (finger.pos.y * MASU_SIZE) + 1,
                   MASU_SIZE - 2, MASU_SIZE - 2);
      finger.context.fill();
      komaList.draw();
      //置ける所を描画
      //画像アルファ掛けてみたい
    }
  });

  $("#myKoma").mousemove( function(e) {
    finger.move(e, "moti");
  });

  $("#myKoma").on("click", function() {
    if (ME != DATA.turn)
      return;

    if (finger.haveKoma) {
      //戻す
      if ( (finger.pos.x == finger.koma.pos.x) &&
         (finger.pos.y == finger.koma.pos.y) ) {
        finger.koma = false;
        finger.haveKoma = false;
        finger.moti = false;
        board.update();
        motiGoma.init("myKoma");
        motiGoma.drawBoard();
        motiGoma.drawKoma("myKoma");
        komaList.draw();
      }
    } else {
      //掴む
      for (var i=0; i<motiGoma.myKoma.length; ++i) {
        if ( (finger.pos.x == motiGoma.myKoma[i].pos.x) &&
           (finger.pos.y == motiGoma.myKoma[i].pos.y) ) {
          finger.koma = motiGoma.myKoma[i];
          finger.haveKoma = true;
          finger.moti = true;
          curdraw();
        }
      }
    }

    //console.log("finger.haveKoma", finger.haveKoma);
    //console.log(finger.koma);

    function curdraw() {
      var size = MASU_SIZE;
      if (motiGoma.myKoma.length>10)
        size = MASU_SIZE/2;
      finger.initialize("myKoma");
      motiGoma.init("myKoma");
      motiGoma.drawBoard();
      finger.context.fillStyle = "#00E0E0";
      finger.context.fillRect( (finger.koma.pos.x * size) + 1,
                   (finger.koma.pos.y * size) + 1,
                   size - 2, size - 2);
      finger.context.fill();
      motiGoma.drawKoma("myKoma");
      finger.initialize("NAME");
    }
  });

  $("#NAME").on("click", function() {
    if (ME != DATA.turn)
      return;
    
    if (finger.haveKoma)
      putDown();
    else
      getKoma();

    //console.log("finger.haveKoma", finger.haveKoma);
    //console.log("finger.koma", finger.koma);

    function getKoma() {
      for (var i=0; i<komaList.list.length; ++i) {
        if (ME != komaList.list[i].host) continue;
        if ( (finger.pos.x == komaList.list[i].pos.x) &&
           (finger.pos.y == komaList.list[i].pos.y) ) {
          finger.koma = komaList.list[i];
          finger.haveKoma = true;
          draw();
        }
      }

      function draw() {
        current();
        neighbor();
        komaList.draw();

        function current() {
          finger.context.fillStyle = "#00E0E0";
          finger.context.fillRect( (finger.koma.pos.x * MASU_SIZE) + 1,
                       (finger.koma.pos.y * MASU_SIZE) + 1,
                       MASU_SIZE - 2, MASU_SIZE - 2);
          finger.context.fill();
        }
        
        function neighbor() {
          var neiAry = neiMasu();
          //console.log("neiAry", neiAry); //debug
          for (var i=0; i<neiAry.length; ++i) {
            finger.context.fillStyle = "#C0C0C0";
            finger.context.fillRect(neiAry[i].x * MASU_SIZE + 1,
                        neiAry[i].y * MASU_SIZE + 1,
                        MASU_SIZE - 2, MASU_SIZE - 2);
            finger.context.fill();
          }
        }
      }
    }

    function putDown() {
      if ( finger.moti && canPut() ) {
        finger.rotate();
        socket.emit('update', { koma: finger.koma,
                    moveTo: finger.pos,
                    getKoma: false,
                    moti: true,
                    me: ME });
        finger.koma = false;
        finger.haveKoma = false;
        finger.moti = false;
        return;
      }
      //動ける範囲なら置く
      if ( containObj(finger.pos, neiMasu()) ) {
        //取れるなら敵駒取る
        for (var i=0; i<komaList.list.length; ++i) {
          if ( (ME != komaList.list[i].host) && 
             (finger.pos.x == komaList.list[i].pos.x) &&
             (finger.pos.y == komaList.list[i].pos.y) ) {
            finger.rotate();
            socket.emit('update', { koma: finger.koma,
                        moveTo: finger.pos,
                        getKoma: true,
                        moti: false,
                        me: ME });
            finger.haveKoma = false;
            return;
          }
        }
        finger.rotate();
        socket.emit('update', { koma: finger.koma,
                    moveTo: finger.pos,
                    getKoma: false,
                    moti: false,
                    me: ME });
        finger.haveKoma = false;
        return;
      }
      //元にもどす
      if ( (finger.pos.x == finger.koma.pos.x) &&
         (finger.pos.y == finger.koma.pos.y) ) {
        finger.haveKoma = false;
        finger.koma = false;

        board.update();
        komaList.draw();
      }
    }
    
    function canPut() {
      for (var i=0; i<komaList.list.length; ++i) {
        if ( (finger.koma.name == "hu") &&
           (komaList.list[i].name == "hu") &&
           (finger.pos.x == komaList.list[i].pos.x) && 
           (ME == komaList.list[i].host) ) {
          $("#message").html("<h1>二歩です</h1>");
          return false;
        }
        if ( (finger.pos.x == komaList.list[i].pos.x) &&
           (finger.pos.y == komaList.list[i].pos.y) ) {
          //console.log("finger, list", finger.pos, komaList.list[i]);
          $("#message").html("<h1>他の駒があります</h1>");
          return false;
        }
      }
      return true;
    }

    function neiMasu() {
      var name = finger.koma.name;
      var neiAry = new Array;
      var moveToX
        , moveToY;

      var leftKoma = false
        , rightKoma = false;
      switch (name) {
      case "hisha":
        hisha();
        break;
      case "kaku":
        kaku();
        break;
      case "yari":
        for (var i=finger.koma.pos.y-1; i>-1; --i) {
          if ( !myKomaExist(finger.koma.pos.x, i) ) {
            neiAry.push({ x: finger.koma.pos.x, y: i });
            if ( enemyKomaExist(finger.koma.pos.x, i) )
              break;
          } else
            break;
        }
        break;
      case "hishaN":
        hisha();
        for (var i=0; i<KOMA.name["ou"].length; ++i) {
          moveToX = (finger.koma.pos.x + KOMA.name["ou"][i].x);
          moveToY = (finger.koma.pos.y + KOMA.name["ou"][i].y);
          if ( myKomaExist(moveToX, moveToY) )
            continue;
          neiAry.push({ x: moveToX, y: moveToY });
        }
        break;
      case "kakuN":
        kaku();
        for (var i=0; i<KOMA.name["ou"].length; ++i) {
          moveToX = (finger.koma.pos.x + KOMA.name["ou"][i].x);
          moveToY = (finger.koma.pos.y + KOMA.name["ou"][i].y);
          if ( myKomaExist(moveToX, moveToY) )
            continue;
          neiAry.push({ x: moveToX, y: moveToY });
        }
        break;
      default:
        for (var i=0; i<KOMA.name[name].length; ++i) {
          moveToX = (finger.koma.pos.x + KOMA.name[name][i].x);
          moveToY = (finger.koma.pos.y + KOMA.name[name][i].y);
          if ( myKomaExist(moveToX, moveToY) )
            continue;
          neiAry.push({ x: moveToX, y: moveToY });
        }
        break;
      }
      return neiAry;

      function hisha() {
        //横
        for (var i=finger.koma.pos.x-1; i>-1; --i) {
          if ( !myKomaExist(i, finger.koma.pos.y) ) {
            neiAry.push({ x: i, y: finger.koma.pos.y });
            if ( enemyKomaExist(i, finger.koma.pos.y) )
              break;
          } else
            break;
        }
        for (var i=finger.koma.pos.x+1; i<9; ++i) {
          if ( !myKomaExist(i, finger.koma.pos.y) ) {
            neiAry.push({ x: i, y: finger.koma.pos.y });
            if ( enemyKomaExist(i, finger.koma.pos.y) )
              break;
          } else
            break;
        }
        //縦
        for (var i=finger.koma.pos.y-1; i>-1; --i) {
          if ( !myKomaExist(finger.koma.pos.x, i) ) {
            neiAry.push({ x: finger.koma.pos.x, y: i });
            if ( enemyKomaExist(finger.koma.pos.x, i) )
              break;
          } else
            break;
        }
        for (var i=finger.koma.pos.y+1; i<9; ++i) {
          if ( !myKomaExist(finger.koma.pos.x, i) ) {
            neiAry.push({ x: finger.koma.pos.x, y: i });
            if ( enemyKomaExist(finger.koma.pos.x, i) )
              break;
          } else
            break;
        }
      }

      function kaku() {
        //上
        var t = 1;
        for (var i=finger.koma.pos.y-1; i>-1; --i) {
          if ( !myKomaExist(finger.koma.pos.x-t, i) ) {
            neiAry.push({ x: finger.koma.pos.x-t, y: i });
            if ( enemyKomaExist(finger.koma.pos.x-t, i) )
              break;
            ++t;
          } else
            break;
        }
        t = 1;
        for (var i=finger.koma.pos.y-1; i>-1; --i) {
          if ( !myKomaExist(finger.koma.pos.x+t, i) ) {
            neiAry.push({ x: finger.koma.pos.x+t, y: i });
            if ( enemyKomaExist(finger.koma.pos.x+t, i) )
              break;
            ++t;
          } else
            break;
        }
        //下
        t = 1;
        for (var i=finger.koma.pos.y+1; i<9; ++i) {
          if ( !myKomaExist(finger.koma.pos.x-t, i) ) {
            neiAry.push({ x: finger.koma.pos.x-t, y: i });
            if ( enemyKomaExist(finger.koma.pos.x-t, i) )
              break;
            ++t;
          } else
            break;
        }
        t = 1;
        for (var i=finger.koma.pos.y+1; i<9; ++i) {
          if ( !myKomaExist(finger.koma.pos.x+t, i) ) {
            neiAry.push({ x: finger.koma.pos.x+t, y: i });
            if ( enemyKomaExist(finger.koma.pos.x+t, i) )
              break;
            ++t;
          } else
            break;
        }
      }

      function myKomaExist(x, y) {
        for (var i=0; i<komaList.list.length; ++i) {
          if ( (ME == komaList.list[i].host) && 
             (x == komaList.list[i].pos.x) &&
             (y == komaList.list[i].pos.y) )
            return true;
        }
        return false;
      }

      function enemyKomaExist(x, y) {
        for (var i=0; i<komaList.list.length; ++i) {
          if ( (ME != komaList.list[i].host) && 
             (x == komaList.list[i].pos.x) &&
             (y == komaList.list[i].pos.y) )
            return true;
        }
        return false;
      }
    }
  });
}

finger.rotate = function() {
  if (ME == DATA.host[0]) {
    this.pos.x = mirrorX(this.pos.x, this.pos.y);
    this.pos.y = mirrorY(this.pos.x, this.pos.y);
    this.koma.pos.x = mirrorX(this.koma.pos.x, this.koma.pos.y);
    this.koma.pos.y = mirrorY(this.koma.pos.x, this.koma.pos.y);
  }
}

finger.move = function(e, type) {
  if (type == "board") {
    this.pos.x = Math.floor( (e.pageX - $("#NAME").offset()["left"]) / MASU_SIZE );
    this.pos.y = Math.floor( (e.pageY - $("#NAME").offset()["top"]) / MASU_SIZE );
    if (this.pos.x > 8)
      this.pos.x = 8;
    if (this.pos.y > 8)
      this.pos.y = 8;
  }
  else if (type == "moti") {
    if (motiGoma.myKoma.length <= 10) {
      this.pos.x = Math.floor( (e.pageX - $("#myKoma").offset()["left"]) / MASU_SIZE );
      this.pos.y = Math.floor( (e.pageY - $("#myKoma").offset()["top"]) / MASU_SIZE );
      if (this.pos.x > 1)
        this.pos.x = 1;
      if (this.pos.y > 4)
        this.pos.y = 4;
    } else {
      this.pos.x = Math.floor( (e.pageX - $("#myKoma").offset()["left"]) / (MASU_SIZE/2) );
      this.pos.y = Math.floor( (e.pageY - $("#myKoma").offset()["top"]) / (MASU_SIZE/2) );
      if (this.pos.x > 3)
        this.pos.x = 3;
      if (this.pos.y > 9)
        this.pos.y = 9;
    }
  }
}

//==================================================


komaList.init = function(target) {
  this.initialize(target);
  this.list = DATA.komaList;
}

komaList.update = function() {
  this.list = DATA.komaList;
  this.rotate();
  this.draw();
}

komaList.rotate = function() {
  if (ME == DATA.host[0]) {
    for (var i=0; i<this.list.length; ++i) {
      this.list[i].pos.x = mirrorX(this.list[i].pos.x, this.list[i].pos.y);
      this.list[i].pos.y = mirrorY(this.list[i].pos.x, this.list[i].pos.y);
    }
  }
}

komaList.move = function(koma, moveTo) {
  for (var i=0; i<this.list.length; ++i) {
    if ( (this.list[i].pos.x == koma.pos.x) &&
         (this.list[i].pos.y == koma.pos.y) ) {
      this.list[i].pos.x = moveTo.x;
      this.list[i].pos.y = moveTo.y;
      return;
    }
  }
}

komaList.draw = function() {
  for (var i=0; i<this.list.length; ++i) {
    switch (this.list[i].name) {
    case "ou": drawFunc(50, 0, 135, 158, 0, -2, 55, 62, i); break;
    case "kin": drawFunc(435, 0, 130, 170, 6, -6, 50, 70, i); break;
    case "gin": drawFunc(50, 310, 130, 145, 2, -2, 50, 60, i); break;
    case "ginN": drawFunc(50, 456, 130, 145, 6, 3, 50, 60, i); break;
    case "uma": drawFunc(190, 310, 120, 148, 6, -4, 47, 62, i); break;
    case "umaN": drawFunc(190, 458, 120, 150, 6, 3, 48, 63, i); break;
    case "yari": drawFunc(320, 310, 115, 150, 6, -4, 47, 62, i); break;
    case "yariN": drawFunc(320, 458, 115, 150, 6, 3, 47, 62, i); break;
    case "hisha": drawFunc(190, 2, 120, 160, 5, -4, 50, 66, i); break;
    case "hishaN": drawFunc(190, 157, 120, 160, 5, -3, 50, 66, i); break;
    case "kaku": drawFunc(315, 2, 120, 160, 5, -4, 50, 66, i); break;
    case "kakuN": drawFunc(315, 157, 120, 160, 5, -2, 50, 66, i); break;
    case "hu": drawFunc(435, 310, 120, 155, 3, -6, 50, 66, i); break;
    case "huN": drawFunc(435, 462, 120, 164, 0, 2, 52, 69, i); break;
    }
  }

  function drawFunc(sx, sy, sw, sh, gosaX, gosaY, dw, dh, i) {
    var x = komaList.list[i].pos.x
      , y = komaList.list[i].pos.y;
    komaList.context.save();
    if (ME != komaList.list[i].host) {
      komaList.context.translate((komaList.list[i].pos.x+1) * MASU_SIZE,
                     (komaList.list[i].pos.y+1) * MASU_SIZE);
      komaList.context.rotate(Math.PI);
      x = 0;
      y = 0;
    }
    komaList.context.drawImage(KOMA.img, sx, sy, sw, sh,
                   x * MASU_SIZE + gosaX,
                   y * MASU_SIZE + gosaY,
                   dw, dh);
    komaList.context.restore();
  }
}

//==================================================

motiGoma.init = function(target) {
  this.initialize(target);
  this.size = { x: this.canvas.width, y: this.canvas.height };
  this.myKoma = new Array;
  this.enemyKoma = new Array;
  for (var i=0; i<DATA.motiGoma.length; ++i) {
    if (ME == DATA.motiGoma[i].host)
      this.myKoma.push(DATA.motiGoma[i]);
    else
      this.enemyKoma.push(DATA.motiGoma[i]);
  }
}

motiGoma.update = function(target) {
  this.init(target)
  this.clear();
  this.draw(target);
}

motiGoma.clear = function() {
  this.context.clearRect(0, 0, this.size.x, this.size.y);
}

motiGoma.drawBoard = function() {
  this.context.fillStyle = "#BD6600";
  this.context.fillRect(0, 0, this.size.x, this.size.y);
}

motiGoma.drawKoma = function(target) {
  if (target == "myKoma") {
    this.init(target);
    for (var i=0; i<this.myKoma.length; ++i)
      drawFunc(this.myKoma, i);
  } else if (target == "enemyKoma") {
    this.init(target);
    for (var i=0; i<this.enemyKoma.length; ++i)
      drawFunc(this.enemyKoma, i);
  }

  function drawFunc(koma, i) {
    switch (koma[i].name) {
    case "ou": f(50, 0, 135, 158, 0, -2, 55, 62, i, koma); break;
    case "kin": f(435, 0, 130, 170, 6, -6, 50, 70, i, koma); break;
    case "gin": f(50, 310, 130, 145, 2, -2, 50, 60, i, koma); break;
    case "ginN": f(50, 310, 130, 145, 2, -2, 50, 60, i, koma); break;
    case "uma": f(190, 310, 120, 148, 6, -4, 47, 62, i, koma); break;
    case "umaN": f(190, 310, 120, 148, 6, -4, 47, 62, i, koma); break;
    case "yari": f(320, 310, 115, 150, 6, -4, 47, 62, i, koma); break;
    case "yariN": f(320, 310, 115, 150, 6, -4, 47, 62, i, koma); break;
    case "hisha": f(190, 2, 120, 160, 5, -4, 50, 66, i, koma); break;
    case "hishaN": f(190, 2, 120, 160, 5, -4, 50, 66, i, koma); break;
    case "kaku": f(315, 2, 120, 160, 5, -4, 50, 66, i, koma); break;
    case "kakuN": f(315, 2, 120, 160, 5, -4, 50, 66, i, koma); break;
    case "hu": f(435, 310, 120, 155, 3, -6, 50, 66, i, koma); break;
    case "huN": f(435, 310, 120, 155, 3, -6, 50, 66, i, koma); break;
    }

    function f(sx, sy, sw, sh, gosaX, gosaY, dw, dh, i, koma) {
      var size = MASU_SIZE;
      if (koma.length>10) {
        dw = dw/2;
        dh = dh/2;
        size = MASU_SIZE/2;
      }
      motiGoma.context.drawImage(KOMA.img, sx, sy, sw, sh,
                     koma[i].pos.x * size + gosaX,
                     koma[i].pos.y * size + gosaY,
                     dw, dh);
    }
  }
}

motiGoma.draw = function(target) {
  this.drawBoard();
  this.drawKoma(target);
}

//==================================================

/*
 a = { x: 0, y: 0 };
 b = { x: 0, y: 0 };
 console.log( equalObj(a, b) ); //#=> true
 a = { x: 0, y: 0 };
 b = { y: 0, x: 0 };
 console.log( equalObj(a, b) ); //#=> true 
 a = { pos: {x: 0, y: 0}, t: 0 };
 b = { pos: {x: 0, y: 0}, t: 0 };
 console.log( equalObj(a, b) ); //#=> true 
 a = { x: 0, y: 0 };
 b = { x: 0 };
 console.log( equalObj(a, b) ); //#=> false
 a = { x: 0, y: 0 };
 b = { x: 0, y: 1 };
 console.log( equalObj(a, b) ); //#=> false
 a = { s: 0, y: 0 };
 b = { x: 0, y: 0 };
 console.log( equalObj(a, b) ); //#=> false
 a = { x: 0, y: 0 };
 b = { x: 0, y: 0, z: 0};
 console.log( equalObj(a, b) ); //#=> false
 a = { pos: {x: 0, y: 0}, t: 0 };
 b = { pos: {x: 0, y: 1}, t: 0 };
 console.log( equalObj(a, b) ); //#=> false 
*/
function equalObj(a, b) {
  var flag = true;
  if (Object.keys(a).length != Object.keys(b).length)
    return false 
  Object.keys(a).forEach( function(key) {
    if ( (typeof(a[key]) == "object") &&
         (typeof(b[key]) == "object") ){
      flag = equalObj(a[key], b[key]);
      return;
    }
    if (a[key] != b[key]) {
      flag = false;
      return;
    }
  });
  return flag;
}

/*
 a = [1, 2, 3];
 b = [1, 2, 3];
 console.log( equalAry(a, b) ); //#=> true
 a = [1, 2, 3];
 b = [1, 2];
 console.log( equalAry(a, b) ); //#=> false
 a = [1, 2, 3];
 b = [1, 5, 3];
 console.log( equalAry(a, b) ); //#=> false
 a = [1, 2, 3];
 b = [3, 2, 1];
 console.log( equalAry(a, b) ) //#=> false
*/
function equalAry(a, b) {
  if (a.length != b.length) return false;
  for (var i=0; i<a.length; ++i) {
    if (a[i] != b[i])
      return false;
  }
  return true;
}

function containObj(elem, objAry) {
  var result = false;
  _.each(objAry, function(obj) {
    if ( equalObj(elem, obj) )
      result = true;
  });
  /*
  for each (var obj in objAry) {
    if ( equalObj(elem, obj) )
      return true;
  }
  */
  return result;
}

/*
a = 3;
b = [4,1,6,7,8,3,1];
console.log( containAry(a, b) ); //#=> true;
*/

function containAry(elem, ary) {
  for (var i=0; i<ary.length; ++i) {
    if (elem == ary[i])
      return true;
  }
  return false;
}


/*
 a = [ {x:0, y:0}, {x:0, y:0}, {x:0, y:0} ];
 console.log( uniqObjAry(a) ) //#=> [ {x:0, y:0} ];
 a = [ {x:0, y:0}, {y:0, x:0}, {y:0, x:0} ];
 console.log( uniqObjAry(a) ) //#=> [ {x:0, y:0} ];
 a = [ {x:0, y:0, z:0}, {x:0, y:0}, {x:0, y:0} ];
 console.log( uniqObjAry(a) ) //#=> [ {x:0, y:0, z:0}, {x:0, y:0} ];
 a = [ {x:0, y:0}, {x:0, y:1}, {x:0, y:0} ];
 console.log( uniqObjAry(a) ) //#=> [ {x:0, y:0}, {x:0, y:1} ];
 a = [ {pos: {x:0, y:1}, t:0}, {x:0, y:1}, {x:0, y:0}, {pos: {x:0, y:0}, t:0} ];
 console.log( uniqObjAry(a) ) //#=> [ {pos: {x:0, y:0}, t:0}, {x:0, y:0}, {x:0, y:1} ];
*/
function uniqObjAry(ary) {
  var list = new Array;
  var flag = false;
  for (var i=0; i<ary.length; ++i) {
    for (var o=0; o<ary.length; ++o) {
      if ( (o == ary.length-1) && !containObj(ary[i], list) ) {
        list.push(ary[i]);
        flag = true
        break;
      }
      if ( equalObj(ary[i], ary[o])  ||
         !equalAry(Object.keys(ary[i]), Object.keys(ary[o])) )
        continue;
      flag = true;
    }
    if (flag)
      continue;
    list.push(ary[i]);
  }
  return list;
}

//==================================================

$(function() {
  socket.on('visit', function() {
    socket.emit('enter');
  });

  socket.on('notEnter', function() {
    $("#message").html("<h1>他の組が対戦中です...</h1>");
  });

  socket.on('enter', function() {
    socket = io.connect('http://' + host + '/shogi/room');

    socket.on('message', function(msg) {
      switch (msg) {
      case "search":
        $("#message").html("<h1>対戦相手を探しています...</h1>");
        $("#NAME").css({display: "none"});
        $("#myKoma").css({display: "none"});
        $("#enemyKoma").css({display: "none"});
        break;
      case "quit":
        restart("<h2>相手が接続を切りました<br>対戦相手を探しています...</h2>");
        break;
      }
    })

    function restart(msg) {
      $("#message").html(msg);
      $("#NAME").css({display: "none"})
            .unbind();
      $("#myKoma").css({display: "none"})
            .unbind();
      $("#enemyKoma").css({display: "none"})
               .unbind();
      manager.clear();
    }

    socket.on('init', function(who, koma) {
      ME = who;
      KOMA = koma;
      KOMA.img = new Image();
      KOMA.img.src = "../images/koma.png";
    });

    socket.on('start', function(data) {
      DATA = data;
      $("#NAME").css({display: "block"});
      $("#myKoma").css({display: "block"});
      $("#enemyKoma").css({display: "block"});
      msgTurn();
      manager.run();
    });

    socket.on('update', function(data) {
      update(data);
      motiGoma.update("myKoma");
      motiGoma.update("enemyKoma");
      msgTurn();
    });

    socket.on('naru', function(U) {
      if ( confirm("成りますか？") )
        U.koma.name = U.koma.name + "N";
      socket.emit('naru', U);
    });

    socket.on('result', function(winner, data) {
      var msg;
      if (ME == winner)
        msg = "<h1>勝ち</h1>";
      else
        msg = "<h1>負け</h1>";
      update(data);
      $("#NAME").unbind();
      $("#myKoma").unbind();
      $("#enemyKoma").unbind();
      $("#message").html(msg);
    });
  });

  function update(data) {
    DATA = data;
    board.update();
    komaList.update();
  }
  
  function msgTurn() {
    var msg;
    if (ME == DATA.turn)
      msg = "<h1>あなたのターンです</h1>";
    else
      msg = "<h1>相手のターンです</h1>";
    $("#message").html(msg);
  }
});

// FIXME 不正できる
// FIXME 成るかどうかのダイアログ出てるときにreloadすると次に持ち越される
// FIXME たまに駒が表示されない
// FIXME フリーズすることがある
// FIXME 持ち駒が引き継がれることがある
