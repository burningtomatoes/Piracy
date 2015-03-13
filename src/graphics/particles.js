var Particles = {
    emit: function (usrConfig) {
        var config = {
            srcX: 0,
            srcY: 0,
            minAmount: 10,
            maxAmount: 20,
            color: '#ff0000',
            lifetime: 60,
            minSize: 2,
            maxSize: 5,
            intensity: 10,
            gravity: true,
            local: true
        };

        for (var prop in usrConfig) {
            config[prop] = usrConfig[prop];
        }

        var amount = chance.integer({
            min: config.minAmount,
            max: config.maxAmount
        });

        for (var i = 0; i < amount; i++) {
            var size = chance.integer({
                min: config.minSize,
                max: config.maxSize
            });

            var particle = new Particle(config.color, size, config.intensity, config.gravity, config.local);
            particle.posX = config.srcX;
            particle.posY = config.srcY;
            World.add(particle);
        }
    }
};

var Particle = Entity.extend({
    color: '#00ff00',
    size: 0,
    reflective: false,
    gravity: true,
    local: false,

    init: function (color, size, intensity, gravity, local) {
        this.velocityX = chance.floating({min: -intensity, max: intensity});
        this.velocityY = chance.floating({min: -intensity, max: intensity});
        this.alpha = 1.0;
        this.color = color;
        this.size = size;
        this.gravity = gravity;
        this.local = local;
    },

    getWidth: function () { return this.size; },
    getHeight: function () { return this.size; },

    update: function () {
        this.velocityX *= 0.9;

        if (this.gravity) {
            this.velocityY += World.gravity * 2;
        }

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        this.posX += World.CLOUD_SPEED * 5;

        if (this.posX <= -this.size || this.posY >= Canvas.canvas.height + this.size) {
            World.remove(this);
            return;
        }
    },

    draw: function (ctx) {
        var posX = this.posX;
        var posY = this.posY;

        if (this.local) {
            posX = Camera.translateX(posX);
            posY = Camera.translateX(posY);
        }

        ctx.beginPath();
        ctx.rect(posX, posY, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
});