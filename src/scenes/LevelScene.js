import Phaser from 'phaser';

export class LevelScene extends Phaser.Scene {
  constructor() { super('level'); }

  init(data) {
    this.character = data.character ?? 'luis';
    this.lives = 3;
    this.enemyCharge = 0;
    this.finished = false;
    this.fragmentsCollected = 0;
    this.spawnPoint = { x: 90, y: 440 };
  }

  preload() {
    this.load.image('gamer-bg', '/assets/luis-gamer-background.png');
    this.load.image('luis-pixel', '/assets/luis-pixel.png');
    this.load.image('macheila-pixel', '/assets/macheila-pixel.png');
    this.load.image('luis-game', '/assets/luis-game-sprite.png');
    this.load.image('macheila-game', '/assets/macheila-game-sprite.png');
    this.load.image('luis-walk', '/assets/luis-game-walk.png');
    this.load.image('macheila-walk', '/assets/macheila-game-walk.png');
    this.load.image('enemy-skeleton', '/assets/enemy-skeleton.png');
    this.load.image('enemy-zombie', '/assets/enemy-zombie.png');
    this.load.image('kiro-guide', '/assets/kiro-guide.png');
    this.load.image('medical-bg', '/assets/medical-background.png');
    this.load.image('baby-cradle', '/assets/baby-cradle.png');
    this.load.image('enemy-virus', '/assets/enemy-virus.png');
  }

  create() {
    const isLuis = this.character === 'luis';
    this.worldWidth = 3200;
    this.physics.world.setBounds(0, 0, this.worldWidth, 680);
    this.cameras.main.setBounds(0, 0, this.worldWidth, 540);
    if (isLuis) this.add.image(480, 270, 'gamer-bg').setDisplaySize(960, 540).setAlpha(0.82).setScrollFactor(0);
    else this.add.image(480, 270, 'medical-bg').setDisplaySize(960, 540).setAlpha(0.88).setScrollFactor(0);

    if (!this.textures.exists('platform-pixel')) {
      const pixel = this.make.graphics({ x: 0, y: 0, add: false });
      pixel.fillStyle(0xffffff, 1).fillRect(0, 0, 2, 2);
      pixel.generateTexture('platform-pixel', 2, 2);
      pixel.destroy();
    }

    this.platforms = this.physics.add.staticGroup();
    if (isLuis) this.createLuisWorld();
    else this.createMacheilaWorld();

    this.player = this.add.image(90, 466, isLuis ? 'luis-game' : 'macheila-game').setDisplaySize(62, 68).setOrigin(0.5, 1);
    this.playerTexture = isLuis ? 'luis-game' : 'macheila-game';
    this.playerWalkTexture = isLuis ? 'luis-walk' : 'macheila-walk';
    this.playerFootOffsets = {
      idle: isLuis ? 8 : 4,
      walk: 4
    };
    this.playerFootOffset = this.playerFootOffsets.idle;
    this.playerBody = this.add.rectangle(90, 440, 38, 52, 0xffffff, 0).setVisible(false);
    this.physics.add.existing(this.playerBody);
    this.playerBody.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.playerBody, this.platforms);
    if (this.fragments) this.physics.add.overlap(this.playerBody, this.fragments, this.collectFragment, null, this);
    this.cameras.main.startFollow(this.playerBody, true, 0.09, 0.09, -170, 20);

