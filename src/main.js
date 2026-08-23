import Phaser from 'phaser';
import './style.css';
import { MenuScene } from './scenes/MenuScene.js';
import { LevelScene } from './scenes/LevelScene.js';
import { MapScene } from './scenes/MapScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#87ceeb',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 960,
    height: 540
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 1100 }, debug: false }
  },
  input: {
    activePointers: 4,
    touch: { capture: true }
  },
  scene: [MenuScene, MapScene, LevelScene]
});
