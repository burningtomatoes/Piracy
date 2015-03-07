var Game = {
    buildCode: 1000,

    images: null,
    audio: null,
    maps: null,

    map: null,

    initialized: false,
    started: false,

    $game: null,

    init: function () {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        console.info('[Game] Initializing Zombieland R' + this.buildCode + '...');

        Canvas.init();
        Keyboard.bind();
        Net.init();

        Chat.init();
        Hud.init();

        this.images = new ImageLoader();
        this.audio = new AudioLoader();
        this.maps = new MapLoader();

        this.$game = $('#game');

        Session.setStateObject(null);

        Router.register(Opcodes.LOAD_MAP, function (data) {
            this.loadMap(data.m);
        }.bind(this));
    },

    clear: function (cb) {
        this.$game.stop().hide();

        this.started = false;
        this.loading = false;
        this.map = null;
    },

    start: function (mapId) {
        this.clear();

        Hud.hide();
        Chat.hide();

        BootLogo.show(function () {
            this.loadMap(mapId);
        }.bind(this));
    },

    loading: false,

    loadMap: function (mapId) {
        if (this.loading) {
            return;
        }

        this.loading = true;

        Chat.hide();
        Hud.hide();

        console.info('[Map] Loading map ' + mapId + '...');

        var beginLoad = function () {
            this.map = this.maps.load(mapId + '.json');

            var loadCallback = function (success) {
                if (success) {
                    console.info('[Map] Map loaded successfully.');
                    this.$game.fadeIn(200);
                    this.loading = false;

                    if (!Session.isLoggedIn()) {
                        this.showLogin();
                    }

                    if (Net.connected) {
                        Net.sendData({
                            op: Opcodes.MAP_LOADED,
                            m: mapId
                        });
                    }
                } else {
                    if (mapId !== Settings.TitleMap) {
                        alert('Something went very, very wrong. I was unable to load the next map. The game will now restart.');
                        location.reload();
                    }
                }
            }.bind(this);

            if (this.map.fullyLoaded) {
                loadCallback(true);
            } else {
                this.map.onLoadComplete = loadCallback;
            }

        }.bind(this);

        if (this.$game.is(':visible')) {
            this.$game.stop().fadeOut(200, beginLoad);
        } else {
            beginLoad();
        }
    },

    onMapNetworkLoaded: function () {
        Hud.show();
        Chat.show();
    },

    onLoginComplete: function () {
        Game.clear();
    },

    showLogin: function () {
        var loginDialog = new Login();
        loginDialog.show();
    },

    draw: function (ctx) {
        if (!this.initialized) {
            return;
        }

        if (!this.loading && this.map != null) {
            this.map.draw(ctx);
        }
    },

    update: function () {
        if (!this.initialized) {
            return;
        }

        Chat.update();
        Camera.update();

        if (!this.loading && this.map != null) {
            this.map.update();
        }

        Keyboard.update();
    }
};