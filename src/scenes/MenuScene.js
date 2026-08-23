import Phaser from 'phaser';

const assetUrl = (file) => `${import.meta.env.BASE_URL}assets/${file}`;

export class MenuScene extends Phaser.Scene {
  constructor() { super('menu'); }

  preload() {
    this.load.image('luis-pixel', assetUrl('luis-pixel.png'));
    this.load.image('macheila-pixel', assetUrl('macheila-pixel.png'));
  }

  create() {
    this.add.text(480, 70, 'DIMENSIÓN: EL REENCUENTRO', { fontSize: '42px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(480, 125, 'Elige quién inicia la aventura', { fontSize: '23px', color: '#e5e7eb' }).setOrigin(0.5);

    this.characterButton(300, 290, 0x2563eb, 'LUIS', 'Dimensión gamer', 'luis');
    this.characterButton(660, 290, 0xdc266e, 'MACHEILA', 'Dimensión médica', 'macheila');
  }

  characterButton(x, y, color, name, route, character) {
    const card = this.add.rectangle(x, y, 270, 270, 0x1f2937).setStrokeStyle(4, color).setInteractive({ useHandCursor: true });
    this.add.image(x, y - 50, `${character}-pixel`).setDisplaySize(100, 150);
    this.add.text(x, y + 48, name, { fontSize: '30px', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 88, route, { fontSize: '17px', color: '#cbd5e1' }).setOrigin(0.5);
    card.on('pointerdown', () => this.scene.start('map', { character }));
  }
}
