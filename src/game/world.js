var World = {
    SEA_SIZE: 100,
    CLOUD_SPEED: -0.5,

    imgClouds: null,

    entities: [],
    toRemove: [],
    player: null,

    cloudPosition: 0,

    gravity: 0.2,

    playerBoat: null,
    enemyBoats: [],

    init: function () {
        this.imgClouds = Game.images.load('clouds.png');

        this.clear();
    },

    clear: function () {
        this.entities = [];
        this.toRemove = [];
        this.player = null;
        this.enemyBoats = [];
        this.playerBoat = null;

        this.playerBoat = new Boat();
        this.add(this.playerBoat);
    },

    add: function (entity) {
        if (this.entities.indexOf(entity) == -1) {
            entity.map = this;

            this.entities.push(entity);

            //if (entity.isLocalPlayer()) {
            //    this.player = entity;
            //    Camera.followEntity(this.player, true);
            //}
        }
    },

    remove: function (entity) {
        if (this.entities.indexOf(entity) == -1) {
            return false;
        }

        if (this.toRemove.indexOf(entity) === -1) {
            this.toRemove.push(entity);
            return true;
        }

        if (this.player == entity) {
            this.player = null;
            Camera.followEntity(null, false);
        }

        return false;
    },

    getWaterLevel: function () {
        return this.getWaterRenderLevel() + (Settings.TileSize / 2);
    },

    getWaterRenderLevel: function () {
        return Canvas.canvas.height - this.SEA_SIZE;
    },

    getEntityById: function (id) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    },

    update: function () {
        if (this.imgClouds != null) {
            var maxCloudPos = this.imgClouds.width;

            this.cloudPosition += this.CLOUD_SPEED;

            if (this.cloudPosition <= -maxCloudPos) {
                this.cloudPosition = 0;
            }

            if (this.cloudPosition >= maxCloudPos) {
                this.cloudPosition = 0;
            }
        }

        this.processRemovals();

        for (var j = 0; j < this.entities.length; j++) {
            var entity = this.entities[j];
            entity.update();
        }

        // Randomly "dust" or wind stuff flying about. Idk, makes it look like we're moving.
        if (chance.bool({likelihood: 5})) {
            Particles.emit({
                srcX: Canvas.canvas.width,
                srcY: chance.integer({ min: 0, max: Canvas.canvas.height }),
                color: 'rgba(255, 255, 255, 0.15)',
                intensity: 1,
                gravity: false,
                minAmount: 1,
                maxAmount: 1
            });
        }
    },

    anyCollisions: function (ourEntity, ourRect) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.renderer == null || entity === ourEntity || entity.dead) {
                continue;
            }

            if (entity.renderer.isPrefab) {
                if (entity.renderer.isRectBlocked(ourRect, entity.posX, entity.posY)) {
                    return true;
                }
            } else {
                var theirRect = entity.getRect();

                if (Utils.rectIntersects(ourRect, theirRect)) {
                    return true;
                }
            }
        }

        return false;
    },

    getCharactersInRect: function (ourRect, ourEntity) {
        var ents = [];

        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.renderer == null || entity === ourEntity || entity.dead) {
                continue;
            }

            var theirRect = entity.getRect();

            if (Utils.rectIntersects(ourRect, theirRect)) {
                ents.push(entity);
            }
        }

        return ents;
    },

    processRemovals: function () {
        for (var i = 0; i < this.toRemove.length; i++) {
            var removeEntity = this.toRemove[i];
            var entityIdx = this.entities.indexOf(removeEntity);

            if (entityIdx === -1) {
                continue;
            }

            this.entities.splice(entityIdx, 1);
        }

        this.toRemove = [];
    },

    draw: function (ctx) {
        this.drawSky(ctx);
        this.drawClouds(ctx);
        this.drawSkyRadial(ctx);
        this.drawSea(ctx);
        this.drawReflections(ctx);
        this.drawEntities(ctx);
        this.drawOverlays(ctx);
    },

    drawSky: function (ctx) {
        var grd = ctx.createLinearGradient(0, 0, 0, Canvas.canvas.height - World.SEA_SIZE);
        grd.addColorStop(0, "#0094FF");
        grd.addColorStop(1, "#64A1D0");

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
        // 1 - Draw sea gradient
        var translateX = 0;
        var translateY = Camera.translateY(0);

        ctx.translate(translateX, translateY);

        var grd = ctx.createLinearGradient(0, Canvas.canvas.height - World.SEA_SIZE, 0, Canvas.canvas.height);
        grd.addColorStop(0, "#0094FF");
        grd.addColorStop(1, "#000000");

        ctx.fillStyle = grd;
        ctx.fillRect(0, Canvas.canvas.height - World.SEA_SIZE, Canvas.canvas.width, World.SEA_SIZE);

        ctx.translate(-translateX, -translateY);

        // 2 - Sea line
        var posY = this.getWaterRenderLevel();

        ctx.beginPath();
        ctx.moveTo(0, posY);
        ctx.lineTo(Canvas.canvas.width, posY);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    },

    drawClouds: function (ctx) {
        var translateX = Camera.translateX(0);
        var translateY = Camera.translateY(0);

        ctx.translate(translateX, translateY);

        if (this.imgClouds != null) {
            var cloudOffest = this.cloudPosition;
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, this.imgClouds.width + cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, this.imgClouds.width * 2 + cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
        }

        ctx.translate(-translateX, -translateY);
    },

    drawEntities: function (ctx) {
        for (var j = 0; j < this.entities.length; j++) {
            var entity = this.entities[j];
            entity.draw(ctx);
        }
    },

    drawOverlays: function (ctx) {
        for (var j = 0; j < this.entities.length; j++) {
            var entity = this.entities[j];
            entity.drawOverlays(ctx);
        }
    },

    drawReflections: function (ctx) {
        ctx.save();
        ctx.globalAlpha = 0.2;

        for (var j = 0; j < this.entities.length; j++) {
            var entity = this.entities[j];
            entity.drawReflection(ctx);
        }

        ctx.restore();

        var translateX = 0;
        var translateY = Camera.translateY(0);

        ctx.translate(translateX, translateY);

        var grd = ctx.createLinearGradient(0, Canvas.canvas.height - World.SEA_SIZE, 0, Canvas.canvas.height);
        grd.addColorStop(0, "rgba(0,148,255,0)");
        grd.addColorStop(1, "rgba(0,0,0,0.2)");

        ctx.fillStyle = grd;
        ctx.fillRect(0, Canvas.canvas.height - World.SEA_SIZE, Canvas.canvas.width, World.SEA_SIZE);

        ctx.translate(-translateX, -translateY);
    }
};