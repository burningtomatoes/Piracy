var MapLoader = Loader.extend({
    readCache: function (id, defaultValue) {
        var data = this._super(id, defaultValue);

        if (data.isMap) {
            // Clear all entities before returning maps from cache
            data.clear();
            data.onLoadComplete();
        }

        return data;
    },

    innerLoad: function (filename) {
        var map = new Map();

        var configureMap = function (data) {
            // Copy over data
            map.data = data;
            map.layers = data.layers;

            // Configure basic map properties
            map.widthTiles = data.width;
            map.heightTiles = data.height;
            map.widthPx = data.width * Settings.TileSize;
            map.heightPx = data.height * Settings.TileSize;

            var props = map.data.properties;

            if (props.name) {
                map.name = props.name;
            }

            // Prepare tileset & tileset config
            var tilesetSrc = data.tilesets[0].image;
            tilesetSrc = tilesetSrc.replace('../images/', '');
            map.tileset = Game.images.load(tilesetSrc);
            map.tilesPerRow = data.tilesets[0].imagewidth / Settings.TileSize;

            // Prepare blockmap
            map.blockedRects = [];

            var layerCount = map.layers.length;

            for (var i = 0; i < layerCount; i++) {
                var layer = map.layers[i];

                if (layer.properties == null) {
                    layer.properties = { };
                }

                var x = -1;
                var y = 0;

                var isBlocking = layer.properties.blocked == '1';

                var layerDataLength = layer.data.length;

                for (var tileIdx = 0; tileIdx < layerDataLength; tileIdx++) {
                    var tid = layer.data[tileIdx];

                    x++;

                    if (x >= map.widthTiles) {
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
                        map.blockedRects.push(rect);
                    }
                }
            }
        };

        $.get('assets/maps/' + filename)
        .success(function(data) {
            configureMap(data);
            map.fullyLoaded = true;
            map.onLoadComplete(true);
        })
        .error(function() {
            map.onLoadComplete(false);
        });

        return map;
    }
});