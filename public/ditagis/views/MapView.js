define(["ditagis/core/LinkAPI", "esri/views/MapView", "ditagis/classes/SystemStatusObject", "esri/request"], function (LinkAPI, MapView, SystemStatusObject, esriRequest) {
    "use strict";
    class MapViewDTG extends MapView {
        constructor(params) {
            super(params);
            this.systemVariable = new SystemStatusObject();
        }
        session() {
            return new Promise((resolve, reject) => {
                $.ajax(LinkAPI.ACCOUNT_PROFILE, {
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'GET',
                    headers: {
                        "Authorization": localStorage.login_code
                    },
                    statusCode: {
                        0: function () {
                            location.href = '/login.html';
                        }
                    }
                })
                    .then(rs => {
                        view.systemVariable.user = rs;
                    })
                    .fail(fl => {
                        console.log(fl.responseJSON);
                    })
                $.ajax(LinkAPI.LAYER_INFOS, {
                    contentType: 'application/json',
                    dataType: 'json',
                    type: 'GET',
                    headers: {
                        "Authorization": localStorage.login_code
                    },
                    statusCode: {
                        0: function () {
                            location.href = '/login.html';
                        }
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
