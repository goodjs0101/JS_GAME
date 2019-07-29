var canvas;
var ctx;
var color = "rgba(30,30,30,.7)";
var player;
var Enemy;
var enemies = [];
var enemyIndex = 0;
var maxEnemies = 10;
var enemiesAlive = 0;
var currentFrame = 0;             
// Player 총알 생성
var bullets = [];
var bulletIndex = 0;
var shooting = false;
var oneShot = false;
// Enemy의 총알 생성 
var enemyBullets = [];
var enemyBulletIndex = 0;
// 폭발 효과 
var particles = [];
var particleIndex = 0;
var maxParticles = 20;
// Score 기록
var score = 0;
// 목숨 기록 
var life = 0;
var maxLives = 3;
// GameOver & Pause
var isGameOver = false;
var paused = false;

// 초기화 함수 
function init() {
	life = 0;
	shooting = false;
	score = 0;
	currentFrame = 0;
	oneShot = false;
	isGameOver = false;
	paused = false;

	canvas = document.getElementById("game");
	ctx = canvas.getContext("2d");
	player = new Player();

	if (enemiesAlive < 8) {
		for (var i = 0; i < this.maxEnemies; i++) {
			new Enemy();
			enemiesAlive++;
		}
	}

	window.addEventListener("keydown", buttonDown);
	window.addEventListener("keyup", buttonUp);
	window.addEventListener("keypress", keyPressed);

	invincibleMode(2000);
	loop();
}

function buttonDown(e) {
	if (e.keyCode === 32) { // 32 스페이스바
		shooting = true;
	}
	if (e.keyCode === 37) { // 37 ← 방향키
		player.movingLeft = true;
	}
	if (e.keyCode === 39) { // 39 → 방향키
		player.movingRight = true;
	}
}

function buttonUp(e) {
	if (e.keyCode === 32) {
		shooting = false;
		oneShot = false;
		e.preventDefault(); // 이벤트가 취소된다.
	}
	if (e.keyCode === 37) {
		player.movingLeft = false;
	}
	if (e.keyCode === 39) {
		player.movingRight = false;
	}
}

function keyPressed(e) {
	if (e.keyCode === 32) {
		if (!player.invincible && !oneShot) {
			player.shoot();
			oneShot = true;
		}
		e.preventDefault();
	}
}

// 정수인 난수를 발생시키기 위한 함수 
function random(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

// 무적상태
function invincibleMode(s) {
	player.invincible = true;
	setTimeout(function () {
		player.invincible = false;
	}, s);
}

// 충돌 이벤트 발생
function collision(a, b) {
	return !(
		((a.y + a.height) < (b.y)) || (a.y > (b.y + b.height)) || ((a.x + a.width) < b.x) || (a.x > (b.x + b.width))
	)
}

function clear() {
	this.ctx.fillStyle = color;
	this.ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateScore() {
	ctx.fillStyle = "white";
	ctx.font = "16px Lato, sans-serif";
	ctx.fillText("Score: " + score, 8, 20);
	ctx.fillText("Lives: " + (maxLives - life), 8, 40);
}

function pause() {
	paused = true;
}

function gameOver() {
	isGameOver = true;
	clear();
	var message = "Game Over!";
	var message2 = "Score: " + score;
	var message3 = "다시 실행하려면 F5키를 누르세요.";
	pause();
	ctx.fillStyle = "white";
	ctx.font = "bold 30px Lato, sans-serif";
	ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2 + 10);
	ctx.fillText(message2, canvas.width / 2 - ctx.measureText(message2).width / 2, canvas.width / 2, canvas.height / 2 - 5);
	ctx.font = "bold 16px Lato, sans-serif";
	ctx.fillText(message3, canvas.width / 2 - ctx.measureText(message3).width / 2, canvas.height / 2 + 30);
}

function loop() {
	if (!paused) {
		clear();
		for(var i in enemies){
			var currentEnemy = enemies[i];
			currentEnemy.draw();
			currentEnemy.update();
			if(currentFrame % currentEnemy.shootingSpeed === 0){
				currentEnemy.shoot();
			}
		}
		for(var x in enemyBullets){
			enemyBullets[x].draw();
			enemyBullets[x].update();
		}
		for (var z in bullets) {
			bullets[z].draw();
			bullets[z].update();
		}
		if (player.invincible) {
			if (currentFrame % 20 === 0) {
				player.draw();
			}
		} else {
			player.draw();
		}
		for (var i in enemies) {
			var currentEnemy = enemies[i];
			currentEnemy.draw();
			currentEnemy.update();
			if (currentFrame % currentEnemy.shootingSpeed === 0) {
				currentEnemy.shoot();
			}
		}

		for (var x in enemyBullets) {
			enemyBullets[x].draw();
			enemyBullets[x].update();
		}

		for (var i in particles) {
			particles[i].draw();
		}

		player.update();
		updateScore();
		currentFrame = requestAnimationFrame.call(window, loop);
	}
}

// Player 객체 생성
var Player = function() {
	this.width = 60;
	this.height = 20;
	this.color = 'white';
	this.x = canvas.width / 2 - this.width / 2;
	this.y = canvas.height - this.height;
	this.movingLeft = false;
	this.movingRight = false;
	this.movingUp = false;
	this.movingDowun = false;
	this.speed = 8;
	this.invincible = false;
}

Player.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}

