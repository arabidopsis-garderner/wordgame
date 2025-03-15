const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    parent: 'game',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let targets, cards;

function preload() {
    // 可以在这里加载图片资源（如卡通背景），此处使用纯色和文本
}

function create() {
    // 数据：拼音和汉字对应
    const pairs = [
        { pinyin: 'nǐ', hanzi: '你' },
        { pinyin: 'hǎo', hanzi: '好' },
        { pinyin: 'ma', hanzi: '吗' }
    ];

    // 创建拼音目标方块
    targets = this.add.group();
    pairs.forEach((pair, index) => {
        const target = this.add.rectangle(150 + index * 150, 200, 100, 100, 0xcccccc)
            .setStrokeStyle(2, 0x000000);
        target.pinyin = pair.pinyin;
        const text = this.add.text(150 + index * 150, 200, pair.pinyin, {
            fontFamily: 'Comic Sans MS',
            fontSize: '24px',
            color: '#000000'
        }).setOrigin(0.5);
        targets.add(target);
    });

    // 创建汉字卡片
    cards = this.add.group();
    const shuffledHanzi = pairs.map(p => p.hanzi).sort(() => 0.5 - Math.random());
    shuffledHanzi.forEach((hanzi, index) => {
        const card = this.add.rectangle(150 + index * 150, 600, 100, 100, 0xffffff)
            .setStrokeStyle(2, 0x000000)
            .setInteractive({ draggable: true });
        card.hanzi = hanzi;
        const text = this.add.text(150 + index * 150, 600, hanzi, {
            fontFamily: 'Comic Sans MS',
            fontSize: '36px',
            color: '#000000'
        }).setOrigin(0.5);
        cards.add(card);

        // 点击播放发音
        card.on('pointerdown', () => {
            const utterance = new SpeechSynthesisUtterance(hanzi);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        });
    });

    // 拖动事件
    this.input.on('dragstart', (pointer, gameObject) => {
        gameObject.setData('startX', gameObject.x);
        gameObject.setData('startY', gameObject.y);
    });

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        gameObject.x = dragX;
        gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
        let matched = false;
        targets.getChildren().forEach(target => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(gameObject.getBounds(), target.getBounds())) {
                const pinyin = target.pinyin;
                const hanzi = gameObject.hanzi;
                if (pairs.some(pair => pair.pinyin === pinyin && pair.hanzi === hanzi)) {
                    gameObject.x = target.x;
                    gameObject.y = target.y;
                    target.fillColor = 0x00ff00; // 绿色
                    gameObject.disableInteractive();
                    matched = true;
                } else {
                    target.fillColor = 0xff0000; // 红色
                    this.tweens.add({
                        targets: target,
                        x: { value: target.x + 10, duration: 50, yoyo: true, repeat: 2 },
                        onComplete: () => target.fillColor = 0xcccccc
                    });
                }
            }
        });
        if (!matched) {
            gameObject.x = gameObject.getData('startX');
            gameObject.y = gameObject.getData('startY');
        }
    });

    this.input.on('gameobjectdown', (pointer, gameObject) => {
        if (gameObject.hanzi) {
            const utterance = new SpeechSynthesisUtterance(gameObject.hanzi);
            utterance.lang = 'zh-CN';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    });
}

function update() {}
