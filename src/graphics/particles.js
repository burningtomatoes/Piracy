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
            maxSize: 5
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

            var particle = new Particle(config.color, size);
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

    init: function (color, size) {
        this.velocityX = chance.floating({min: -10, max: 10});
        this.velocityY = chance.floating({min: -10, max: 10});
        this.alpha = 1.0;
        this.color = color;
        this.size = size;
    },

    getWidth: function () { return this.size; },
    getHeight: function () { return this.size; },

    update: function () {
        this.velocityX *= 0.9;
        this.velocityY += World.gravity * 2;

        this.posX += this.velocityX;
        this.posY += this.velocityY;

        if (this.velocityY >= Canvas.canvas.height + this.size) {
            World.remove(this);
            return;
        }
    },

    draw: function (ctx) {
        ctx.beginPath();
        ctx.rect(this.posX, this.posY, this.size, this.size);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
});