var Router = {
    routes: { },

    register: function (opcode, fn) {
        this.routes[opcode] = fn;
    },

    route: function (data) {
        var op = data.op;

        if (op == null) {
            return;
        }

        if (typeof this.routes[op] != 'undefined') {
            var routeFn = this.routes[op];
            routeFn(data);
        } else {
            console.warn('[Router] Unhandled opcode: ' + op);
        }
    }
};