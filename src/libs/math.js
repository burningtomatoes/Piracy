var MathHelper = {
    clamp: function (value, min, max) {
        if (value < min) {
            return min;
        }
        else if (value > max) {
            return max;
        }

        return value;
    },

    lerp: function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    },

    lerpAngle: function (startAngle, endAngle, amount) {
        var MAX_ANGLE = 360.0;

        var normalizeAngle = function (angle) {
            while (angle < 0) {
                angle += MAX_ANGLE;
            }

            while (angle >= MAX_ANGLE) {
                angle -= MAX_ANGLE;
            }

            return angle;
        };

        var distanceForward = endAngle - startAngle;
        var distanceBackward = startAngle - endAngle;

        if (normalizeAngle(distanceForward) < normalizeAngle(distanceBackward)) {
            if (endAngle < startAngle) {
                endAngle += MAX_ANGLE;
            }
        }
        else {
            if (endAngle > startAngle) {
                endAngle -= MAX_ANGLE;
            }
        }

        return MathHelper.lerp(startAngle, endAngle, amount);
    }
};