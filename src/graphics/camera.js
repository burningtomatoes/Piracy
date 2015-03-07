var Camera = {
    x: 0,
    y: 0,

    applyX: 0,
    applyY: 0,

    yLocked: false,
    xLocked: false,

    isRumbling: false,
    rumbleOffset: 0,
    rumbleIntensity: 1,
    rumbleDuration: 0,

    translateX: function(x) {
        return Math.round(x + this.applyX);
    },

    translateY: function(y) {
        return Math.round(y + this.applyY);
    },

    translate: function(x, y) {
        return {
            x: this.translateX(x),
            y: this.translateY(y)
        };
    },

    setPos: function(x, y) {
        this.x = x;
        this.y = y;
    },

    trackingEntity: null,

    getScreenWidth: function () {
        return Canvas.canvas.width;
    },

    getScreenHeight: function () {
        return Canvas.canvas.height;
    },

    centerToMap: function() {
        this.x = this.getScreenWidth() / 2 - Game.map.widthPx / 2;
        this.y = this.getScreenHeight() / 2 - Game.map.heightPx / 2;
        this.xLocked = (this.getScreenWidth() > Game.map.widthPx);
        this.yLocked = (this.getScreenHeight() > Game.map.heightPx);
        this.trackingEntity = null;
    },

    trackHard: false,

    followEntity: function(e, hard) {
        this.trackingEntity = e;
        this.trackHard = !!hard;
        this.xLocked = (this.getScreenWidth() > Game.map.widthPx);
        this.yLocked = (this.getScreenHeight() > Game.map.heightPx);
    },

    rumble: function(duration, intensity) {
        this.isRumbling = true;
        this.rumbleOffset = 0;
        this.rumbleDuration = duration;
        this.rumbleIntensity = intensity;
    },

    update: function() {
        if (this.isRumbling) {
            this.rumbleDuration--;

            this.rumbleOffset = chance.integer({
                min: -this.rumbleIntensity,
                max: this.rumbleIntensity
            });

            if (this.rumbleDuration <= 0) {
                this.isRumbling = false;
                this.rumbleOffset = 0;
            }
        }

        if (this.trackingEntity != null) {
            if (!this.xLocked) {
                var desiredX = this.getScreenWidth() / 2 - this.trackingEntity.posX - this.trackingEntity.width / 2;
                var maxXSpace = Game.map.widthPx - this.getScreenWidth();
                this.x = MathHelper.clamp(desiredX, -maxXSpace, 0);
            }

            if (!this.yLocked) {
                var desiredY = this.getScreenHeight() / 2 - this.trackingEntity.posY - this.trackingEntity.height / 2;
                var maxYSpace = Game.map.heightPx - this.getScreenHeight();
                this.y = MathHelper.clamp(desiredY, -maxYSpace, 0);
            }
        }

        if (this.trackHard) {
            this.applyX = this.x;
            this.applyY = this.y;
            this.trackHard = false;
        } else {
            this.applyX = MathHelper.lerp(this.applyX, this.x, 0.1);
            this.applyY = MathHelper.lerp(this.applyY, this.y, 0.1);
        }
    }
};