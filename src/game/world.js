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

    inEncounter: false,
    searchingEncounters: false,
    showingEncounter: false,
    showingEncounterTimer: 0,

    initialized: false,

    init: function () {
        if (this.initialized) {
            return;
        }

        this.imgClouds = Game.images.load('clouds.png');
        this.clear();
        this.initialized = true;
    },

    clear: function () {
        this.entities = [];
        this.toRemove = [];
        this.player = null;
        this.enemyBoats = [];
        this.playerBoat = null;
        this.inEncounter = false;
        this.searchingEncounters = false;

        $('#hud .btn-board').hide();
    },

    start: function () {
        if (!this.initialized) {
            this.init();
        }

        this.clear();

        this.playerBoat = new Boat('cargo_ship_1', Math.round(Settings.TileSize * 1));
        this.add(this.playerBoat);

        this.searchingEncounters = true;
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
                maxAmount: 1,
                local: false
            });
        }

        // Random encounters
        if (!this.inEncounter && this.searchingEncounters && chance.bool({ likelihood: 1 })) {
            this.generateEncounter();
            this.announceEncounter();
        }

        // Show encounter zone
        if (this.showingEncounterTimer > 0) {
            this.showingEncounterTimer--;

            if (this.showingEncounterTimer == 0) {
                if (this.showingEncounter) {
                    Camera.x = 0;
                    this.showingEncounter = false;

                    $('#hud .btn-board')
                        .show()
                        .unbind('click')
                        .bind('click', function () {
                            this.boardEncounter();
                        }.bind(this));
                } else {
                    Camera.x -= Canvas.canvas.width;
                    this.showingEncounter = true;
                    this.showingEncounterTimer = 120;
                }
            }
        }

        // Sumper jump to the boat
        if (this.isSuperJumping) {
            var announcers = this.playerBoat.crew;

            var mvS = 0;

            for (var i = 0; i < announcers.length; i++) {
                var shipmate = announcers[i];

                mvS = shipmate.movementSpeed;

                shipmate.landed = true;
                shipmate.jumped = false;
                shipmate.receivesCollision = false;
                shipmate.facingLeft = false;
                shipmate.posX += mvS * 5;
                shipmate.say("Yarrr!");

                if (shipmate.posY <= -220) {
                    this.isSuperLanding = true;
                }

                if (this.isSuperLanding) {
                    shipmate.posY += mvS * 2;
                } else {
                    shipmate.posY -= mvS * 2;
                }

                var maxY = World.getWaterLevel() - 250;

                if (shipmate.posY >= maxY) {
                    shipmate.posY = maxY;
                }

                shipmate.velocityX = 0;
                shipmate.velocityY = 0;
                shipmate.attack();
            }

            Camera.x -= mvS * 5;

            var maxCameraX = Canvas.canvas.width;

            if (Camera.x <= -maxCameraX) {
                this.isSuperJumping = false;
                this.isSuperLanding = false;

                for (var i = 0; i < announcers.length; i++) {
                    var shipmate = announcers[i];
                    shipmate.landed = false;
                    shipmate.jumped = true;
                    shipmate.receivesCollision = true;
                    shipmate.velocityX = chance.integer({
                        min: -shipmate.movementSpeed,
                        max: shipmate.movementSpeed
                    });
                    shipmate.facingLeft = chance.bool();
                    shipmate.unstuck();
                }
            }
        }
    },

    isSuperJumping: false,
    isSuperLanding: false,

    boardEncounter: function () {
        $('#hud .btn-board').hide();
        AudioOut.playSfx('jump.wav');
        this.isSuperJumping = true;
        this.isSuperLanding = false;
    },

    endEncounter: function () {
        this.inEncounter = false;
        this.searchingEncounters = false;

        $('#game').stop().fadeOut('fast', function () {
            this.inEncounter = false;
            this.searchingEncounters = false;

            this.playerBoat.resetCrewPositions();

            Camera.x = 0;

            for (var i = 0; i < this.enemyBoats.length; i++) {
                var boat = this.enemyBoats[i];

                for (var j = 0; j < boat.crew.length; j++) {
                    var crewMember = boat.crew[j];
                    crewMember.dead = true;
                    this.remove(crewMember);
                }

                boat.crew = [];

                this.remove(boat);
            }

            for (var i = 0; i < this.entities.length; i++) {
                var entity = this.entities[i];

                if (entity.isEnemy()) {
                    entity.dead = true;
                    this.remove(entity);
                }
            }

            this.enemyBoats = [];

            this.isSuperJumping = false;
            this.isSuperLanding = false;

            $('#game').stop().fadeIn('fast', function () {
                if (!this.player.dead) {
                    this.searchingEncounters = true;
                }
            }.bind(this));
        }.bind(this));

        $('#hud .btn-board').hide();

        Game.syncHud();

        this.showingEncounter = false;
        this.showingEncounterTimer = 0;
    },

    generateEncounter: function () {
        this.inEncounter = true;
        this.enemyBoats = [];
        this.isSuperJumping = false;
        this.isSuperLanding = false;

        var prefabTemplates = [
            'medium_ship_1'
        ];

        var enemyBoatTemplate = chance.pick(prefabTemplates);
        var enemyBoat = new Boat(enemyBoatTemplate, Canvas.canvas.width + Settings.TileSize);

        console.info('[World] Generated encounter with boat ' + enemyBoatTemplate);

        this.enemyBoats.push(enemyBoat);
        this.add(enemyBoat);
    },

    announceEncounter: function () {
        var announcers = this.playerBoat.crew;

        for (var i = 0; i < announcers.length; i++) {
            var shipmate = announcers[i];

            if (shipmate.isPlayer()) {
                shipmate.say('Ready your swords!');
            } else {
                shipmate.say('Ship ahoy!');

                if (chance.bool()) {
                    shipmate.jump();
                }

                shipmate.velocityX = 0;
                shipmate.facingLeft = false;
            }
        }

        AudioOut.playSfx('ship_ahoy.wav', 0.75);

        this.showingEncounterTimer = 60;

        Game.syncHud();
    },

    anyCollisions: function (ourEntity, ourRect) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.renderer == null || entity === ourEntity || entity.dead || !entity.causesCollision) {
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

    anyLadders: function (ourRect) {
        for (var i = 0; i < this.entities.length; i++) {
            var entity = this.entities[i];

            if (entity.renderer == null) {
                continue;
            }

            if (entity.renderer.isPrefab) {
                if (entity.renderer.isRectLadder(ourRect, entity.posX, entity.posY)) {
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
            ctx.drawImage(this.imgClouds, 0, 0, this.imgClouds.width, this.imgClouds.height, this.imgClouds.width * 3 + cloudOffest, 0, this.imgClouds.width, this.imgClouds.height);
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