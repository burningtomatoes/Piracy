var Boat = Entity.extend({
    doesFloat: true,
    affectedByGravity: true,
    crew: [],

    init: function () {
        this._super();

        this.renderer = Game.prefabs.load('cargo_ship_1.json');
        this.renderer.onLoadComplete = function () {
            this.floatToWater();
            this.generateCrew();
        }.bind(this);

        this.crew = [];
    },

    generateCrew: function () {
        this.crew = [];

        // 1. Prepare all available spawns
        var layers = this.renderer.layers;
        console.log(layers);
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

        // 3. Begin spawning folks
        for (var i = 0; i < 8; i++) {
            var spawn = availableSpawns[i];

            var pirateMatey = new Character();
            pirateMatey.posX = spawn.left + this.posX;
            pirateMatey.posY = spawn.top + this.posY;

            World.add(pirateMatey);

            this.crew.push(pirateMatey);
        }
    }
});