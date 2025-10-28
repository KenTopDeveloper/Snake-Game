var Snake = (function () {
  const INITIAL_TAIL = 4;
  var fixedTail = true;
  var intervalID;
  var tileCount = 30;
  var gridSize = 400/tileCount;
  const INITIAL_PLAYER = { x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) };
  
  var velocity = { x:0, y:0 };
  var player = { x: INITIAL_PLAYER.x, y: INITIAL_PLAYER.y };

  var walls = true;
  var fruit = { x:1, y:1 };
  var trail = [];
  var tail = INITIAL_TAIL;
  var reward = 0;
  var points = 0;
  var pointsMax = 0;
  var ActionEnum = { 'none':0, 'up':1, down:2, 'left':3, 'right':4 };
  Object.freeze(ActionEnum);
  var lastAction = ActionEnum.none;
  function setup () {
    canv = document.getElementById('gc');
    ctx = canv.getContext('2d');
    game.reset();
  }

  var game = {
    reset: function () {
      ctx.fillStyle = 'grey';
      ctx.fillRect(0, 0, canv.width, canv.height);
      tail = INITIAL_TAIL;
      points = 0;
      velocity.x = 0;
      velocity.y = 0;
      player.x = INITIAL_PLAYER.x;
      player.y = INITIAL_PLAYER.y;
      this.RandomFruit();
      reward = -1;
      lastAction = ActionEnum.none;
      trail = [];
      trail.push({ x: player.x, y: player.y });
        for(var i=0; i<tail; i++) trail.push({ x: player.x, y: player.y });
    },
    action: {
      up: function () {
        if (lastAction != ActionEnum.down){
          velocity.x = 0;
          velocity.y = -1;
        }
      },
      down: function () {
        if (lastAction != ActionEnum.up){
          velocity.x = 0;
          velocity.y = 1;
        }
      },
      left: function () {
        if (lastAction != ActionEnum.right){
          velocity.x = -1;
          velocity.y = 0;
        }
      },
      right: function () {
        if (lastAction != ActionEnum.left){
          velocity.x = 1;
          velocity.y = 0;
        }
      }
    },
    RandomFruit: function () {
      if(walls){
        fruit.x = 1+Math.floor(Math.random() * (tileCount-2));
        fruit.y = 1+Math.floor(Math.random() * (tileCount-2));
      }
      else {
        fruit.x = Math.floor(Math.random() * tileCount);
        fruit.y = Math.floor(Math.random() * tileCount);
      }
    },
    log: function () {
      console.log('====================');
      console.log('x:' + player.x + ', y:' + player.y);
      console.log('tail:' + tail + ', trail.length:' + trail.length);
    },
    loop: function () {
      reward = -0.1;
      function DontHitWall () {
        if(player.x < 0) player.x = tileCount-1;
        if(player.x >= tileCount) player.x = 0;
        if(player.y < 0) player.y = tileCount-1;
        if(player.y >= tileCount) player.y = 0;
      }
      function HitWall () {
        if(player.x < 1) game.reset();
        if(player.x > tileCount-2) game.reset();
        if(player.y < 1) game.reset();
        if(player.y > tileCount-2) game.reset();
        ctx.fillStyle = 'grey';
        ctx.fillRect(0,0,gridSize-1,canv.height);
        ctx.fillRect(0,0,canv.width,gridSize-1);
        ctx.fillRect(canv.width-gridSize+1,0,gridSize,canv.height);
        ctx.fillRect(0, canv.height-gridSize+1,canv.width,gridSize);
      }

      var stopped = velocity.x == 0 && velocity.y == 0;
      player.x += velocity.x;
      player.y += velocity.y;
      if (velocity.x == 0 && velocity.y == -1) lastAction = ActionEnum.up;
      if (velocity.x == 0 && velocity.y == 1) lastAction = ActionEnum.down;
      if (velocity.x == -1 && velocity.y == 0) lastAction = ActionEnum.left;
      if (velocity.x == 1 && velocity.y == 0) lastAction = ActionEnum.right;
      ctx.fillStyle = 'rgba(40,40,40,0.8)';
      ctx.fillRect(0,0,canv.width,canv.height);
      if(walls) HitWall();
      else DontHitWall();
      game.log();
      if (!stopped){
        trail.push({x:player.x, y:player.y});
        while(trail.length > tail) trail.shift();
      }

      if(!stopped) {
        ctx.fillStyle = 'grey';'rgba(200,200,200,0.2)';
        ctx.font = "small-caps 14px Helvetica";
        ctx.fillText("(esc) reset", 17, 362);
        ctx.fillText("(space) pause", 17, 380);
      }

        ctx.fillStyle = "limegreen";
        for(var i=0; i<trail.length-1; i++) {
        ctx.fillRect(trail[i].x * gridSize+1, trail[i].y * gridSize+1, gridSize-2, gridSize-2);
        console.debug(i + ' => player:' + player.x, player.y + ', trail:' + trail[i].x, trail[i].y);
        if (!stopped && trail[i].x == player.x && trail[i].y == player.y){
          game.reset();
        }
        ctx.fillStyle = "lime";
      }
      ctx.fillRect(trail[trail.length-1].x * gridSize+1, trail[trail.length-1].y * gridSize+1, gridSize-2, gridSize-2);
      if (player.x == fruit.x && player.y == fruit.y) {
        if(!fixedTail) tail++;
        points++;
        if(points > pointsMax) pointsMax = points;
        reward = 1;
        game.RandomFruit();
        //make sure new fruit didn't spawn in snake tail
        while((function () {
          for(var i=0; i<trail.length; i++) {
            if (trail[i].x == fruit.x && trail[i].y == fruit.y) {
              game.RandomFruit();
              return true;
            }
          }
          return false;
        })());
      }

      ctx.fillStyle = 'red';
      ctx.fillRect(fruit.x * gridSize+1, fruit.y * gridSize+1, gridSize-2, gridSize-2);
      if(stopped) {
        ctx.fillStyle = '#D0CBC7';'rgba(250,250,250,0.8)';
        ctx.font = "small-caps bold 14px Helvetica";
        ctx.fillText("Press arrow keys to start…", 20, 380);
      }

      ctx.fillStyle = '#D0CBC7';
      ctx.font = "bold small-caps 14px Helvetica";
      ctx.fillText("points: " + points, 320, 30);
      ctx.fillText("top: " + pointsMax, 320, 48);
      return reward;
    }
  }

  function keyPush (evt) {
    switch(evt.keyCode) {
      case 37:
      game.action.left();
      evt.preventDefault();
      break;
      case 38:
      game.action.up();
      evt.preventDefault();
      break;
      case 39:
      game.action.right();
      evt.preventDefault();
      break;
      case 40:
      game.action.down();
      evt.preventDefault();
      break;
      case 32:
      Snake.pause();
      evt.preventDefault();
      break;
      case 27:
      game.reset();
      evt.preventDefault();
      break;
    }
  }

  return {
    start: function (fps = 100) {
      window.onload = setup;
      intervalID = setInterval(game.loop, 1000 / fps);
    },
    loop: game.loop,
    reset: game.reset,
    stop: function () {
      clearInterval(intervalID);
    },
    setup: {
      keyboard: function (state) {
        if (state) {
          document.addEventListener('keydown', keyPush);
        } else {
          document.removeEventListener('keydown', keyPush);
        }
      },
      wall: function (state) {
        walls = state;
      },
      tileCount: function (size) {
        tileCount = size;
        gridSize = 400 / tileCount;
      },
      fixedTail: function (state) {
        fixedTail = state;
      }
    },
    action: function (act) {
      switch(act) {
        case 'left':
          game.action.left();
          break;
        case 'up':
          game.action.up();
          break;
        case 'right':
          game.action.right();
          break;
        case 'down':
          game.action.down();
          break;
      }
    },
    pause: function () {
      velocity.x = 0;
      velocity.y = 0;
    },
    clearTopScore: function () {
      pointsMax = 0;
    },
    data: {
      player: player,
      fruit: fruit,
      trail: function () {
        return trail;
      }
    },
    info: {
      tileCount: tileCount
    }
  };
})();

