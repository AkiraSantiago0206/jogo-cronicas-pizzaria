// js/scenes/GameOverScene.js

class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.finalScore = data.score;
    }

    create() {
        console.log("Cena de Fim de Jogo criada!");

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 150, 'Fim de Jogo!', { 
            fontSize: '64px', fill: '#ff0000', stroke: '#000', strokeThickness: 8 
        }).setOrigin(0.5);

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, `Sua pontuação final: ${this.finalScore}`, { 
            fontSize: '48px', fill: '#FFF'
        }).setOrigin(0.5);

        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Jogar Novamente', { 
            fontSize: '48px', fill: '#00ff00' 
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            console.log("Reiniciando o jogo...");
            this.scene.start('GameScene');
        });

        restartButton.on('pointerover', () => { restartButton.setFill('#ff0'); });
        restartButton.on('pointerout', () => { restartButton.setFill('#00ff00'); });
    }
}