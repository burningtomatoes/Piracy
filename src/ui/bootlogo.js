var BootLogo = {
    shown: false,

    show: function(cb) {
        if (Settings.DebugSkipBootLogo || this.shown) {
            cb();
            return;
        }

        this.shown = true;

        AudioOut.playSfx('burningtomato.wav');

        $('#burningtomato').delay(500).fadeIn(500, function() {
            window.setTimeout(function() {
                $('#burningtomato').fadeOut(500, cb);
            }, 1500)
        });
    }
};