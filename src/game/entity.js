var Entity = Class.extend({
    id: 0,
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,

    renderer: null,

    doesFloat: true,
    affectedByGravity: true,

    init: function (id) {
        this.id = id;
        this.renderer = null;
        this.posX = 32;
        this.posY = 32;
        this.velocityX = 0;
        this.velocityY = 0;
    },

    getRect: function (overrideX, overrideY) {
        var x = this.posX;
        var y = this.posY;

        if (overrideX != null) {
            x = overrideX;
        }

        if (overrideY != null) {
            y = overrideY;
        }

        var w = 32;
        var h = 32;

        var margin = 6;

        var rect = {
            left: x,
            top: y + 6,
            height: h - margin,
            width: w - margin
        };
        rect.bottom = rect.top + rect.height;
        rect.right = rect.left + rect.width;
        return rect;
    },

    isFloating: function () {
        if (!this.doesFloat) {
            return false;
        }

        var bottomPosY = this.posY + this.getHeight();
        return bottomPosY >= World.getWaterLevel();
    },

    floatToWater: function() {
        if (!this.doesFloat) {
            return false;
        }

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

        if (Settings.drawCollisions) {
            var r = this.getRect();

            // Debug boundary
            ctx.beginPath();
            ctx.rect(Camera.translateX(r.left), Camera.translateY(r.top), r.width, r.height);
            ctx.strokeStyle = "#FFCCAA";
            ctx.stroke();
            ctx.closePath();
        }
    },

    drawReflection: function (ctx) {
        var translateY = this.getHeight() + World.getWaterLevel() + World.SEA_SIZE + (Settings.TileSize * 1.5);

        // Vertical flip, center translation so it appears in the right place
        ctx.scale(1, -1);
        ctx.translate(0, -translateY);

        // Actually draw this shit
        this.draw(ctx);

        // Undo translations
        ctx.scale(-1, 1);
        ctx.translate(0, translateY);

    }
});