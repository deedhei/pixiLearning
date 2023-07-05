import React, { useEffect } from "react";
import siyu from "../../images/siyu.png";
import bql from "../../images/bql.png";
import siyuxiao from "../../images/siyuxiao.jpg";
import siyuku from "../../images/siyuku.gif";
// import * as PIXI from "pixi.js";
import * as PIXI from "pixi.js";

export default function Game() {
  useEffect(() => {
    initGame();
  }, []);

  return <div></div>;
}

const imgList = {
  door: "https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/295b261bcedf492b94d638c67d5c102c~tplv-k3u1fbpfcp-watermark.image?",
  map: "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb3b6bbdbe7040da823c15f9e33436f2~tplv-k3u1fbpfcp-watermark.image?",
  npc: siyu,
  box: bql,
  monster:
    "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d7188ff24d964ce29879c99a90fd7ec5~tplv-k3u1fbpfcp-watermark.image?",
};

/**
 * @description: 初始化游戏
 * @return {*}
 */
const initGame = () => {
  const {
    Application,
    Sprite,
    Container,
    Loader: { shared },
    Text,
    TextStyle,
    utils: { TextureCache },
    Graphics,
  } = PIXI;

  const app = new Application({
    width: window.innerWidth - 10,
    height: window.innerHeight - 10,
    antialias: true,
    backgroundAlpha: 1,
    resolution: 1,
  });

  document.body.appendChild(app.view);

  let gameScene,
    npc,
    door,
    box,
    map,
    monster,
    state,
    gameOverScene,
    monsters,
    message,
    healthBar,
    title;

  shared.add(imgList.box).load(setup);

  function setup() {
    console.log("加载完成");

    // 游戏场景：主舞台
    gameScene = new Container();
    gameScene.sortableChildren = true;
    gameScene.width = window.innerWidth;
    gameScene.height = window.innerHeight;

    app.stage.addChild(gameScene);

    // 地图
    map = new Sprite.from(imgList.map);
    map.zIndex = -1;
    map.width = window.innerWidth;
    map.height = window.innerHeight;
    gameScene.addChild(map);

    // npc人物
    npc = new Sprite.from(imgList.npc);
    npc.vx = 0;
    npc.vy = 0;
    npc.width = 100;
    npc.height = 150;
    gameScene.addChild(npc);

    // 出口：门
    door = new Sprite.from(imgList.door);
    door.x = app.screen.width / 2;
    door.y = app.screen.height / 2;
    gameScene.addChild(door);

    // 宝箱
    box = new Sprite.from(imgList.box);
    box.width = 100;
    box.height = 100;
    box.x = gameScene.width - box.width - 200;
    box.y = gameScene.height / 2 - box.height / 2;
    gameScene.addChild(box);

    //Create the health bar
    healthBar = new Container();
    healthBar.position.set(app.stage.width - 170, 4);
    gameScene.addChild(healthBar);

    //Create the black background rectangle
    const innerBar = new Graphics();
    innerBar.beginFill(0x000000);
    innerBar.drawRect(0, 0, 128, 8);
    innerBar.endFill();
    healthBar.addChild(innerBar);

    //Create the front red rectangle
    const outerBar = new Graphics();
    outerBar.beginFill(0xff3300);
    outerBar.drawRect(0, 0, 128, 8);
    outerBar.endFill();
    healthBar.addChild(outerBar);

    healthBar.outer = outerBar;

    // 游戏结束
    gameOverScene = new Container();
    app.stage.addChild(gameOverScene);
    // 场景先隐藏起来
    gameOverScene.visible = false;
    const style = new TextStyle({
      fontFamily: "Futura",
      fontSize: 64,
      fill: "white",
    });
    message = new Text("嘻嘻", style);
    message.x = app.stage.width / 2 - 200;
    message.y = app.stage.height / 2 - 32;
    gameOverScene.addChild(message);

    // 标题
    const titleContent = new TextStyle({
      fontFamily: "Futura",
      fontSize: 30,
      fill: "orange",
    });
    title = new Text("思宇吃鸡腿", titleContent);
    title.x = app.stage.width / 2 - 100;
    title.y = 10;
    gameScene.addChild(title);

    monsters = [];
    for (let i = 0; i < 50; i++) {
      const monster = new Sprite.from(imgList.monster);
      monster.x = randomInt(0, app.stage.width);
      monster.y = randomInt(0, app.stage.height);
      monster.vy = 2;
      monsters.push(monster);
      gameScene.addChild(monster);
    }

    //Capture the keyboard arrow keys
    const left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

    //Left arrow key `press` method
    left.press = function () {
      //Change the npc's velocity when the key is pressed
      npc.vx = -5;
      npc.vy = 0;
    };

    //Left arrow key `release` method
    left.release = function () {
      //If the left arrow has been released, and the right arrow isn't down,
      //and the npc isn't moving vertically:
      //Stop the npc
      if (!right.isDown && npc.vy === 0) {
        npc.vx = 0;
      }
    };

    //Up
    up.press = function () {
      npc.vy = -5;
      npc.vx = 0;
    };
    up.release = function () {
      if (!down.isDown && npc.vx === 0) {
        npc.vy = 0;
      }
    };

    //Right
    right.press = function () {
      npc.vx = 5;
      npc.vy = 0;
    };
    right.release = function () {
      if (!left.isDown && npc.vy === 0) {
        npc.vx = 0;
      }
    };

    //Down
    down.press = function () {
      npc.vy = 5;
      npc.vx = 0;
    };
    down.release = function () {
      if (!up.isDown && npc.vx === 0) {
        npc.vy = 0;
      }
    };

    state = play;

    app.ticker.add((delta) => gameLoop(delta));
  }

  function gameLoop(delta) {
    state(delta);
  }

  function play() {
    npc.x += npc.vx;
    npc.y += npc.vy;
    contain(npc, {
      x: 28,
      y: 10,
      width: app.stage.width - 200,
      height: app.stage.height - 40,
    });
    let npcHit = false;
    let catchBox = false;
    monsters.forEach(function (blob) {
      //Move the blob
      blob.y += blob.vy;

      //Check the blob's screen boundaries
      let blobHitsWall = contain(blob, {
        x: 100,
        y: 50,
        width: app.stage.width - 200,
        height: app.stage.height - 40,
      });
      //If the blob hits the top or bottom of the stage, reverse
      //its direction
      if (blobHitsWall === "top" || blobHitsWall === "bottom") {
        blob.vy *= -1;
      }

      //Test for a collision. If any of the enemies are touching
      //the npc, set `npcHit` to `true`
      if (hitTestRectangle(npc, blob)) {
        npcHit = true;
      }
    });
    if (npcHit) {
      //Make the explorer semi-transparent
      npc.alpha = 0.5;

      //Reduce the width of the health bar's inner rectangle by 1 pixel
      healthBar.outer.width -= 1;
    } else {
      //Make the explorer fully opaque (non-transparent) if it hasn't been hit
      npc.alpha = 1;
    }
    if (hitTestRectangle(npc, box)) {
      box.x = npc.x + 8;
      box.y = npc.y + 8;
      catchBox = true;
    }
    if (healthBar.outer.width < 0) {
      let siyu = new Sprite.from(siyuku);
      siyu.width = 300;
      siyu.height = 350;
      siyu.x = 300;
      siyu.y = app.stage.height / 2;
      siyu.anchor.set(0.5);
      gameOverScene.addChild(siyu);
      state = end;

      message.text = "我吃不到鸡腿 呜呜呜 哭死我算了";
    }
    if (hitTestRectangle(npc, door) && catchBox) {
      let siyu = new Sprite.from(siyuxiao);
      siyu.width = 300;
      siyu.height = 350;
      siyu.x = 300;
      siyu.y = app.stage.height / 2;
      siyu.anchor.set(0.5);
      gameOverScene.addChild(siyu);
      state = end;
      message.text = "吃到鸡腿了 呀呼！！！";
    }
  }

  function contain(sprite, container) {
    let collision = undefined;

    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision = "left";
    }

    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision = "top";
    }

    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision = "right";
    }

    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision = "bottom";
    }

    //Return the `collision` value
    return collision;
  }
  function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
  }

  function keyboard(keyCode) {
    const key = {};
    key.code = keyCode;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
      }
      event.preventDefault();
    };

    //The `upHandler`
    key.upHandler = function (event) {
      if (event.keyCode === key.code) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
      }
      event.preventDefault();
    };

    //Attach event listeners
    window.addEventListener("keydown", key.downHandler.bind(key), false);
    window.addEventListener("keyup", key.upHandler.bind(key), false);
    return key;
  }
  function hitTestRectangle(r1, r2) {
    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
        //There's definitely a collision happening
        hit = true;
      } else {
        //There's no collision on the y axis
        hit = false;
      }
    } else {
      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
  }
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
