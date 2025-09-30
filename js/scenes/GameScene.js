// js/scenes/GameScene.js

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
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
        this.load.image('comanda', 'assets/comanda.png');
        this.load.image('novo_pedido_btn', 'assets/novo_pedido_btn.png');
        this.load.image('calabresa_unidade', 'assets/calabresa_unidade.png');
        this.load.image('forno_desligado', 'assets/forno_desligado.png');
        this.load.image('forno_ligado', 'assets/forno_ligado.png');
    }

    create() {
        console.log("O jogo começou!");
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');

        this.sceneLayout = {
            pizza: { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2, scale: 1.0, validRadius: 140 },
            forno: { x: (this.cameras.main.width / 2) - 500, y: 500, scale: 0.7 },
            uiTop: { comanda: { x: config.width - 180, y: 260, scale: 1.0 }, textoPedido: { style: { fontSize: '24px', fill: '#000' }, ingredientes: { x_offset: -115, y_offset: -76 }, calabresas:   { x_offset: -115, y_offset: -32 }}, botaoNovoPedido: { x: config.width - 180, y: 370, scale: 0.3 }},
            uiBottomBar: { baseY: 600, startX: 530, spacing: 150, molho: { scale: 0.4 }, queijo: { scale: 0.4 }, calabresa: { scale: 0.2 }, botaoFinalizar: { x: config.width - 200, y: 600, scale: 1.0 }},
            toppings: { calabresa: { scale: 0.1 } }
        };
        
        this.pizzaContainer = this.add.container(this.sceneLayout.pizza.x, this.sceneLayout.pizza.y);
        const pizzaBase = this.add.image(0, 0, 'pizza_base');
        this.pizzaBase = pizzaBase;
        this.pizzaContainer.add(this.pizzaBase);
        this.pizzaContainer.setSize(this.pizzaBase.width, this.pizzaBase.height);
        this.pizzaContainer.setInteractive();

        this.toppingsGroup = this.add.group();
        this.gameState = {};
        this.pedidoAtual = {};

        this.fornoImg = this.add.image(this.sceneLayout.forno.x, this.sceneLayout.forno.y, 'forno_desligado').setScale(this.sceneLayout.forno.scale);
        const zonaForno = this.add.zone(this.fornoImg.x, this.fornoImg.y, this.fornoImg.width * this.sceneLayout.forno.scale, this.fornoImg.height * this.sceneLayout.forno.scale).setRectangleDropZone(this.fornoImg.width * this.sceneLayout.forno.scale, this.fornoImg.height * this.sceneLayout.forno.scale);
        
        this.progressBar = this.add.graphics().setVisible(false);
        this.progressBox = this.add.graphics().setVisible(false);
        this.bakingTimer = null;

        this.pontuacaoTotal = 0;
        this.textoPontuacao = this.add.text(50, 50, 'Pontos: 0', { fontSize: '32px', fill: '#FFF', stroke: '#000', strokeThickness: 5 });

        const uiTop = this.sceneLayout.uiTop;
        this.add.image(uiTop.comanda.x, uiTop.comanda.y, 'comanda').setScale(uiTop.comanda.scale);
        this.textoPedidoIngredientes = this.add.text(uiTop.comanda.x + uiTop.textoPedido.ingredientes.x_offset, uiTop.comanda.y + uiTop.textoPedido.ingredientes.y_offset, '', uiTop.textoPedido.style);
        this.textoPedidoCalabresas = this.add.text(uiTop.comanda.x + uiTop.textoPedido.calabresas.x_offset, uiTop.comanda.y + uiTop.textoPedido.calabresas.y_offset, '', uiTop.textoPedido.style);
        const botaoNovoPedido = this.add.image(uiTop.botaoNovoPedido.x, uiTop.botaoNovoPedido.y, 'novo_pedido_btn').setInteractive().setScale(uiTop.botaoNovoPedido.scale);
        
        const bottomBar = this.sceneLayout.uiBottomBar;
        let botaoMolho = this.add.image(bottomBar.startX, bottomBar.baseY, 'molho_icone').setInteractive().setScale(bottomBar.molho.scale);
        let botaoQueijo = this.add.image(bottomBar.startX + bottomBar.spacing, bottomBar.baseY, 'queijo_icone').setInteractive().setScale(bottomBar.queijo.scale);
        let botaoCalabresa = this.add.image(bottomBar.startX + (bottomBar.spacing * 2), bottomBar.baseY, 'calabresa_icone').setInteractive().setScale(bottomBar.calabresa.scale);
        this.botaoFinalizar = this.add.image(bottomBar.botaoFinalizar.x, bottomBar.botaoFinalizar.y, 'finalizar_btn').setInteractive().setScale(bottomBar.botaoFinalizar.scale).setVisible(false);

        this.input.setDraggable(this.pizzaContainer, false);

        this.input.on('dragstart', (pointer, gameObject) => { if (gameObject === this.pizzaContainer) { this.fornoImg.setTexture('forno_desligado'); }});
        this.input.on('drag', (pointer, gameObject, dragX, dragY) => { gameObject.x = dragX; gameObject.y = dragY; });
        this.input.on('drop', (pointer, container, zona) => {
            if (container === this.pizzaContainer) {
                this.fornoImg.setTexture('forno_ligado');
                container.setVisible(false);
                this.iniciarCozimento(5000);
            }
        });

        botaoNovoPedido.on('pointerdown', () => { this.gerarNovoPedido(); });
        botaoMolho.on('pointerdown', () => { if (!this.gameState.molhoAplicado) { this.pizzaBase.setTexture('pizza_molho'); this.gameState.molhoAplicado = true; }});
        botaoQueijo.on('pointerdown', () => { if (this.gameState.molhoAplicado && !this.gameState.queijoAplicado) { this.pizzaBase.setTexture('pizza_queijo'); this.gameState.queijoAplicado = true; }});
        botaoCalabresa.on('pointerdown', () => { if (this.gameState.queijoAplicado) { this.gameState.ingredienteSelecionado = 'calabresa'; }});

        this.pizzaContainer.on('pointerdown', (pointer) => {
            const clickX = pointer.x;
            const clickY = pointer.y;
            if (this.gameState.ingredienteSelecionado === 'calabresa') {
                const distance = Phaser.Math.Distance.Between(clickX, clickY, this.pizzaContainer.x, this.pizzaContainer.y);
                if (distance <= this.sceneLayout.pizza.validRadius) {
                    const localClickX = clickX - this.pizzaContainer.x;
                    const localClickY = clickY - this.pizzaContainer.y;
                    const topping = this.add.image(localClickX, localClickY, 'calabresa_unidade');
                    topping.setScale(this.sceneLayout.toppings.calabresa.scale);
                    this.pizzaContainer.add(topping);
                    this.toppingsGroup.add(topping);
                    this.gameState.calabresasColocadas++;
                    
                    if (this.gameState.calabresasColocadas >= this.pedidoAtual.calabresas) {
                        this.gameState.ingredienteSelecionado = 'nenhum';
                        this.input.setDraggable(this.pizzaContainer, true);
                    }
                }
            }
        });
        
        this.botaoFinalizar.on('pointerdown', () => {
            this.calcularPontuacao();
            this.gerarNovoPedido(); 
        });
        
        this.gerarNovoPedido();
    }

    iniciarCozimento(duracao) {
        this.progressBox.setVisible(true);
        this.progressBox.fillStyle(0x222222, 0.8);
        this.progressBox.fillRect(this.sceneLayout.forno.x - 150, this.sceneLayout.forno.y - 100, 300, 30);
        this.progressBar.setVisible(true);
        
        this.bakingTimer = this.time.addEvent({ delay: duracao, callback: this.onBakeComplete, callbackScope: this });
    }

    onBakeComplete() {
        console.log("Pizza assada!");
        this.bakingTimer = null;
        this.progressBar.clear();
        this.progressBox.setVisible(false);
        this.pizzaContainer.setVisible(true);
        this.pizzaContainer.setPosition(this.sceneLayout.pizza.x, this.sceneLayout.pizza.y);
        this.input.setDraggable(this.pizzaContainer, true);
        this.gameState.pizzaAssada = true;
        this.botaoFinalizar.setVisible(true);
        this.fornoImg.setTexture('forno_desligado');
    }

    update() {
        if (this.bakingTimer) {
            const progresso = this.bakingTimer.getProgress();
            this.progressBar.clear();
            this.progressBar.fillStyle(0x00ff00, 1);
            this.progressBar.fillRect(this.sceneLayout.forno.x - 145, this.sceneLayout.forno.y - 95, 290 * progresso, 20);
        }
    }

    calcularPontuacao() {
        let pontuacaoDoPedido = 100;
        let erros = [];
        if (!this.gameState.molhoAplicado) { pontuacaoDoPedido -= 25; erros.push("esqueceu o molho"); }
        if (!this.gameState.queijoAplicado) { pontuacaoDoPedido -= 25; erros.push("esqueceu o queijo"); }
        const diffCalabresas = Math.abs(this.gameState.calabresasColocadas - this.pedidoAtual.calabresas);
        if (diffCalabresas > 0) { pontuacaoDoPedido -= diffCalabresas * 5; erros.push(`errou a calabresa por ${diffCalabresas}`); }
        if (!this.gameState.pizzaAssada) { pontuacaoDoPedido -= 50; erros.push("pizza crua!"); }
        if (pontuacaoDoPedido < 0) { pontuacaoDoPedido = 0; }
        console.log(`Pontuação do pedido: ${pontuacaoDoPedido}. Erros: ${erros.join(', ')}`);
        this.pontuacaoTotal += pontuacaoDoPedido;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacaoTotal}`);
    }

    gerarNovoPedido() {
        console.log("Gerando novo pedido...");
        this.toppingsGroup.clear(true, true);
        
        this.pizzaBase.setTexture('pizza_base');
        
        this.pizzaContainer.setVisible(true);
        this.pizzaContainer.x = this.sceneLayout.pizza.x;
        this.pizzaContainer.y = this.sceneLayout.pizza.y;
        this.botaoFinalizar.setVisible(false);
        this.input.setDraggable(this.pizzaContainer, false);

        if(this.progressBar) this.progressBar.clear();
        if(this.progressBox) this.progressBox.setVisible(false);
        if(this.bakingTimer) this.bakingTimer.remove();
        this.bakingTimer = null;

        this.pedidoAtual = { molho: true, queijo: true, calabresas: Phaser.Math.Between(3, 8) };
        this.gameState = { molhoAplicado: false, queijoAplicado: false, ingredienteSelecionado: 'nenhum', calabresasColocadas: 0, pizzaAssada: false };
        this.textoPedidoIngredientes.setText('- Molho\n- Queijo');
        this.textoPedidoCalabresas.setText(`- Calabresas: ${this.pedidoAtual.calabresas}`);
    }
}