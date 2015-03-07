var Chat = {
    $element: null,
    $messages: null,
    $input: null,
    $inputDiv: null,

    isActive: false,
    visible: false,

    init: function () {
        Router.register(Opcodes.SERVER_CHAT, this.handleChatMessage.bind(this));

        this.isActive = false;
        this.visible = false;

        this.$element = $('#chat');
        this.$messages = this.$element.find('.messages');
        this.$input = this.$element.find('input');
        this.$inputDiv = this.$element.find('.input');

        this.$input.blur(function() {
            this.$input.attr('disabled', true);
            this.$input.addClass('inactive');
            this.isActive = false;
        }.bind(this));

        this.$inputDiv.click(function() {
            this.$input.attr('disabled', false);
            this.$input.removeClass('inactive');
            this.$input.focus();
            this.isActive = true;
        }.bind(this));

        this.$input.keydown(function (e) {
            if (e.keyCode == KeyCode.RETURN) {
                this.sendMessage();
                this.$input.val('');
                window.setTimeout("Chat.$input.blur();", 10);
            } else if (e.keyCode == KeyCode.ESCAPE) {
                this.$input.blur();
            }
        }.bind(this));
    },

    update: function () {
        if (!this.visible) {
            return;
        }

        if (Keyboard.wasKeyPressed(KeyCode.RETURN)) {
            this.$inputDiv.click();
        }
    },

    sendMessage: function () {
        var msg = this.$input.val().trim();

        if (msg.length == 0 || msg.length > 255) {
            return;
        }

        var payload = {
            op: Opcodes.CLIENT_CHAT,
            txt: msg
        };

        Net.sendData(payload);
    },

    handleChatMessage: function (data) {
        var $message = $('<div />')
            .addClass('message');

        if (data.name != null && data.name.length > 0) {
            var $nameSpan = $('<span />')
                .addClass('name')
                .addClass(data.name === Session.username ? 'self' : 'other')
                .text(data.name + ': ')
                .appendTo($message);
        }

        var $textSpan = $('<span />')
            .addClass('text')
            .text(data.text)
            .appendTo($message);

        $message
            .hide()
            .appendTo(this.$messages)
            .fadeIn('fast')
            .delay(5000)
            .fadeOut(2000);
    },

    clear: function () {
        this.$messages.html('');
    },

    show: function () {
        this.$element.show();
        this.visible = true;
    },

    hide: function () {
        this.$element.hide();
        this.visible = false;
    }
};