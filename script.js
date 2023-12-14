/** @type {HTMLCanvasElement}  */

let canvas = document.getElementById("demoCanvas");
let context = canvas.getContext("2d");

// class for Rectangle objects
class Rectangle {
  constructor(canvas, context, x, y, width, height, color, speed) {
    // determines which canvas object is going to belong to
    this.canvas = canvas;
    this.context = context;

    // rectangle properties
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;

    // velocity
    this.vx = (Math.random() - 0.5) * speed;
    this.vy = (Math.random() - 0.5) * speed;

    // acceleration
    this.ax = 0;
    this.ay = 0;

    // collision
    this.collision = false;
  }

  // creates object on canvas
  render() {
    this.context.fillStyle = this.color;

    this.context.beginPath();
    this.context.fillRect(this.x, this.y, this.width, this.height);
  }

  // moves object based on it's velocity
  move() {
    this.vx = this.vx + this.ax;
    this.vy = this.vy + this.ay;

    this.x = this.x + this.vx;
    this.y = this.y + this.vy;
  }

  // moves object to specific position
  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }

  // makes rectangles bounce off of canvas walls
  wallCollision() {
    // check for proximity with edge of the canvas, change direction of the circle if there's a collision
    if (this.x + this.width >= canvas.width) {
      this.vx = -Math.abs(this.vx);
    } else if (this.x - this.width <= 0) {
      this.vx = Math.abs(this.vx);
    }
    if (this.y + this.height >= canvas.height) {
      this.vy = -Math.abs(this.vy);
    } else if (this.y - this.height <= 0) {
      this.vy = Math.abs(this.vy);
    }
  }

  // determines if objects collided
  pointerCollision(px, py, pWidth, pHeight) {
    // gets distance between rectangles
    let distance = Math.sqrt(
      Math.pow(this.x - px, 2) + Math.pow(this.y - py, 2)
    );

    // check for collision
    if (
      px < this.x + this.width &&
      px + pWidth > this.x &&
      py < this.y + this.height &&
      pHeight + py > this.y
    ) {
      // changes color when collision happens
      this.color = "#cfc9c2";
      this.collision = true;
    } else {
      // rectangles not intersecting
      // modify the acceleration of the rectangle based on its relative position with respect to the pointer
      this.ax = (150 * ((this.x - px) / distance)) / Math.pow(distance, 2);
      this.ay = (150 * ((this.y - py) / distance)) / Math.pow(distance, 2);
    }
  }

  // pulls objects towards pointer
  pointerPull(px, py) {
    let distance = Math.sqrt(
      Math.pow(this.x - px, 2) + Math.pow(this.y - py, 2)
    );

    // resets objects velocity to start pulling them towards cursor
    this.vx = 0;
    this.vy = 0;

    // pulls objects
    this.ax = (-150 * ((this.x - px) / distance)) / Math.sqrt(distance, 2);
    this.ay = (-150 * ((this.y - py) / distance)) / Math.sqrt(distance, 2);

    // if object has collided before, it will start randomly changing colors along pointer
    if (this.collision == true) {
      this.changeColor();
    }
  }

  // randomly changes objects color
  changeColor() {
    let red = Math.floor(Math.random() * 256),
      green = Math.floor(Math.random() * 256),
      blue = Math.floor(Math.random() * 256);

    this.color = "rgb(" + red + "," + green + "," + blue + ")";
  }
}

// creates a random number of rectangles between 30 and 50 (inclusive)
let rectangles = [];
let numberOfRectangles = Math.random() * (50 - 30) + 30;

for (let i = 0; i < numberOfRectangles; i++) {
  rectangles.push(
    new Rectangle(
      canvas,
      context,
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 10 + 25,
      Math.random() * 10 + 20,
      "#bb9af7",
      5
    )
  );
}

// mouse events
let mouseX = canvas.width,
  mouseY = canvas.height;

let pointer = new Rectangle(
  canvas,
  context,
  mouseX,
  mouseY,
  25,
  25,
  "#2ac3de",
  0
);

let canvasBox = canvas.getBoundingClientRect();

canvas.addEventListener("mousemove", (event) => {
  // updates mouse coordinates
  mouseX = event.offsetX - pointer.width / 2;
  mouseY = event.offsetY - pointer.height / 2;

  // scale to the resized canvas
  mouseX = mouseX * (canvas.width / canvasBox.width);
  mouseY = mouseY * (canvas.height / canvasBox.height);
});

startGame();

function startGame() {
  updateGame();
  window.requestAnimationFrame(drawGame);
}

function updateGame() {
  // game and animation logic goes in here
  pointer.moveTo(mouseX, mouseY);

  rectangles.forEach((rectangle) => {
    rectangle.move();
    rectangle.wallCollision();
    rectangle.pointerCollision(
      pointer.x,
      pointer.y,
      pointer.width,
      pointer.height
    );
  });

  // change the number of milliseconds to adjust frame rate
  // adjusted to be at 60 FPS
  window.setTimeout(updateGame, 16);
}

function drawGame() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // rendering happens here
  rectangles.forEach((rectangle) => {
    rectangle.render();
  });
  pointer.render();

  window.requestAnimationFrame(drawGame);
}

// detects if mouse button if being held down
let isMouseDown = false;
let mouseInterval;

canvas.addEventListener("mousedown", () => {
  isMouseDown = true;
  mouseInterval = setInterval(() => {
    // if mouse button is being held down, methods will be executed in a interval of 100 milliseconds
    if (isMouseDown) {
      pointer.changeColor();
      rectangles.forEach((rectangle) => {
        rectangle.pointerPull(pointer.x, pointer.y);
      });
    }
  }, 100);
});

// detects mouse button is not being held anymore
window.addEventListener("mouseup", () => {
  clearInterval(mouseInterval);
  isMouseDown = false;
});
