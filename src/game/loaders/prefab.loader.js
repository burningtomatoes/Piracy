var PrefabLoader = Loader.extend({
    innerLoad: function (filename) {
        var prefab = new Prefab();

        var configurePrefab = function (data) {
            // Copy over data
            prefab.data = data;
            prefab.layers = data.layers;

            // Configure basic prefab properties
            prefab.widthTiles = data.width;
            prefab.heightTiles = data.height;
            prefab.widthPx = data.width * Settings.TileSize;
            prefab.heightPx = data.height * Settings.TileSize;

            var props = prefab.data.properties;

            if (props.name) {
                prefab.name = props.name;
            }

            // Prepare tileset & tileset config
            var tilesetSrc = data.tilesets[0].image;
            tilesetSrc = tilesetSrc.replace('../images/', '');
            prefab.tileset = Game.images.load(tilesetSrc);
            prefab.tilesPerRow = data.tilesets[0].imagewidth / Settings.TileSize;

            // Prepare blockprefab
            prefab.blockedRects = [];

            var layerCount = prefab.layers.length;

            for (var i = 0; i < layerCount; i++) {
                var layer = prefab.layers[i];

                if (layer.properties == null) {
                    layer.properties = { };
                }

                var x = -1;
                var y = 0;

                var isBlocking = layer.properties.blocked == '1';
                var isLadder = layer.properties.what == 'ladder';

                var layerDataLength = layer.data.length;

                for (var tileIdx = 0; tileIdx < layerDataLength; tileIdx++) {
                    var tid = layer.data[tileIdx];

                    x++;

                    if (x >= prefab.widthTiles) {
                        y++;
                        x = 0;
                    }

                    if (tid === 0) {
                        // Invisible (no tile set for this position; so not blocked)
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

                    if (isBlocking) {
                        prefab.blockedRects.push(rect);
                    }

                    if (isLadder) {
                        prefab.ladderRects.push(rect);
                    }
                }
            }
        };

        $.get('assets/prefabs/' + filename)
        .success(function(data) {
            configurePrefab(data);
            prefab.fullyLoaded = true;
        })
        .error(function(a, b, c) {
            console.error('[PrefabLoader] Network load error! ', a, b, c);
        });

        return prefab;
    }
});