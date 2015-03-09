var Entity = Class.extend({
    id: 0,
    posX: 0,
    posY: 0,
    velocityX: 0,
    velocityY: 0,

    renderer: null,

    doesFloat: true,
    affectedByGravity: true,
    receivesCollision: true,

    health: 66,
    healthMax: 100,
    name: '???',

    init: function (id) {
        this.id = id;
        this.renderer = null;
        this.posX = 32;
        this.posY = 32;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = 0;
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
        var h = 43;

        var margin = 12;

        var rect = {
            left: x + 4,
            top: y,
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

        if ((this.velocityY < 0 && this.willCollideUp()) || (this.velocityY > 0 && this.willCollideDown())) {
            this.velocityY = 0;
        }

        if ((this.velocityX < 0 && this.willCollideLeft()) || (this.velocityX > 0 && this.willCollideRight())) {
            this.velocityX = 0;
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
        var translateY = Canvas.canvas.height + World.getWaterRenderLevel() - 68;

        // Vertical flip, center translation so it appears in the right place
        ctx.save();
        ctx.scale(1, -1);
        ctx.translate(0, -translateY);

        // Actually draw this shit
        this.draw(ctx);

        ctx.restore();
    },

    drawOverlays: function (ctx) {
        if (this.hasHealthBar) {
            this.drawHealthBar(ctx);
        }
    },

    drawHealthBar: function (ctx) {
        ctx.beginPath();

        var baseRect = {
            x: Math.round(this.posX + 4),
            y: Math.round(this.posY - 6),
            w: this.getWidth() - 12,
            h: 4
        };

        ctx.rect(baseRect.x, baseRect.y, baseRect.w, baseRect.h);

        ctx.fillStyle = '#333';
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.closePath();
        ctx.beginPath();

        var healthPercentage = this.health / this.healthMax;

        ctx.rect(baseRect.x + 1, baseRect.y + 1, (baseRect.w - 2) * healthPercentage, baseRect.h - 2);

        ctx.fillStyle = '#DF0101';
        ctx.fill();

        ctx.closePath();
    },

    canMoveLeft: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosX = this.posX - this.movementSpeed;
        var projectedRect = this.getRect(projectedPosX, null);
        return !World.anyCollisions(this, projectedRect);
    },

    canMoveRight: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosX = this.posX + this.movementSpeed;
        var projectedRect = this.getRect(projectedPosX, null);
        return !World.anyCollisions(this, projectedRect);
    },

    canMoveUp: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosY = this.posY - this.movementSpeed;
        var projectedRect = this.getRect(null, projectedPosY);
        return !World.anyCollisions(this, projectedRect);
    },

    canMoveDown: function () {
        if (!this.receivesCollision) {
            return true;
        }

        var projectedPosY = this.posY + this.movementSpeed;
        var projectedRect = this.getRect(null, projectedPosY);
        return !World.anyCollisions(this, projectedRect);
    },

    canMoveAnywhere: function () {
        if (!this.receivesCollision) {
            return true;
        }

        return (this.canMoveLeft() || this.canMoveDown() || this.canMoveUp() || this.canMoveRight());
    },

    willCollideLeft: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityX >= 0) {
            return false;
        }

        var projectedPosX = this.posX - this.velocityX;
        var projectedRect = this.getRect(projectedPosX, null);
        return World.anyCollisions(this, projectedRect);
    },

    willCollideRight: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityX <= 0) {
            return false;
        }

        var projectedPosX = this.posX + this.velocityX;
        var projectedRect = this.getRect(projectedPosX, null);
        return World.anyCollisions(this, projectedRect);
    },

    willCollideUp: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityY >= 0) {
            return false;
        }

        var projectedPosY = this.posY + this.velocityY;
        var projectedRect = this.getRect(null, projectedPosY);
        return World.anyCollisions(this, projectedRect);
    },

    willCollideDown: function () {
        if (!this.receivesCollision) {
            return false;
        }

        if (this.velocityY <= 0) {
            return false;
        }

        var projectedPosY = this.posY + this.velocityY;
        var projectedRect = this.getRect(null, projectedPosY);
        return World.anyCollisions(this, projectedRect);
    }
});