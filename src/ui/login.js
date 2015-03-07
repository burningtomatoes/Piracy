var Login = Dialog.extend({
    init: function () {
        $('.dialog').remove();

        this._super('dl-login');
    },

    $form: null,
    $submitBtn: null,
    $resultMsg: null,

    bind: function () {
        this.$form = this.$element.find('form');
        this.$submitBtn = this.$form.find('button.form-control');
        this.$resultMsg = this.$form.find('p.result');

        this.$form.on('submit', function (e) {
            try { e.preventDefault(); } catch (ex) { }
            try { e.stopPropagation(); } catch (ex) { }

            if (this.$submitBtn.attr('disabled') == null) {
                this.submitForm();
            }

            return false;
        }.bind(this));
    },

    submitForm: function () {
        this.$submitBtn.attr('disabled', true);

        if (!Net.connected) {
            this.showError('Please wait for the connection to be established...');
            return;
        }

        var payload = this.$form.serializeObject();
        payload.username = payload.username.trim();
        payload.password = payload.password.trim();

        if (payload.username == null || payload.password == null || payload.username.length <= 0 || payload.username.length >= 32 || payload.password.length <= 0) {
            this.showError('Enter both a username and a password.');
            return;
        }

        this.showError('Logging in...', true);

        // Locally hash the user password before we send it over the wire
        // For an important service this would not be sufficient at all
        payload.password = SHA1.calculate(payload.password);
        payload.op = Opcodes.LOGIN;

        // Mark our requested username in the net session for later
        Session.username = payload.username;

        // Prepare for server response
        Router.register(Opcodes.LOGIN_RESULT, function (data) {
            this.showError(data.msg);
        }.bind(this));

        Router.register(Opcodes.LOGIN_COMPLETE, function (data) {
            Session.setStateObject(data.user);
            this.hide();
            Game.onLoginComplete();
        }.bind(this));

        // Send login / register request to the server, and await a response...
        Net.sendData(payload);
    },

    showError: function (msg, notAnError) {
        this.$resultMsg.stop().fadeOut(100, function () {
            this.$resultMsg.stop().fadeIn(100);

            if (notAnError) {
                this.$resultMsg.removeClass('error');
            } else {
                this.$resultMsg.addClass('error');
            }

            this.$resultMsg.text(msg);

            if (!notAnError) {
                this.$submitBtn.attr('disabled', false);
            }
        }.bind(this));
    },

    show: function () {
        this._super();
        $('#net-status').fadeIn('fast');
    },

    hide: function () {
        this._super();
        $('#net-status').fadeOut('fast');
    }
});