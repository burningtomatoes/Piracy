var World = {
    SEA_SIZE: 100,
    CLOUD_SPEED: -0.05,

    imgClouds: null,

    cloudPosition: 0,

    init: function () {
        this.imgClouds = Game.images.load('clouds.png');
    },

    update: function () {
        if (this.imgClouds != null) {
            var maxCloudPos = this.imgClouds.width;

            this.cloudPosition += this.CLOUD_SPEED;

            console.log(this.cloudPosition);

            if (this.cloudPosition <= -maxCloudPos) {
                this.cloudPosition = 0;
            }

            if (this.cloudPosition >= maxCloudPos) {
                this.cloudPosition = 0;
            }
        }

    },

    draw: function (ctx) {
        this.drawSky(ctx);
        this.drawClouds(ctx);
        this.drawSkyRadial(ctx);
        this.drawSea(ctx);
        this.drawReflections(ctx);
    },

    drawSky: function (ctx) {
        var grd = ctx.createLinearGradient(0, 0, 0, Canvas.canvas.height - World.SEA_SIZE);
        grd.addColorStop(0, "#0094FF");
        grd.addColorStop(1, "#fff");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
    },

    drawSkyRadial: function (ctx) {
        var grd = ctx.createRadialGradient(Canvas.canvas.width / 2, Canvas.canvas.height / 2, Canvas.canvas.height / 4, Canvas.canvas.width / 2, Canvas.canvas.height / 2, Canvas.canvas.height / 2);
        grd.addColorStop(0, "rgba(0, 0, 0, 0)");
        grd.addColorStop(1, "rgba(255, 255, 255, 0.1)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
    },

    drawSea: function (ctx) {
        var grd = ctx.createLinearGradient(0, Canvas.canvas.height - World.SEA_SIZE, 0, Canvas.canvas.height);
        grd.addColorStop(0, "#0094FF");
        grd.addColorStop(1, "#000000");

        ctx.fillStyle = grd;
        ctx.fillRect(0, Canvas.canvas.height - World.SEA_SIZE, Canvas.canvas.width, World.SEA_SIZE);
    },

    drawClouds: function (ctx) {
        if (this.imgClouds != null) {
            var cloudOffest = this.cloudPosition;
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, this.imgClouds.width + cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, this.imgClouds.width * 2 + cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
        }
    },

    drawReflections: function (ctx) {

    }
};