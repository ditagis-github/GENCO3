define(["require", "exports", "esri/views/MapView", "ditagis/classes/SystemStatusObject", "esri/request"], function (require, exports, MapView, SystemStatusObject, esriRequest) {
    "use strict";
    class MapViewDTG extends MapView {
        constructor(params) {
            super(params);
            this.systemVariable = new SystemStatusObject();
        }
        session() {
            return new Promise((resolve, reject) => {
                $.ajax("http://localhost:2005/api/layerinfo/ditagis", {
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'GET',
                    headers: {
                        "Authorization": localStorage.login_code
                    }
                })
                    .then(rs => {
                        view.systemVariable.user.Layers = rs;
                        resolve(rs);
                    })
                    .fail(fl => {
                        console.log(fl.responseJSON);
                    })
            });
        }
        switchBasemap(basemaps) {
            basemaps.forEach(function (f) {
                f.watch('visible', watchVisible);
            });
            function watchVisible(newValue, oldValue, property, target) {
                if (newValue) {
                    basemaps.forEach(function (f) {
                        if (f !== target)
                            f.visible = false;
                    });
                }
            }
        }
    }
    return MapViewDTG;
});
