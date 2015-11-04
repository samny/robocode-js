export class AssetsLoader {
    constructor(assets, basePath, callback) {
        var name, uri, this$ = this;

        basePath = basePath || '';

        this.assets = assets;
        this.callback = callback;
        this._resources = 0;
        this._resources_loaded = 0;
        for (name in assets) {
            uri = assets[name];
            this._resources++;
            this.assets[name] = new Image();
            this.assets[name].src = basePath + uri;
        }
        for (name in assets) {
            uri = assets[name];
            this.assets[name].onload = fn$;
        }
        function fn$() {
            this$._resources_loaded++;
            if (this$._resources_loaded === this$._resources && typeof this$.callback === 'function') {
                return this$.callback();
            }
        }
    }

    is_done_loading() {
        return this._resources_loaded === this._resources;
    }

    get(asset_name) {
        return this.assets[asset_name];
    }
}

AssetsLoader.displayName = 'AssetsLoader';
