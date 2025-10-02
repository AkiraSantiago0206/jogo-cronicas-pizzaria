// js/main.js

const config = {
    type: Phaser.AUTO,
    width: 1368,
    height: 720,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: 'both'
    },
    // A lista completa de cenas. A primeira da lista é a que inicia o jogo.
    scene: [ MainMenuScene, GameScene, GameOverScene ] 
};

// Inicia o jogo
const game = new Phaser.Game(config);