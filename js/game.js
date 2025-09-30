// game.js - Passo 4: Adicionando Feedback Dinâmico ao Jogador

class PizzaScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PizzaScene' });
    }

    preload() {
        console.log("Carregando assets...");
        this.load.image('background', 'assets/background.png');
        this.load.image('pizza_base', 'assets/pizza_base.png');
        this.load.image('pizza_molho', 'assets/pizza_molho.png');
        this.load.image('molho_icone', 'assets/molho_icone.png');
        this.load.image('pizza_queijo', 'assets/pizza_queijo.png');
        this.load.image('queijo_icone', 'assets/queijo_icone.png');
        this.load.image('pizza_calabresa', 'assets/pizza_calabresa.png'); 
        this.load.image('calabresa_icone', 'assets/calabresa_icone.png');
        this.load.image('finalizar_btn', 'assets/finalizar_btn.png');
    }

    create() {
        console.log("O jogo começou!");
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');
        
        this.pizza = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'pizza_base');
        
        this.gameState = {
            temMolho: false,
            temQueijo: false,
            temCalabresa: false
        };

        const style = { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 5 };
        this.textoInstrucao = this.add.text(50, 120, '', style);

        let botaoMolho = this.add.image(150, 600, 'molho_icone').setInteractive().setScale(0.5);
        botaoMolho.on('pointerdown', () => {
            if (!this.gameState.temMolho) {
                this.pizza.setTexture('pizza_molho');
                this.gameState.temMolho = true;
                this.atualizarTextoDeInstrucao();
            }
        });

        let botaoQueijo = this.add.image(300, 600, 'queijo_icone').setInteractive().setScale(0.5);
        botaoQueijo.on('pointerdown', () => {
            if (this.gameState.temMolho === true && !this.gameState.temQueijo) {
                this.pizza.setTexture('pizza_queijo');
                this.gameState.temQueijo = true; 
                this.atualizarTextoDeInstrucao();
            }
        });

        let botaoCalabresa = this.add.image(450, 600, 'calabresa_icone').setInteractive().setScale(0.2);
        botaoCalabresa.on('pointerdown', () => {
            if (this.gameState.temQueijo === true && !this.gameState.temCalabresa) {
                this.pizza.setTexture('pizza_calabresa');
                this.gameState.temCalabresa = true;
                this.botaoFinalizar.setVisible(true);
                this.atualizarTextoDeInstrucao();
            }
        });

        this.botaoFinalizar = this.add.image(config.width - 200, 600, 'finalizar_btn').setInteractive().setVisible(false);
        this.botaoFinalizar.on('pointerdown', () => {
            console.log("Pedido finalizado! Resetando...");
            this.pizza.setTexture('pizza_base');
            this.gameState = { temMolho: false, temQueijo: false, temCalabresa: false };
            this.botaoFinalizar.setVisible(false);
            this.atualizarTextoDeInstrucao();
        });
        
        this.add.text(50, 50, 'Crônicas da Pizzaria', { fontSize: '48px', fill: '#FFF', stroke: '#000', strokeThickness: 6 });

        this.atualizarTextoDeInstrucao();
    }

    update() {
        // ...
    }

    atualizarTextoDeInstrucao() {
        if (!this.gameState.temMolho) {
            this.textoInstrucao.setText('Passo 1: Adicione o molho.');
        } else if (!this.gameState.temQueijo) {
            this.textoInstrucao.setText('Passo 2: Adicione o queijo.');
        } else if (!this.gameState.temCalabresa) {
            this.textoInstrucao.setText('Passo 3: Adicione a calabresa.');
        } else {
            this.textoInstrucao.setText('Pizza pronta! Finalize o pedido.');
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1368,
    height: 720,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PizzaScene] 
};

const game = new Phaser.Game(config);