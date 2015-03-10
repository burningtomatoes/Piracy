var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    prefabs: null,

    map: null,

    initialized: false,
    started: false,

    $game: null,

    isGameOver: false,

    init: function () {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.info('[Game] Initializing Piracy - version ' + this.buildCode + '...');

        Canvas.init();
        Keyboard.bind();

        this.images = new ImageLoader();
        this.audio = new AudioLoader();
        this.prefabs = new PrefabLoader();

        this.$game = $('#game');
    },

    clear: function (cb) {
        this.$game.stop().hide();

        this.started = false;
        this.map = null;
        this.isGameOver = false;
    },

    start: function (mapId) {
        this.clear();

        World.init();

        BootLogo.show(function () {
            this.$game.stop().fadeIn('fast');
        }.bind(this));
    },

    draw: function (ctx) {
        if (!this.initialized) {
            return;
        }

        World.draw(ctx);
    },

    gameOver: function () {
        $('#gameover').slideDown();
        this.isGameOver = true;
    },

    update: function () {
        if (!this.initialized) {
            return;
        }

        Camera.update();
        World.update();

        if (!this.isGameOver) {
            PlayerControls.update();
        } else if (Keyboard.wasKeyPressed(KeyCode.SPACE)) {
            $('#gameover').hide();
            Game.isGameOver = false;
            Game.start();
        }

        Keyboard.update();
    }
};