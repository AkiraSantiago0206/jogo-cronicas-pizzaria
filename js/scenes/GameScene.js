class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log("Carregando assets da GameScene...");
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
        console.log("GameScene criada!");
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background');

        this.sceneLayout = {
            pizza: { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2, scale: 1.0, validRadius: 140 },
            forno: { 
                x: (this.cameras.main.width / 2) - 500, y: 500, scale: 0.7,
                progressBar: {
                    width: 300,
                    height: 30,
                    y_offset: -120
                }
            },
            uiTop: { comanda: { x: this.cameras.main.width - 180, y: 260, scale: 1.0 }, textoPedido: { style: { fontSize: '24px', fill: '#000' }, ingredientes: { x_offset: -115, y_offset: -76 }, calabresas:   { x_offset: -115, y_offset: -32 }}, botaoNovoPedido: { x: this.cameras.main.width - 180, y: 370, scale: 0.3 }},
            uiBottomBar: { baseY: 600, startX: 530, spacing: 150, molho: { scale: 0.4 }, queijo: { scale: 0.4 }, calabresa: { scale: 0.2 }, botaoFinalizar: { x: this.cameras.main.width - 200, y: 600, scale: 1.0 }},
            toppings: { calabresa: { scale: 0.1 } }
        };
        
        this.pizzaContainer = this.add.container(this.sceneLayout.pizza.x, this.sceneLayout.pizza.y);
        const pizzaBase = this.add.image(0, 0, 'pizza_base');
        this.pizzaBase = pizzaBase;
        this.pizzaContainer.add(this.pizzaBase);
        const hitArea = new Phaser.Geom.Circle(0, 0, this.sceneLayout.pizza.validRadius);
        this.pizzaContainer.setInteractive(hitArea, Phaser.Geom.Circle.Contains);
        this.pizzaContainer.setDepth(1);

        this.toppingsGroup = this.add.group();
        this.gameState = {};
        this.pedidoAtual = {};

        this.fornoImg = this.add.image(this.sceneLayout.forno.x, this.sceneLayout.forno.y, 'forno_desligado').setScale(this.sceneLayout.forno.scale).setDepth(2);
        const zonaForno = this.add.zone(this.fornoImg.x, this.fornoImg.y, this.fornoImg.width * this.sceneLayout.forno.scale, this.fornoImg.height * this.sceneLayout.forno.scale).setRectangleDropZone(this.fornoImg.width * this.sceneLayout.forno.scale, this.fornoImg.height * this.sceneLayout.forno.scale);
        
        this.progressBar = this.add.graphics().setVisible(false).setDepth(3);
        this.progressBox = this.add.graphics().setVisible(false).setDepth(3);
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
        this.input.on('drop', (pointer, container, zona) => { if (container === this.pizzaContainer && !this.gameState.isBaking) { this.fornoImg.setTexture('forno_ligado'); container.setVisible(false); this.input.setDraggable(container, false); this.iniciarCozimento(8000); }});

        botaoNovoPedido.on('pointerdown', () => { this.gerarNovoPedido(); });
        botaoMolho.on('pointerdown', () => { if (!this.gameState.molhoAplicado) { this.pizzaBase.setTexture('pizza_molho'); this.gameState.molhoAplicado = true; }});
        botaoQueijo.on('pointerdown', () => { if (this.gameState.molhoAplicado && !this.gameState.queijoAplicado) { this.pizzaBase.setTexture('pizza_queijo'); this.gameState.queijoAplicado = true; }});
        botaoCalabresa.on('pointerdown', () => { if (this.gameState.queijoAplicado) { this.gameState.ingredienteSelecionado = 'calabresa'; }});

        this.pizzaContainer.on('pointerdown', (pointer) => {
            if (this.gameState.isBaking) {
                this.retirarPizzaDoForno();
            }
            else if (this.gameState.ingredienteSelecionado === 'calabresa') {
                const localPoint = this.pizzaContainer.getLocalPoint(pointer.x, pointer.y);
                const distance = Phaser.Math.Distance.Between(0, 0, localPoint.x, localPoint.y);
                if (distance <= this.sceneLayout.pizza.validRadius) {
                    const topping = this.add.image(localPoint.x, localPoint.y, 'calabresa_unidade');
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
        
        this.botaoFinalizar.on('pointerdown', () => { this.calcularPontuacao(); this.gerarNovoPedido(); });
        
        this.gameTime = 90;
        this.timerText = this.add.text(this.cameras.main.width / 2, 50, `Tempo: ${this.gameTime}`, { fontSize: '42px', fill: '#FFF', stroke: '#000', strokeThickness: 6 }).setOrigin(0.5);
        this.gameTimer = this.time.addEvent({ delay: 1000, callback: () => { this.gameTime--; this.timerText.setText(`Tempo: ${this.gameTime}`); if (this.gameTime <= 0) { this.endGame(); }}, callbackScope: this, loop: true });

        this.gerarNovoPedido();
    }
    
    iniciarCozimento(duracao) {
        this.gameState.isBaking = true;
        this.fornoImg.setTexture('forno_ligado');
        
        const pbSettings = this.sceneLayout.forno.progressBar;
        const barX = this.sceneLayout.forno.x - (pbSettings.width / 2);
        const barY = this.sceneLayout.forno.y + pbSettings.y_offset;

        this.progressBox.clear();
        this.progressBox.setVisible(true);
        this.progressBox.fillStyle(0x000000, 0.7);
        this.progressBox.fillRect(barX, barY, pbSettings.width, pbSettings.height);
        this.progressBox.lineStyle(3, 0xffffff, 0.9);
        this.progressBox.strokeRect(barX, barY, pbSettings.width, pbSettings.height);
        
        this.progressBar.setVisible(true);
        
        this.bakingTimer = this.time.addEvent({ delay: duracao, callback: this.retirarPizzaDoForno, callbackScope: this });
        this.fornoImg.setInteractive();
        this.fornoImg.on('pointerdown', this.retirarPizzaDoForno, this);
    }
    
    retirarPizzaDoForno() {
        if (!this.bakingTimer) return;
        this.gameState.isBaking = false;
        this.gameState.progressoCozimento = this.bakingTimer.getProgress();
        this.bakingTimer.remove();
        this.bakingTimer = null;
        const cozimento = this.gameState.progressoCozimento;
        let tintColor;
        if (cozimento >= 0.6 && cozimento <= 0.85) { tintColor = 0xD2B48C; } 
        else if (cozimento > 0.85) { tintColor = 0x666666; }
        if (tintColor) { this.pizzaContainer.each((child) => { child.setTint(tintColor); }); }
        this.onBakeComplete();
    }

    onBakeComplete() {
        this.gameState.isBaking = false;
        this.progressBar.clear();
        this.progressBox.clear();
        this.progressBox.setVisible(false);
        this.pizzaContainer.setVisible(true);
        this.pizzaContainer.setPosition(this.sceneLayout.pizza.x, this.sceneLayout.pizza.y);
        this.input.setDraggable(this.pizzaContainer, true);
        this.gameState.pizzaAssada = true;
        this.botaoFinalizar.setVisible(true);
        this.fornoImg.setTexture('forno_desligado');
        this.fornoImg.disableInteractive();
    }

    update() {
        if (this.bakingTimer) {
            const pbSettings = this.sceneLayout.forno.progressBar;
            const barX = this.sceneLayout.forno.x - (pbSettings.width / 2);
            const barY = this.sceneLayout.forno.y + pbSettings.y_offset;
            const padding = 4;

            const progresso = this.bakingTimer.getProgress();
            this.progressBar.clear();
            
            if (progresso >= 0.6 && progresso <= 0.85) { this.progressBar.fillStyle(0x00ff00, 1); } 
            else if (progresso > 0.85) { this.progressBar.fillStyle(0xff0000, 1); } 
            else { this.progressBar.fillStyle(0xffff00, 1); }
            
            this.progressBar.fillRect(barX + padding, barY + padding, (pbSettings.width - 2 * padding) * progresso, pbSettings.height - 2 * padding);
        }
    }

    calcularPontuacao() {
        let pontuacaoDoPedido = 100;
        let erros = [];
        if (!this.gameState.molhoAplicado) { pontuacaoDoPedido -= 25; erros.push("esqueceu o molho"); }
        if (!this.gameState.queijoAplicado) { pontuacaoDoPedido -= 25; erros.push("esqueceu o queijo"); }
        const diffCalabresas = Math.abs(this.gameState.calabresasColocadas - this.pedidoAtual.calabresas);
        if (diffCalabresas > 0) { pontuacaoDoPedido -= diffCalabresas * 5; erros.push(`errou a calabresa por ${diffCalabresas}`); }
        if (this.gameState.pizzaAssada) {
            const cozimento = this.gameState.progressoCozimento;
            if (cozimento >= 0.6 && cozimento <= 0.85) { pontuacaoDoPedido += 25; }
            else if (cozimento > 0.85) { pontuacaoDoPedido -= 40; erros.push("pizza queimada"); }
            else { pontuacaoDoPedido -= 40; erros.push("pizza crua"); }
        } else {
            pontuacaoDoPedido -= 50; erros.push("não foi assada!");
        }
        if (pontuacaoDoPedido < 0) { pontuacaoDoPedido = 0; }
        console.log(`Pontuação do pedido: ${pontuacaoDoPedido}. Erros: ${erros.join(', ')}`);
        this.pontuacaoTotal += pontuacaoDoPedido;
        this.textoPontuacao.setText(`Pontos: ${this.pontuacaoTotal}`);
    }

    gerarNovoPedido() {
        console.log("Gerando novo pedido...");
        this.pizzaContainer.each((child) => { child.clearTint(); });
        this.toppingsGroup.clear(true, true);
        this.pizzaBase.setTexture('pizza_base');
        this.pizzaContainer.setVisible(true);
        this.pizzaContainer.x = this.sceneLayout.pizza.x;
        this.pizzaContainer.y = this.sceneLayout.pizza.y;
        this.botaoFinalizar.setVisible(false);
        this.input.setDraggable(this.pizzaContainer, false);
        if(this.progressBar) this.progressBar.clear();
        if(this.progressBox) this.progressBox.clear();
        if(this.bakingTimer) this.bakingTimer.remove();
        this.bakingTimer = null;
        this.fornoImg.disableInteractive();
        this.pedidoAtual = { molho: true, queijo: true, calabresas: Phaser.Math.Between(3, 8) };
        this.gameState = { molhoAplicado: false, queijoAplicado: false, ingredienteSelecionado: 'nenhum', calabresasColocadas: 0, pizzaAssada: false, progressoCozimento: 0 };
        this.textoPedidoIngredientes.setText('- Molho\n- Queijo');
        this.textoPedidoCalabresas.setText(`- Calabresas: ${this.pedidoAtual.calabresas}`);
    }
    
    endGame() {
        console.log("O tempo acabou! Fim de jogo.");
        this.gameTimer.remove();
        this.scene.start('GameOverScene', { score: this.pontuacaoTotal });
    }
}