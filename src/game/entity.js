var Entity = Class.extend({
    id: 0,
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,

    renderer: null,

    init: function (id) {
        this.id = id;
        this.renderer = null;
        this.posX = 0;
        this.posY = 0;
        this.velocityX = 0;
        this.velocityY = 0;
    },

    isFloating: function () {
        var bottomPosY = this.posY + this.getHeight();
        return bottomPosY >= World.getWaterLevel();
    },

    floatToWater: function() {
        this.posY = World.getWaterLevel() - this.getHeight();
    },

    getHeight: function () {
        if (this.renderer && this.renderer.getHeight) {
            return this.renderer.getHeight();
        }

        return 32;
    },

    getWidth: function () {
        if (this.renderer && this.renderer.getWidth) {
            return this.renderer.getWidth();
        }

        return 32;
    },

    update: function () {
        if (this.velocityY > 0 && this.isFloating()) {
            this.velocityY = 0;
            this.floatToWater();
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        if (!this.isFloating()) {
            this.velocityY += World.gravity;
        }

        if (this.renderer && this.renderer.update) {
            this.renderer.update();
        }
    },

    draw: function (ctx) {
        if (this.renderer && this.renderer.draw) {
            this.renderer.draw(ctx, Camera.translateX(this.posX), Camera.translateY(this.posY));
        }
    }
});