var Hud = {
    $hud: null,

    init: function () {
        this.$hud = $('#hud');
    },

    show: function () {
        this.updateHud();
        this.$hud.show();
    },

    updateHud: function () {
        var playerEntity = Session.getEntity();

        var $healthBar = this.$hud.find('.health');

        if (playerEntity == null) {
            $healthBar.hide();
        } else {
            var $healthText = $healthBar.find('.text');
            var $healthProg = $healthBar.find('.progress');

            var healthPct = playerEntity.healthCurrent / playerEntity.healthMax;

            $healthText.text(Math.round(healthPct * 100) + '%');
            $healthProg.css('width', Math.round(healthPct * 100) + '%');
        }
    },

    hide: function () {
        this.$hud.hide();
    }
};