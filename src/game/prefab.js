var Prefab = Class.extend({
    isPrefab: true,

    id: null,

    onLoadComplete: null,
    fullyLoaded: false,

    data: { },
    layers: [ ],

    widthTiles: 0,
    heightTiles: 0,
    widthPx: 0,
    heightPx: 0,

    tileset: null,
    tilesPerRow: 0,

    blockedRects: [],

    init: function (id) {
        this.id = id;
        this.data = { };
        this.layers = [ ];
        this.widthTiles = 0;
        this.heightTiles = 0;
        this.widthPx = 0;
        this.heightPx = 0;
        this.tilesPerRow = 0;
        this.onLoadComplete = null;
        this.fullyLoaded = false;
    },

    getWidth: function () {
        return this.widthPx;
    },

    getHeight: function () {
        return this.heightPx;
    },

    isRectBlocked: function (ourRect, adjustedX, adjustedY) {
        var blockedRectsLength = this.blockedRects.length;

        for (var i = 0; i < blockedRectsLength; i++) {
            var r = this.blockedRects[i];

            var rectCopy = {
                left:   r.left + adjustedX,
                right:  r.right + adjustedX,
                top:    r.top + adjustedY,
                bottom: r.bottom + adjustedY
            };

            if (Utils.rectIntersects(ourRect, rectCopy)) {
                return true;
            }
        }

        return false;
    },

    draw: function (ctx, posX, posY) {
        this.drawBackground(ctx);
    },

    drawBackground: function (ctx) {
        var layerCount = this.layers.length;

        for (var i = 0; i < layerCount; i++) {
            var layer = this.layers[i];

            if (layer.type != 'tilelayer') {
                continue;
            }

            var layerDataLength = layer.data.length;

            var x = -1;
            var y = 0;

            var isBlocking = Settings.drawCollisions && typeof(layer.properties) != 'undefined' && layer.properties.blocked == '1';

            if (!Settings.drawCollisions && !layer.visible) {
                continue;
            }

            for (var tileIdx = 0; tileIdx < layerDataLength; tileIdx++) {
                var tid = layer.data[tileIdx];

                x++;

                if (x >= this.widthTiles) {
                    y++;
                    x = 0;
                }

                if (tid === 0) {
                    // Invisible (no tile set for this position)
                    continue;
                }

                tid--; // tid is offset by one, for calculation purposes we need it to start at zero

                var fullRows = Math.floor(tid / this.tilesPerRow);

                var srcY = fullRows * Settings.TileSize;
                var srcX = (tid * Settings.TileSize) - (fullRows * this.tilesPerRow * Settings.TileSize);

                var destX = x * Settings.TileSize;
                var destY = y * Settings.TileSize;

                ctx.drawImage(this.tileset, srcX, srcY, Settings.TileSize, Settings.TileSize, destX, destY, Settings.TileSize, Settings.TileSize);

                if (isBlocking) {
                    ctx.beginPath();
                    ctx.rect(destX, destY, Settings.TileSize, Settings.TileSize);
                    ctx.strokeStyle = "#FCEB77";
                    ctx.stroke();
                    ctx.closePath();
                }
            }
        }
    }
});