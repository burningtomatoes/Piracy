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
        return Math.round(x + this.applyX + this.rumbleOffset);
    },

    translateY: function(y) {
        return Math.round(y + this.applyY + this.rumbleOffset);
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

    trackHard: false,

    followEntity: function(e, hard) {
        this.trackingEntity = e;
        this.trackHard = !!hard;
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
            this.x = this.getScreenWidth() / 2 - this.trackingEntity.posX - this.trackingEntity.width / 2;
            this.y = this.getScreenHeight() / 2 - this.trackingEntity.posY - this.trackingEntity.height / 2;
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