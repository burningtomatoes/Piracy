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

    goldPieces: 0,

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
        this.goldPieces = 0;

        this.syncHud();
    },

    start: function () {
        this.clear();

        World.start();

        BootLogo.show(function () {
            this.$game.stop().fadeIn('fast');
        }.bind(this));
    },

    addGold: function (amt) {
        if (amt == 0) {
            return;
        }

        if (amt > 0) {
            AudioOut.playSfx('coin_pickup.wav', 1.0);
        }

        this.goldPieces += amt;
        this.syncHud();
    },

    syncHud: function () {
        var $hud = $('#hud');

        var $goldInciatro = $hud.find('.gold span');
        var $frInciatro = $hud.find('.friendlies span');
        var $enInciatro = $hud.find('.enemies span');

        var friendlyBoat = World.playerBoat;

        if (friendlyBoat != null) {
            $frInciatro.text(friendlyBoat.getCrewAlive() + '/' + friendlyBoat.getCrewTotal());
            $frInciatro.parent().show();
        } else {
            $frInciatro.parent().hide();
        }

        var enemyBoat = World.inEncounter ? World.enemyBoats[0] : null;

        if (enemyBoat != null && enemyBoat.crew.length > 0) {
            $enInciatro.text(enemyBoat.getCrewAlive() + '/' + enemyBoat.getCrewTotal());
            $enInciatro.parent().show();
        } else {
            $enInciatro.parent().hide();
        }

        $goldInciatro.text(this.goldPieces + 'G');
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
        } else if (Keyboard.wasKeyPressed(KeyCode.ENTER) || Keyboard.wasKeyPressed(KeyCode.RETURN)) {
            $('#gameover').hide();
            Game.isGameOver = false;
            this.start();
        }

        Keyboard.update();
    }
};