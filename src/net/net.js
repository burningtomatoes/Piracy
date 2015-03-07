var Net = {
    connected: false,
    connecting: false,

    uri: null,

    socket: null,

    retryDelay: 0,
    retryTimeout: null,

    playerCountReceived: false,
    playerCount: 0,

    init: function () {
        this.connected = false;
        this.connecting = false;
        this.uri = Settings.ServerUri;
        this.retryDelay = 1000;

        this.resetConnection(true);

        window.setInterval(this.checkConnection.bind(this), 1000);

        Router.register(Opcodes.GLOB_PLAYER_COUNT, function (data) {
            this.playerCountReceived = true;
            this.playerCount = data.count;
            this.updateStatus();
        }.bind(this));

        Sync.init();
    },

    checkConnection: function () {
        if (this.socket == null) {
            return;
        }

        if (!this.socket.connected && this.connected) {
            console.warn('[Net] Connection is dead, but was not reported by the client. Forcing connection reset.');
            this.resetConnection();
            return;
        }
    },

    resetConnection: function (initial) {
        if (initial) {
            this.retryDelay = 0;
        } else if (this.retryDelay <= 10000) {
            this.retryDelay += chance.integer({
                min: 500,
                max: 1000
            });
        }

        var wasConnected = !!this.connected;

        if (this.socket != null) {
            try {
                this.socket.close();
            } catch (e) { }

            this.socket = null;
        }

        this.connecting = false;
        this.connected = false;
        this.playerCountReceived = false;

        Session.setStateObject(null);

        if (wasConnected) {
            // If we were connected, restart the entire game
            Game.start(Settings.TitleMap);
        }

        if (this.retryTimeout != null) {
            console.info('[Net] Retrying connection in ' + (this.retryDelay / 1000).toFixed(2).toString() + ' seconds...');
            window.clearTimeout(this.retryTimeout);
        }

        this.retryTimeout = window.setTimeout(this.connect.bind(this), this.retryDelay);

        this.updateStatus();
    },

    onConnect: function () {
        this.connected = true;
        this.retryDelay = 0;

        this.updateStatus();

        if (Settings.DebugQuickLogin) {
            var $form = $('.dialog form.login').first();
            $form.find('[name="username"]').val('debug');
            $form.find('[name="password"]').val('debug');
            $form.submit();
        }
    },

    sendData: function (data) {
        this.socket.emit('data', JSON.stringify(data));
    },

    connect: function () {
        if (this.connected || this.connecting) {
            return;
        }

        this.connecting = true;

        console.info('[Net] Connecting to server at ' + this.uri + '...');

        this.socket = io.connect(this.uri);

        var handleError = function (e) {
            console.error('[Net](Resetting) Connection error: ', e.message);
            this.resetConnection();
        }.bind(this);

        this.socket.on('connect_error', handleError);
        this.socket.on('reconnect_failed', handleError);

        this.socket.on('connect_timeout', function (e) {
            console.warn('[Net](Resetting) Connection timeout reached.', e);
            this.resetConnection();
        }.bind(this));

        this.socket.on('connect', function (e) {
            console.info('[Net] Connection established successfully.');
            this.onConnect();
        }.bind(this));

        this.socket.on('data', function (data) {
            Router.route(data);
        });

        this.updateStatus();
    },

    updateStatus: function () {
        var $statusSpan = $('#net-status').find('span');

        if (this.connected) {
            $statusSpan.text('Connected to server' + (this.playerCountReceived ? ' - ' + this.playerCount + ' players online' : ''));
        } else if (this.connecting) {
            $statusSpan.text('Connecting to online services...');
        } else {
            $statusSpan.text('Connection failed. Retrying...');
        }
    }
};