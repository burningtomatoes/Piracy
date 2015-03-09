var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    prefabs: null,

    map: null,

    initialized: false,
    started: false,

    $game: null,

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

    update: function () {
        if (!this.initialized) {
            return;
        }

        Camera.update();
        World.update();
        PlayerControls.update();
        Keyboard.update();
    }
};