    this.goal = this.add.ellipse(3100, 445, 62, 90, 0x374151, 0.9).setStrokeStyle(8, 0x9ca3af);
    this.physics.add.existing(this.goal, true);
    this.physics.add.overlap(this.playerBody, this.goal, () => this.reachPortal(), null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.createTouchControls();
    this.add.text(20, 18, isLuis ? 'Luis · Nivel 1: La grieta gamer' : 'Macheila · Nivel 1: Emergencia dimensional', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#111827aa', padding: { x: 10, y: 6 } }).setScrollFactor(0).setDepth(20);
    this.livesText = this.add.text(20, 62, 'VIDAS: ♥ ♥ ♥', { fontSize: '19px', color: '#fecaca', backgroundColor: '#111827aa', padding: { x: 10, y: 5 } }).setScrollFactor(0).setDepth(20);
    this.fragmentText = this.add.text(20, 98, isLuis ? 'FRAGMENTOS: 0 / 5' : 'SUMINISTROS: 0 / 5', { fontSize: '18px', color: '#ddd6fe', backgroundColor: '#111827aa', padding: { x: 10, y: 5 } }).setScrollFactor(0).setDepth(20);
    this.portalMessage = this.add.text(480, 145, '', { fontSize: '22px', color: '#ffffff', backgroundColor: '#4c1d95dd', padding: { x: 14, y: 8 } }).setOrigin(0.5).setScrollFactor(0).setDepth(30);
    this.add.text(940, 20, 'Menú', { fontSize: '20px', color: '#111827', backgroundColor: '#ffffffaa', padding: { x: 12, y: 8 } })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(20).setInteractive().on('pointerdown', () => this.scene.start('menu'));

    if (isLuis) {
      this.createBlockling();
      this.createChaser('enemy-skeleton', 1180);
      this.createChaser('enemy-zombie', 2050);
      this.createChaser('enemy-zombie', 2880);
      this.createKiroEncounter(2980);
    } else {
      this.createChaser('enemy-virus', 1050);
      this.createChaser('enemy-virus', 1850);
      this.createChaser('enemy-virus', 2550);
      this.createKiroEncounter(220);
      this.createBabyRescue();
    }
  }

  addGround(x, width) {
    return this.platforms.create(x, 520, 'platform-pixel').setDisplaySize(width, 40).setTint(0x52351f).refreshBody();
  }

  addPlatform(x, y, width, height = 24) {
    return this.platforms.create(x, y, 'platform-pixel').setDisplaySize(width, height).setTint(0x477a35).refreshBody();
  }

  createLuisWorld() {
    this.addGround(400, 800);
    this.addGround(1300, 760);
    this.addGround(2250, 900);
    this.addGround(3000, 400);

    [
      [280, 410, 210], [620, 345, 180], [840, 430, 120],
      [1060, 405, 180], [1370, 330, 210], [1610, 430, 120],
      [1900, 400, 180], [2180, 320, 210], [2480, 410, 180],
      [2750, 360, 130], [2940, 300, 190]
    ].forEach(([x, y, width]) => this.addPlatform(x, y, width));

    this.fragments = this.physics.add.staticGroup();
    [[280, 370], [620, 305], [1370, 290], [2180, 280], [2940, 260]].forEach(([x, y]) => {
      this.fragments.create(x, y, 'platform-pixel').setDisplaySize(22, 22).setTint(0xa855f7).setAngle(45).refreshBody();
    });
  }

  createMacheilaWorld() {
    this.addGround(420, 840);
    this.addGround(1320, 760);
    this.addGround(2240, 900);
    this.addGround(3020, 360);
    [[320, 400, 180], [650, 325, 190], [980, 420, 130], [1250, 350, 200],
      [1580, 280, 180], [1880, 410, 160], [2180, 330, 210], [2520, 400, 180],
      [2780, 320, 150]].forEach(([x, y, width]) => this.addPlatform(x, y, width));
    this.fragments = this.physics.add.staticGroup();
    [[320, 360], [650, 285], [1250, 310], [2180, 290], [2780, 280]].forEach(([x, y]) => {
      this.fragments.create(x, y, 'platform-pixel').setDisplaySize(24, 18).setTint(0x22d3ee).refreshBody();
    });
  }

  collectFragment(_player, fragment) {
    fragment.disableBody(true, true);
    this.fragmentsCollected += 1;
    this.fragmentText.setText(`${this.character === 'luis' ? 'FRAGMENTOS' : 'SUMINISTROS'}: ${this.fragmentsCollected} / 5`);
    this.cameras.main.flash(120, 168, 85, 247, false);
    if (this.fragmentsCollected === 5) {
      if (this.character === 'luis') this.goal.setFillStyle(0x6d28d9, 0.9).setStrokeStyle(8, 0xc084fc);
      this.showPortalMessage(this.character === 'luis' ? '¡Portal activado! Llega hasta la salida.' : '¡Suministros completos! Ahora rescata al bebé.');
    }
  }

  reachPortal() {
    if (this.fragmentsCollected < 5) {
      this.showPortalMessage(`Faltan ${5 - this.fragmentsCollected} ${this.character === 'luis' ? 'fragmentos' : 'suministros'} para activar el portal`);
      return;
    }
    if (this.character === 'macheila' && !this.babyRescued) {
      this.showPortalMessage('Primero debes rescatar al bebé');
      return;
    }
    this.win();
  }

  showPortalMessage(message) {
    this.portalMessage.setText(message).setVisible(true);
    this.time.delayedCall(1800, () => this.portalMessage?.setText(''));
  }

  createBlockling() {
    this.enemy = this.add.rectangle(590, 455, 44, 62, 0x32a852).setStrokeStyle(5, 0x14532d);
    this.physics.add.existing(this.enemy);
    this.enemy.body.setCollideWorldBounds(true).setVelocityX(-80).setBounce(1, 0);
    this.physics.add.collider(this.enemy, this.platforms);
    this.add.text(590, 452, '▪ ▪\n ▾', { fontSize: '16px', color: '#052e16', align: 'center' }).setOrigin(0.5);
    this.warning = this.add.text(480, 115, '', { fontSize: '24px', fontStyle: 'bold', color: '#fee2e2', backgroundColor: '#991b1bcc', padding: { x: 12, y: 7 } }).setOrigin(0.5).setScrollFactor(0).setDepth(25);
  }

  createChaser(texture, x) {
    this.chasers ??= [];
    const body = this.add.rectangle(x, 450, 38, 54, 0xffffff, 0).setVisible(false);
    this.physics.add.existing(body);
    body.body.setCollideWorldBounds(true);
    this.physics.add.collider(body, this.platforms);
    this.physics.add.overlap(body, this.playerBody, () => this.hitByChaser(), null, this);
    const sprite = this.add.image(x, 475, texture).setDisplaySize(texture === 'enemy-skeleton' ? 56 : 62, 70).setOrigin(0.5, 1);
    let bow = null;
    if (texture === 'enemy-skeleton') {
      bow = this.add.graphics();
      bow.lineStyle(4, 0x8b5a2b, 1).beginPath().arc(0, 0, 13, -1.3, 1.3).strokePath();
      bow.lineStyle(2, 0xf5deb3, 1).lineBetween(4, -13, 4, 13);
    }
    this.chasers.push({ body, sprite, texture, bow, nextJump: 0, nextShot: 0 });
  }

  createKiroEncounter(x) {
    this.kiro = this.add.image(x, 493, 'kiro-guide').setDisplaySize(76, 76).setOrigin(0.5, 1);
    const zone = this.add.zone(x, 455, 150, 100);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.playerBody, zone, () => this.showKiroLore(), null, this);
  }