Snake.start(13);
Snake.setup.keyboard(true);
Snake.setup.fixedTail(false);
;(function(){
var icon = '<svg class="sg" xmlns="http://w3.org/2000/svg" viewBox="0 0 185.31 251.89"><path d="M66.8,144.17c0-66.24,22.46-113.9,80.72-112.32,81.48,1.7,80.72,46.8,80.72,112.32,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.8-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68&& C61.47,146.7,66.8,149.7,66.8,144.17Z" transform="translate(-56.6 -25.84)" style="fill:#ffdfbf;fill-rule:evenodd"/><path d="M147.52,31.85C99.49,31.22,75.79,63,69,111.24c8.78-23.84,27.86-26,64.33-26.54,70.62-1.13,88.39,8.27,79.64,96.55-1.84,18.6-6.1,24.62-28.36,39.74-12.7,8.2,18.54-26.37-49.78-27-49.5-.43-30.6,36.41-40.6,29.44a81.88,81.88,0,0,1-20.28-20.73c12.89,40.76,40.76,69,73.8,69,37.3,0,68.69-37.59,77.95-88.67l2.77-38.89C228.24,77.93,229,32.91,147.52,31.85Z" transform="translate(-56.6 -25.84)" style="fill:#d0b57b;fill-rule:evenodd"/><path d="M146.13,31.84h1.39c81.48,1.7,80.72,46.8,80.72,112.33,0,5.15,8.38,3.81,7.62,19-2.28,19.42-9.44,14.63-10.39,19.85-9.26,51.8-40.65,88.67-77.95,88.67-37.76,0-69.47-38.53-78.28-90.58-.82-4.85-5.86-.8-6.42-18.68-1.34-16.39,4-13.39,4-18.29,0-65.71,22.11-112.33,79.33-112.33m0-6h0c-29.39,0-51.65,11.54-66.18,34.3C67.3,80,60.86,108.6,60.8,143.68h0c-2.54,3.5-4.94,7-4,19.12.4,12.11,2.72,16.46,6.59,19.86,9.65,56,44.19,95.7,84.11,95.7,19.91,0,38.59-9.42,54-27.25,14.35-16.57,24.87-39.79,29.66-65.45l0,0c4.22-2.57,8.87-6.53,10.58-21.1l0-.2v-.2c.58-11.55-3.35-16.18-7.7-19.61l-.53-.5v-1c0-33,0-61.46-10.76-82.11-12-23-36.9-33.89-75.88-34.41Z" transform="translate(-56.6 -25.84)" style="fill:#303030"/><path d="M118.31,183.29s4.28,4.28,12.84,4S143.67,182,143.67,182s-3.62,8.23-11.53,8.89S118.31,183.29,118.31,183.29Z" transform="translate(-56.6 -25.84)" style="fill:#bfa78f;fill-rule:evenodd"/><ellipse cx="44.24" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><ellipse cx="104.54" cy="115.64" rx="28.15" ry="35.97" style="fill:#fff"/><circle class="eye" id="eye-left" cx="35.9" cy="121.66" r="10.5" style="fill:#303030"/><circle class="eye" cx="94.57" cy="121.66" r="10.5" style="fill:#303030"/><path d="M140.74,236.63h0c-16.92,0-29.43-4.38-29.43-18.42h0c0-4.22,4.12-7.64,9.21-7.64H160c3.6,0,6.53,2.42,6.53,5.42v7.23C166.55,234.48,154.32,236.63,140.74,236.63Z" transform="translate(-56.6 -25.84)" style="fill:#2d251d;fill-rule:evenodd"/><path d="M160,210.57h-39.5c-5.9,0-9.21,3.42-9.21,7.64,0,.7,0,.15,0,.22,7.57,2.29,17.6,3.2,29,3.2h0c9.87,0,19.24-.52,26.25-2.36V216C166.55,213,163.62,210.57,160,210.57Z" transform="translate(-56.6 -25.84)" style="fill:#fff"/></svg>';
	document.head.insertAdjacentHTML('beforeend','<style>.sg { width: 35px; height: 35px; position: fixed; bottom: 10px; right: 10px; } .sg .eye { -webkit-transform: translateX(0px);   transform: translateX(0px); } .sg:hover .eye { -webkit-transition: -webkit-transform 0.2s ease; transition: -webkit-transform 0.2s ease; transition: transform 0.2s ease; transition: transform 0.2s ease, -webkit-transform 0.2s ease; -webkit-transform: translateX(12px);   transform: translateX(12px); }</style>');
	var a = document.createElement('a');
	a.setAttribute('href','http://KenTopDeveloper.github.io');
	a.setAttribute('target','_blank');
	a.innerHTML = icon;
 	document.body.appendChild(a);
})();
