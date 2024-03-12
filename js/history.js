class History {
    #hash = '';
    #parameters = {};
    #callbacks = [];
    #defaults = {};

    setDefault(key, value) {
        this.#defaults[key] = value;
    }

    onChange(callback) {
        this.#callbacks.push(callback);
    }

    autoUpdate() {
        this.check();
        let me = this;
        setTimeout(function() { me.autoUpdate(); }, 100);
    }

    check() {
        if (this.#hash !== location.hash) {
            this.#hash = location.hash;
            this.#parameters = {};
            let hashPieces = location.hash.substring(1).split('&');
            if (hashPieces.length > 0) {
                for (let index = 0; index < hashPieces.length; index++) {
                    let hashPair = hashPieces[index].split('=');
                    let key = hashPair[0];
                    let slugValue = true;
                    if (key.startsWith('!')) {
                        key = key.substring(1);
                        slugValue = false;
                    }
                    let value = hashPair.length > 1 ? hashPair[1] : slugValue;
                    this.#parameters[key] = value;
                }
            }

            for (let i = 0; i < this.#callbacks.length; i++) {
                this.#callbacks[i].call();
            }
        }
    }

    get(key) {
        let defaultValue = this.#defaults.hasOwnProperty(key) ? this.#defaults[key] : null;
        let value = this.#parameters.hasOwnProperty(key) ? this.#parameters[key] : defaultValue;
        if (typeof(value) === 'boolean') {
            return value;
        }
        return value == null ? null : decodeURIComponent(value);
    }

    set(key, value) {
        value = (typeof value == 'undefined') ? true : value;
        if (value === null) {
            this.unset(key);
            return;
        }
        this.#parameters[key] = value;
        this.#rebuildHash();
    }

    unset(key) {
        if (this.#parameters.hasOwnProperty(key)) {
            delete this.#parameters[key];
            this.#rebuildHash();
        }
    }

    #rebuildHash() {
        let hashUrl = '';

        let pieces = [];
        for (let key in this.#parameters) {
            if (!this.#parameters.hasOwnProperty(key)) continue;

            let defaultValue = this.#defaults.hasOwnProperty(key) ? this.#defaults[key] : false;
            let value = this.#parameters[key];
            if (value === defaultValue) continue;
            if (defaultValue === true) {
                key = '!' + key;
            }
            let piece = key;
            if (value != null && value !== true && value !== false) {
                piece += '=' + value;
            }
            pieces.push(piece);
        }

        if (pieces.length > 0) {
            hashUrl = '#' + pieces.join('&');
        }
        if (hashUrl !== this.#hash) {
            location.hash = hashUrl;
            this.#hash = location.hash;
        }
    }
}