  showKiroLore() {
    if (this.kiroSpoken || this.loreOpen) return;
    this.kiroSpoken = true;
    this.loreOpen = true;
    this.physics.pause();
    this.add.rectangle(480, 270, 780, 310, 0x111827, 0.96).setScrollFactor(0).setDepth(50);
    this.add.image(265, 270, 'kiro-guide').setDisplaySize(155, 155).setScrollFactor(0).setDepth(51);
    this.add.text(375, 155, 'KIRO', { fontSize: '27px', fontStyle: 'bold', color: '#67e8f9' }).setScrollFactor(0).setDepth(51);
    const lore = this.character === 'luis'
      ? 'Luis, la incursión separó este mundo en\ndimensiones distintas. Macheila sigue con vida,\npero solo podrán escapar cuando vuelvan a estar juntos.\n\nYo te ayudaré y estaré en contacto contigo\ndurante todos los niveles.'
      : 'Macheila, esta dimensión necesita tu ayuda.\nRecoge cinco suministros médicos y atraviesa\nla infección dimensional. Al final encontrarás\na un bebé atrapado en una cuna de energía.\n\nRescátalo y el portal podrá abrirse.';
    this.add.text(375, 200, lore,
      { fontSize: '19px', color: '#f8fafc', lineSpacing: 7 }).setScrollFactor(0).setDepth(51);
    const close = this.add.text(590, 385, 'Entendido', { fontSize: '21px', backgroundColor: '#6d28d9', padding: { x: 22, y: 11 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(51).setInteractive();
    close.on('pointerdown', () => {
      this.children.getAll().filter(child => child.depth >= 50).forEach(child => child.destroy());
      this.loreOpen = false;
      this.physics.resume();
    });
  }

  createBabyRescue() {
    this.baby = this.add.image(2940, 485, 'baby-cradle').setDisplaySize(82, 92).setOrigin(0.5, 1);
    const zone = this.add.zone(2940, 445, 100, 100);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.playerBody, zone, () => {
      if (this.babyRescued) return;
      if (this.fragmentsCollected < 5) {
        this.showPortalMessage('Necesitas los cinco suministros para abrir la cuna');
        return;
      }
      this.babyRescued = true;
      this.baby.setTint(0x86efac);
      this.goal.setFillStyle(0x6d28d9, 0.9).setStrokeStyle(8, 0xc084fc);
      this.showPortalMessage('¡Bebé rescatado! El portal está activo.');
    });
  }

  fireArrow(chaser, direction) {
    const arrow = this.add.rectangle(chaser.body.x + direction * 28, chaser.body.y, 24, 5, 0xd6a85f);
    this.physics.add.existing(arrow);
    arrow.body.setAllowGravity(false).setVelocityX(direction * 330);
    this.physics.add.collider(arrow, this.platforms, () => arrow.destroy());
    this.physics.add.overlap(arrow, this.playerBody, () => {
      arrow.destroy();
      this.hitByChaser();
    });
    this.time.delayedCall(3500, () => arrow?.active && arrow.destroy());
  }

  hitByChaser() {
    if (this.finished || this.time.now < (this.nextEnemyHit ?? 0)) return;
    this.nextEnemyHit = this.time.now + 1300;
    this.takeDamage();
  }

  takeDamage() {
    if (this.finished) return;
    this.lives -= 1;
    this.cameras.main.shake(220, 0.018);
    this.livesText.setText(`VIDAS: ${'♥ '.repeat(this.lives).trim() || '0'}`);
    if (this.lives <= 0) {
      this.finished = true;
      this.physics.pause();
      this.add.rectangle(480, 270, 500, 170, 0x111827, 0.94).setScrollFactor(0).setDepth(40);
      this.add.text(480, 235, 'La dimensión te atrapó', { fontSize: '32px', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(41);
      this.add.text(480, 305, 'Reintentar', { fontSize: '22px', backgroundColor: '#2563eb', padding: { x: 20, y: 12 } }).setOrigin(0.5).setScrollFactor(0).setDepth(41).setInteractive().on('pointerdown', () => this.scene.restart({ character: this.character }));
    } else {
      this.playerBody.body.reset(this.spawnPoint.x, this.spawnPoint.y);
      this.enemy.body.reset(590, 455);
      this.enemy.body.setVelocityX(-80);
    }
  }

  createTouchControls() {
    this.touch = { left: false, right: false };
    const button = (x, label, key) => {
      const circle = this.add.circle(x, 465, 43, 0x111827, 0.55).setScrollFactor(0).setInteractive();
      this.add.text(x, 465, label, { fontSize: '32px' }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
      circle.activePointerId = null;
      circle.on('pointerdown', (pointer) => {
        circle.activePointerId = pointer.id;
        this.touch[key] = true;
        circle.setFillStyle(0x2563eb, 0.8);
      });
      const release = (pointer) => {
        if (circle.activePointerId !== pointer.id) return;
        circle.activePointerId = null;
        this.touch[key] = false;
        circle.setFillStyle(0x111827, 0.55);
      };
      circle.on('pointerup', release);
      circle.on('pointerout', release);
    };
    button(65, '◀', 'left');
    button(165, '▶', 'right');
    const jump = this.add.circle(885, 455, 52, 0x111827, 0.55).setScrollFactor(0).setDepth(20).setInteractive();
    this.add.text(885, 455, '▲', { fontSize: '34px' }).setOrigin(0.5).setScrollFactor(0).setDepth(21);
    jump.on('pointerdown', () => {
      jump.setFillStyle(0xdc266e, 0.85);
      this.tryJump();
    });
    const releaseJump = () => jump.setFillStyle(0x111827, 0.55);
    jump.on('pointerup', releaseJump);
    jump.on('pointerout', releaseJump);
  }

  tryJump() {
    if (this.playerBody.body.blocked.down || this.playerBody.body.touching.down) this.playerBody.body.setVelocityY(-570);
  }

  update() {
    if (this.finished) return;
    if (this.playerBody.y > 590) {
      this.takeDamage();
      return;
    }
    const left = this.cursors.left.isDown || this.touch.left;
    const right = this.cursors.right.isDown || this.touch.right;
    this.playerBody.body.setVelocityX(left ? -250 : right ? 250 : 0);
    if (left) this.player.setFlipX(true);
    if (right) this.player.setFlipX(false);
    const movingOnGround = (left || right) && this.playerBody.body.blocked.down;
    if (movingOnGround) {
      const contactFrame = Math.floor(this.time.now / 135) % 2 === 0;
      this.player.setTexture(contactFrame ? this.playerTexture : this.playerWalkTexture);
      this.playerFootOffset = contactFrame ? this.playerFootOffsets.idle : this.playerFootOffsets.walk;
      this.player.setDisplaySize(62, contactFrame ? 68 : 66);
      this.player.setAngle(0);
    } else {
      this.player.setTexture(this.playerTexture);
      this.playerFootOffset = this.playerFootOffsets.idle;
      this.player.setDisplaySize(62, 68);
      this.player.setAngle(0);
    }
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) this.tryJump();
    if (this.enemy?.active) {
      const distance = Phaser.Math.Distance.Between(this.playerBody.x, this.playerBody.y, this.enemy.x, this.enemy.y);
      if (distance < 95) {
        this.enemyCharge += this.game.loop.delta;
        this.enemy.setFillStyle(Math.floor(this.enemyCharge / 160) % 2 ? 0xf8fafc : 0x32a852);
        this.warning.setText('¡ALÉJATE! La criatura va a explotar');
        if (this.enemyCharge > 1150) {
          this.enemyCharge = 0;
          this.warning.setText('');
          this.takeDamage();
        }
      } else {
        this.enemyCharge = 0;
        this.enemy.setFillStyle(0x32a852);
        this.warning.setText('');
      }
    }
    this.chasers?.forEach((chaser) => {
      const { body, sprite, texture, bow } = chaser;
      const distance = Math.abs(this.playerBody.x - body.x);
      if (distance < 430 && Math.abs(this.playerBody.y - body.y) < 130) {
        const direction = Math.sign(this.playerBody.x - body.x);
        body.body.setVelocityX(direction * 105);
        sprite.setFlipX(direction > 0);
        const probe = new Phaser.Geom.Rectangle(body.x + direction * 34 - 6, body.body.bottom + 2, 12, 24);
        const groundAhead = this.platforms.getChildren().some(platform => Phaser.Geom.Rectangle.Overlaps(probe, platform.getBounds()));
        const shouldJump = !groundAhead || this.playerBody.y < body.y - 35;
        if (shouldJump && body.body.blocked.down && this.time.now > chaser.nextJump) {
          body.body.setVelocityY(-500);
          chaser.nextJump = this.time.now + 850;
        }
        if (texture === 'enemy-skeleton' && distance < 620 && this.time.now > chaser.nextShot) {
          this.fireArrow(chaser, direction || -1);
          chaser.nextShot = this.time.now + 1700;
        }
      } else {
        body.body.setVelocityX(0);
      }
      sprite.setPosition(body.x, body.body.bottom + 3);
      bow?.setPosition(body.x + (sprite.flipX ? 18 : -18), body.y - 2);
    });
    this.player.setPosition(this.playerBody.x, this.playerBody.body.bottom + this.playerFootOffset);
  }

  win() {
    if (this.finished) return;
    this.finished = true;
    this.physics.pause();
    localStorage.setItem(`dimensional-progress-${this.character}`, '1');
    this.add.rectangle(480, 270, 520, 190, 0x111827, 0.96).setScrollFactor(0).setDepth(40);
    this.add.text(480, 225, '¡Tutorial completado!', { fontSize: '34px', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(41);
    this.add.text(480, 278, 'Kiro seguirá contigo en el próximo nivel.', { fontSize: '19px', color: '#bae6fd' }).setOrigin(0.5).setScrollFactor(0).setDepth(41);
    this.add.text(480, 335, 'Ver mapa', { fontSize: '21px', backgroundColor: '#6d28d9', padding: { x: 22, y: 11 } })
      .setOrigin(0.5).setScrollFactor(0).setDepth(41).setInteractive().on('pointerdown', () => this.scene.start('map', { character: this.character }));
  }
}