Player.prototype.update = function () {
	if (this.movingLeft && this.x > 0) {
		this.x -= this.speed;
	}
	if (this.movingRight && this.x + this.width < canvas.width) {
		this.x += this.speed;
	}

	if (shooting && currentFrame % 10 === 0) {
		this.shoot();
	}

	for (var i in enemyBullets) {
		var currentBullet = enemyBullets[i];
		if (collision(currentBullet, this) && !player.invincible) {
			this.die();
			delete enemyBullets[i];
		}
	}
}

Player.prototype.shoot = function () {
	bullets[bulletIndex] = new Bullet(this.x + this.width / 2);
	bulletIndex++;
}

Player.prototype.die = function () {
	this.explode();
	if (life < maxLives) {
		invincibleMode(2000);
		life++;
	} else {
		gameOver();
	}
}

Player.prototype.explode = function () {
	for (var i = 0; i < maxParticles; i++) {
		new Particle(this.x + this.width / 2, this.y, this.color);
	}
}


// Bullet 객체 생성
var Bullet = function(x) {
	this.width = 8;
	this.height = 20;
	this.x = x-4;
	this.y = canvas.height - 40;
	this.vy = 8; // Bullet 속도 설정
	this.index = bulletIndex;
	this.active = true;
	this.color = "white";
}

Bullet.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}

Bullet.prototype.update = function () {
	this.y -= this.vy;
	// 총알이 화면 밖으로 나가면 삭제
	if (this.y < 0) {
		delete bullets[this.index]; 
	}
}

// enemy(적) 객체 생성
var Enemy = function() {
	this.width = 60;
	this.height = 20;
	this.x = random(0, (canvas.width - this.width));
	this.y = random(10, 40);
	this.vy = random(1, 3) * .1;
	this.index = enemyIndex;
	enemies[enemyIndex] = this;
	enemyIndex++;
	this.speed = random(1, 3);
	this.shootingSpeed = random(50, 100);
	this.movingLeft = Math.random() < 0.5 ? true : false; // 삼항 조건 연산자
	this.color = "hsl(" + random(0, 360) + ", 100%, 70%)"; // hsl(hue, saturation, lightness)
}

Enemy.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}

Enemy.prototype.update = function () {
	if (this.movingLeft) {
		if (this.x > 0) {
			this.x -= this.speed;
			this.y += this.vy;
		} else {
			this.movingLeft = false;
		}
	} else {
		if (this.x + this.width < canvas.width) {
			this.x += this.speed;
			this.y += this.vy;
		} else {
			this.movingLeft = true;
		}
	}

	for (var i in bullets) {
		var currentBullet = bullets[i];
		if (collision(currentBullet, this)) {
			this.die();
			delete bullets[i];
		}
	}
}

Enemy.prototype.die = function () {
	this.explode();
	delete enemies[this.index];
	score += 15;
	enemiesAlive = enemiesAlive > 1 ? enemiesAlive - 1 : 0;
	if (enemiesAlive <= maxEnemies) {
		enemiesAlive++;
		setTimeout(function () { new Enemy(); }, 500);
	}
}

Enemy.prototype.shoot = function () {
	new EnemyBullet(this.x + this.width / 2, this.y, this.color);
}

Enemy.prototype.explode = function () {
	for (var i = 0; i < maxParticles; i++) {
		new Particle(this.x + this.width / 2, this.y, this.color);
	}
}

var EnemyBullet = function(x, y, color) {
	this.width = 8;
	this.height = 20;
	this.x = x-4;
	this.y = y;
	this.vy = 6;
	this.color = color;
	this.index = enemyBulletIndex;
	enemyBullets[enemyBulletIndex] = this;
	enemyBulletIndex++;
}

EnemyBullet.prototype.draw = function () {
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
}

EnemyBullet.prototype.update = function () {
	this.y += this.vy;
	if (this.y > canvas.height) {
		delete enemyBullets[this.index];
	}
}

// enemy(적)가 파괴될때 효과
var Particle = function(x, y, color) {
	this.x = x;
	this.y = y;
	this.vx = random(-10, 10);
	this.vy = random(-10, 10);
	this.color = color;
	particles[particleIndex] = this;
	this.id = particleIndex;
	particleIndex++;
	this.life = 0;
	this.gravity = 0.5;
	this.size = 20;
	this.maxlife = 100;
}

Particle.prototype.draw = function () {
	this.x += this.vx;
	this.y += this.vy;
	this.vy += this.gravity;
	this.size *= .89;
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.size, this.size);
	this.life++;
	if (this.life >= this.maxlife) {
		delete particles[this.id];
	}
}