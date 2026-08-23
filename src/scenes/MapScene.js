import Phaser from 'phaser';

const assetUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`;

export class MapScene extends Phaser.Scene {
  constructor() { super('map'); }

  init(data) {
    this.character = data.character ?? 'luis';
  }

  preload() {
    this.load.image('map-luis', assetUrl('luis-pixel.png'));
    this.load.image('map-macheila', assetUrl('macheila-pixel.png'));
    this.load.image('map-gamer', assetUrl('luis-gamer-background.png'));
    this.load.image('map-medical', assetUrl('medical-background.png'));
  }

  create() {
    const isLuis = this.character === 'luis';
    const completed = localStorage.getItem(`dimensional-progress-${this.character}`) === '1';
    this.add.image(480, 270, isLuis ? 'map-gamer' : 'map-medical').setDisplaySize(960, 540).setAlpha(0.3);
    this.add.rectangle(480, 270, 960, 540, 0x0f172a, 0.64);

    this.add.text(480, 45, isLuis ? 'RUTA DE LUIS' : 'RUTA DE MACHEILA', {
      fontSize: '38px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    this.add.text(480, 88, 'Mapa dimensional', { fontSize: '21px', color: '#cbd5e1' }).setOrigin(0.5);

    this.add.image(110, 275, isLuis ? 'map-luis' : 'map-macheila').setDisplaySize(110, 170);
    this.levelCard(330, 270, 'NIVEL 1', isLuis ? 'La grieta gamer' : 'Rescate dimensional', true, completed, () => {
      this.scene.start('level', { character: this.character });
    });
    this.add.text(480, 265, '➜', { fontSize: '48px', color: completed ? '#a78bfa' : '#64748b' }).setOrigin(0.5);
    this.levelCard(650, 270, 'NIVEL 2', isLuis ? 'Mundo desconocido' : 'Nueva emergencia', completed, false, () => {
      this.showNotice('Nivel 2 desbloqueado · será la próxima aventura');
    });

    this.add.text(30, 485, '← Cambiar personaje', {
      fontSize: '20px', backgroundColor: '#1e293b', padding: { x: 16, y: 10 }
    }).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('menu'));
  }

  levelCard(x, y, title, subtitle, unlocked, completed, action) {
    const border = unlocked ? 0x8b5cf6 : 0x475569;
    const card = this.add.rectangle(x, y, 245, 250, unlocked ? 0x1e293b : 0x111827, 0.96)
      .setStrokeStyle(5, border);
    if (unlocked) card.setInteractive({ useHandCursor: true }).on('pointerdown', action);
    this.add.text(x, y - 72, unlocked ? (completed ? '✓' : '◆') : '🔒', {
      fontSize: '44px', color: completed ? '#4ade80' : '#c4b5fd'
    }).setOrigin(0.5);
    this.add.text(x, y, title, { fontSize: '27px', fontStyle: 'bold', color: unlocked ? '#ffffff' : '#94a3b8' }).setOrigin(0.5);
    this.add.text(x, y + 44, subtitle, { fontSize: '17px', color: unlocked ? '#cbd5e1' : '#64748b', align: 'center', wordWrap: { width: 210 } }).setOrigin(0.5);
    this.add.text(x, y + 88, !unlocked ? 'Completa el Nivel 1' : completed ? 'Completado · repetir' : 'Toca para jugar', {
      fontSize: '15px', color: completed ? '#86efac' : '#a5b4fc'
    }).setOrigin(0.5);
  }

  showNotice(message) {
    this.notice?.destroy();
    this.notice = this.add.text(480, 450, message, {
      fontSize: '19px', color: '#ffffff', backgroundColor: '#6d28d9', padding: { x: 18, y: 10 }
    }).setOrigin(0.5);
    this.time.delayedCall(2200, () => this.notice?.destroy());
  }
}
