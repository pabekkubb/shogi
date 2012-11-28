(function() {
	var data = { host: new Array,
				 komaList: new Array,
				 motiGoma: new Array,
				 turn: null }
	var CENTER = { x: 4, y: 4 };
	var KOMA = new function() {
		this.name = {
			ou: [ { x: -1, y: -1 }, { x: 0, y: -1 },
				  { x: 1, y: -1 }, { x: -1, y: 0 },
				  { x: 1, y: 0 }, { x: -1, y: 1 },
				  { x: 0, y: 1 }, { x: 1, y: 1 } ],
			kin: [ { x: -1, y: -1 }, { x: 0, y: -1 },
				   { x: 1, y: -1 }, { x: -1, y: 0 },
				   { x: 1, y: 0 }, { x: 0, y: 1 } ],
			gin: [ { x: -1, y: -1 }, { x: 0, y: -1 },
				   { x: 1, y: -1 }, { x: -1, y: 1 },
				   { x: 1, y: 1 } ],
			uma: [ { x: -1, y: -2 }, { x: 1, y: -2 } ],
			yari: [ { x: 100, y: 0 } ],
			hisha: [ { x: 200, y: 200 } ],
			kaku: [ { x: 300, y: 300 } ],
			hu: [ { x: 0, y: -1 } ]
		}
		this.initialPosition = function() {
			var ary = new Array;
			hu(ary);
			kin(ary);
			gin(ary);
			uma(ary);
			yari(ary);
			hisha(ary);
			kaku(ary);
			ou(ary);

			//まだ短くできる
			function hu(ary) {
				var name = "hu";
				for (var i=0; i<9; ++i)
					add(ary, name, i, 2);
			}

			function kin(ary) {
				var X = 3;
				var Y = 0;
				var name = "kin";
				add(ary, name, X, Y);
				
				X = 5;
				Y = 0;
				add(ary, name, X, Y);
			}

			function gin(ary) {
				var X = 2;
				var Y = 0;
				var name = "gin";
				add(ary, name, X, Y);
				
				X = 6;
				Y = 0;
				add(ary, name, X, Y);
			}

			function uma(ary) {
				var X = 1;
				var Y = 0;
				var name = "uma";
				add(ary, name, X, Y);
				
				X = 7;
				Y = 0;
				add(ary, name, X, Y);
			}

			function yari(ary) {
				var X = 0;
				var Y = 0;
				var name = "yari";
				add(ary, name, X, Y);
				
				X = 8;
				Y = 0;
				add(ary, name, X, Y);
			}
			function hisha(ary) {
				var X = 1;
				var Y = 1;
				var name = "hisha";
				add(ary, name, X, Y);
			}

			function kaku(ary) {
				var X = 7;
				var Y = 1;
				var name = "kaku";
				add(ary, name, X, Y);
			}

			function ou(ary) {
				var X = 4;
				var Y = 0;
				var name = "ou";
				add(ary, name, X, Y);
			}
			
			function mirrorX(x, y) {
				return Math.round( (x - CENTER.x) * Math.cos(Math.PI) - 
					   (y - CENTER.y) * Math.sin(Math.PI) + CENTER.x );
			}

			function mirrorY(x, y) {
				return Math.round( (x - CENTER.x) * Math.sin(Math.PI) +
					   (y - CENTER.y) * Math.cos(Math.PI) + CENTER.y );
			}
			
			function makeData(Name, man, X, Y) {
				return { name: Name , pos: { x: X, y: Y }, host: man };
			}

			function add(ary, name, X, Y) {
				ary.push( makeData(name, data.host[0], X, Y) );
				ary.push( makeData(name, data.host[1], mirrorX(X, Y), mirrorY(X, Y)) );
			}
			return ary;
		}
	}


	global.io.sockets.on('connection', function(socket) {
		var me = socket.store.id;
		data.host = Object.keys(socket.manager.roomClients)
		console.log("メンバー増える",Object.keys(socket.manager.roomClients));

		if (me == data.host[0]) {
			//data.motiGoma.push( { pos: {x: 0, y: 0}, name: "kin", host: me } );
		} else {
/*
			data.motiGoma.push( { pos: {x: 0, y: 0}, name: "uma", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 1}, name: "kin", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 2}, name: "gin", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 3}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 4}, name: "hu", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 5}, name: "kin", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 6}, name: "gin", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 7}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 8}, name: "hu", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 9}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 10}, name: "uma", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 11}, name: "kin", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 12}, name: "gin", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 13}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 14}, name: "hu", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 15}, name: "kin", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 16}, name: "gin", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 17}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 18}, name: "hu", host: me } );
			data.motiGoma.push( { pos: {x: 1, y: 19}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 0, y: 20}, name: "uma", host: me } );
			data.motiGoma.push( { pos: {x: 2, y: 0}, name: "kin", host: me } );
			data.motiGoma.push( { pos: {x: 3, y: 1}, name: "gin", host: me } );
			data.motiGoma.push( { pos: {x: 2, y: 2}, name: "ou", host: me } );
			data.motiGoma.push( { pos: {x: 3, y: 3}, name: "hu", host: me } );
*/
		}
		
		socket.emit('init', me);


		if (data.host.length < 2) {
			socket.emit('message', 'search');
		} else if (data.host.length == 2) {
			data.turn = data.host[(Math.random() * 2 | 0)];
			data.komaList = KOMA.initialPosition();
			socket.broadcast.emit('start', data, KOMA);
			socket.emit('start', data, KOMA);
			console.log(data.turn,"のターン");
		}

		socket.on('message', function(msg) {
			data.komaList = new Array;
			data.motiGoma = new Array;
			data.host = new Array;
			data.turn = null;
		});

		socket.on('update', function(U) {
			//ターンを変える
			if (data.turn == data.host[0])
				data.turn = data.host[1];
			else if (data.turn == data.host[1])
				data.turn = data.host[0];
			//盤の駒、持ち駒更新
			var myKoma = new Array;
			for (var i=0; i<data.motiGoma.length; ++i) {
				if (data.motiGoma[i].host == U.me)
					myKoma.push(data.motiGoma[i]);
			}
			if (U.getKoma) {
				for (var i=0; i<data.komaList.length; ++i) {
					if ( (data.komaList[i].pos.x == U.moveTo.x) &&
						 (data.komaList[i].pos.y == U.moveTo.y) ) {
						data.komaList[i].pos.x = (myKoma.length<20) ?
												 ( (myKoma.length%2==0) ? 0 : 1 ) :
												 ( (myKoma.length%2==0) ? 2 : 3 );
						data.komaList[i].pos.y = (myKoma.length<20) ?
												 Math.floor(myKoma.length/2) :
												 Math.floor( (myKoma.length-20)/2 );
						data.komaList[i].host = U.me;
						data.motiGoma.push(data.komaList[i]);
						data.komaList.splice(i, 1);
						break;
					}
				}
			} 
			for (var i=0; i<data.komaList.length; ++i) {
				if ( (data.komaList[i].pos.x == U.koma.pos.x) &&
					 (data.komaList[i].pos.y == U.koma.pos.y) ) {
					data.komaList[i].pos.x = U.moveTo.x;
					data.komaList[i].pos.y = U.moveTo.y;
					break;
				}
			}
			//クライアントに更新を伝える
			socket.broadcast.emit('update', data);
			socket.emit('update', data);
		})

		socket.on('disconnect', function() {
			socket.broadcast.emit('message', 'quit');
		});

	});


}).call(this);
