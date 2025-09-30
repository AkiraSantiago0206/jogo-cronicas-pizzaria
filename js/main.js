// js/main.js

// A configuração do jogo
const config = {
    type: Phaser.AUTO,
    width: 1368,
    height: 720,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: 'both'
    },
    // A lista de todas as cenas que nosso jogo terá. Por enquanto, só uma.
    scene: [ GameScene ] 
};

// Inicia o jogo
const game = new Phaser.Game(config);