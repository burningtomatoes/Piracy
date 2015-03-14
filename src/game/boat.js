var Boat = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,
    crew: [],
    waitingForLoad: false,

    PLAYER_CREW_COUNT: 8,
    ENEMY_CREW_COUNT: 6,

    init: function (prefabTemplate, posX) {
        this._super();

        this.renderer = Game.prefabs.load(prefabTemplate + '.json');
        this.waitingForLoad = true;

        this.crew = [];

        this.posX = posX;
    },

    getCrewAlive: function () {
        var t = 0;

        for (var i = 0; i < this.crew.length; i++) {
            var mate = this.crew[i];

            if (!mate.dead) {
                t++;
            }
        }

        return t;
    },

    getCrewDead: function () {
        var t = 0;

        for (var i = 0; i < this.crew.length; i++) {
            var mate = this.crew[i];

            if (mate.dead) {
                t++;
            }
        }

        return t;
    },

    getCrewTotal: function () {
        return this.crew.length;
    },

    isPlayerBoat: function () {
        return this.doesFloat && World.playerBoat == this;
    },

    resetCrewPositions: function () {
        var availableSpawns = this.prepareSpawns();

        for (var i = 0; i < this.crew.length; i++) {
            var spawn = availableSpawns[i];
            var pirateMatey = this.crew[i];

            pirateMatey.posX = spawn.left + this.posX;
            pirateMatey.posY = spawn.top + this.posY;
            pirateMatey.aiMoving = false;
            pirateMatey.attackingEntity = null;
            pirateMatey.facingLeft = chance.bool();
            pirateMatey.velocityX = 0;
            pirateMatey.velocityY = 0;
            pirateMatey.aiTimer = chance.integer({min: 0, max: 600});
            pirateMatey.boat = this;
        }

        Game.syncHud();
    },

    update: function () {
        if (this.waitingForLoad && this.renderer != null && this.renderer.fullyLoaded) {
            this.floatToWater();
            this.generateCrew();

            this.waitingForLoad = false;
        }
    },

    prepareSpawns: function() {
        // 1. Prepare all available spawns based on map layer data
        var layers = this.renderer.layers;
        var availableSpawns = [];

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];

            if (layer.properties && layer.properties.what !== 'spawn') {
                continue;
            }

            var x = -1;
            var y = 0;

            for (var tileIdx = 0; tileIdx < layer.data.length; tileIdx++) {
                var tid = layer.data[tileIdx];

                x++;

                if (x >= this.renderer.widthTiles) {
                    y++;
                    x = 0;
                }

                if (tid === 0) {
                    // Invisible (no tile set for this position; so not a spawn)
                    continue;
                }

                var rect = {
                    top: y * Settings.TileSize,
                    left: x * Settings.TileSize,
                    width: Settings.TileSize,
                    height: Settings.TileSize
                };
                rect.bottom = rect.top + rect.height;
                rect.right = rect.left + rect.width;

                availableSpawns.push(rect);
            }
        }

        // 2. Shuffle the spawn array
        availableSpawns = chance.shuffle(availableSpawns);

        return availableSpawns;
    },

    generateCrew: function () {
        console.log('generating crew for ', this);

        this.crew = [];

        var availableSpawns = this.prepareSpawns();

        // 3. Begin spawning folks
        var amtToSpawn = this.isPlayerBoat() ? this.PLAYER_CREW_COUNT : this.ENEMY_CREW_COUNT;
        for (var i = 0; i < amtToSpawn; i++) {
            var spawn = availableSpawns[i];

            var pirateMatey = new Character();
            pirateMatey.posX = spawn.left + this.posX;
            pirateMatey.posY = spawn.top + this.posY;
            pirateMatey.boat = this;

            if (i === 0 && this.isPlayerBoat()) {
                World.player = pirateMatey;

                pirateMatey.equipWeapon('sword_gold', 25);
            }

            if (!this.isPlayerBoat()) {
                pirateMatey.movementSpeed = 2.0;
            }

            World.add(pirateMatey);

            this.crew.push(pirateMatey);
        }

        Game.syncHud();
    }
});