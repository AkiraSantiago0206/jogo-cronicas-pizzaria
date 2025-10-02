// js/scenes/MainMenuScene.js

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        console.log("Carregando assets do Menu...");
        // Linhas "ativadas" para carregar as imagens
        this.load.image('menu_background', 'assets/menu_background.png');
        this.load.image('play_btn', 'assets/play_btn.png');
    }

    create() {
        console.log("Menu Principal criado!");
        
        // Linha "ativada" para exibir a imagem de fundo
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'menu_background');

        // Adiciona o título do jogo
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'Crônicas da Pizzaria', { 
            fontSize: '64px', 
            fill: '#FFF',
            stroke: '#000',
            strokeThickness: 8
        }).setOrigin(0.5);

        // --- BOTÃO DE IMAGEM ---
        // O botão de texto foi substituído pela imagem 'play_btn'
        const playButton = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'play_btn')
            .setInteractive()
            .setScale(0.5); // Adicionei uma escala para ajustar o tamanho, mude se precisar

        // Lógica do clique no botão (continua a mesma)
        playButton.on('pointerdown', () => {
            console.log("Botão 'Jogar' clicado! Iniciando o jogo...");
            this.scene.start('GameScene');
        });

        // Efeito de hover no botão (opcional, mas legal)
        playButton.on('pointerover', () => {
            // Aumenta um pouco o tamanho do botão ao passar o mouse
            playButton.setScale(0.6);
        });
        playButton.on('pointerout', () => {
            // Volta ao tamanho original
            playButton.setScale(0.5);
        });
    }
}