var Dialog = Class.extend({
    $element: null,

    init: function (templateId) {
        this.$element = $('<div />');
        this.$element.addClass('dialog');
        this.$element.hide();

        var $template = $('#' + templateId);
        this.$element.append($template.html());

        this.$element.appendTo($('#dialogs'));

        this.bind();
    },

    bind: function () {
        // ...
    },

    show: function () {
        this.init();
        this.$element.slideDown();
        this.checkOverlay();
    },

    hide: function () {
        this.$element.remove();
        this.checkOverlay();
    },

    checkOverlay: function () {
        var $overlay = $('#overlay');
        var openDialogs = $('.dialog:visible').length;

        if (openDialogs == 0 && $overlay.is(':visible')) {
            $overlay.fadeOut('fast');
        } else if (openDialogs > 0 && !$overlay.is(':visible')) {
            $overlay.fadeIn('fast');
        }
    }
});