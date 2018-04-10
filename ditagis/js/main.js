require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Zoom",
    "esri/widgets/Legend",
    "esri/layers/FeatureLayer",
    "esri/geometry/Extent",
    "ditagis/js/Popup",
    "ditagis/js/MapConfigs",
    "esri/core/watchUtils",

    "dojo/dom-construct",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    Polyline, geometryEngine,
    BasemapToggle, Zoom, Legend,
    FeatureLayer,
    Extent, Popup, MapConfigs,
    watchUtils,
    domConstruct
) {
        var map = new Map({
            basemap: "osm"
        });
        var map_ext = new Extent({
            xmin: 11283815.379332686,
            ymin: 897889.6374659585,
            xmax: 12528821.696041306,
            ymax: 2799272.751476678,
            spatialReference: {
                wkid: 102100
            }
        });
        // var map_ext = new Extent({
        //     xmin: 9726945.98722063,
        //     ymin: 154310.22630796302,
        //     xmax: 14085691.088153362,
        //     ymax: 3387902.2708831998,
        //     spatialReference: {
        //         wkid: 102100
        //     }
        // });
        view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: MapConfigs.zoom,
            center: MapConfigs.center,
            // extent: map_ext

        });
        view.ui.move(["zoom"]);

        last_ext = view.extent;
        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite"
        });
        view.ui.add(toggle, "bottom-left");
        view.constraints = {
            minZoom: 6,  // User cannot zoom out beyond a scale of 1:500,000
            rotationEnabled: false  // Disables map rotation
        };
        initFeatureLayer();
        function initFeatureLayer() {
            for (const layer of MapConfigs.layers) {
                var featureLayer = new FeatureLayer(layer);
                if (layer.id != "NhaMay") {
                    featureLayer.minScale = 30000;
                }
                map.add(featureLayer);
            }
        }
        view.when(function () {
            var legend = new Legend({
                view: view,
            });
            // Add widget to the bottom right corner of the view
            view.ui.add(legend, "bottom-right");
        });
        var popup = new Popup(view);
        popup.startup();
        var count = 0;
        view.on("key-down", function (evt) {
            var newExtent = view.extent;
            if (evt.key == 'ArrowDown' && newExtent.ymin < map_ext.ymin) {
                evt.stopPropagation();
            }
            if (evt.key == 'ArrowUp' && newExtent.ymax > map_ext.ymax) {
                evt.stopPropagation();
            }
            if (evt.key == 'ArrowRight' && newExtent.xmax > map_ext.xmax) {
                evt.stopPropagation();
            }
            if (evt.key == 'ArrowLeft' && newExtent.xmin < map_ext.xmin) {
                evt.stopPropagation();
            }
        });
        var x, y;
        view.on("drag", function (evt) {
            var newExtent = view.extent;
            switch (evt.action) {
                case "start":
                    x = evt.x;
                    y = evt.y;
                    break;
                case "update" || "end":
                    if (x > evt.x && newExtent.xmax > map_ext.xmax) {
                        evt.stopPropagation();
                    }
                    else if (x < evt.x && newExtent.xmin < map_ext.xmin) {
                        evt.stopPropagation();
                    }
                    else if (y < evt.y && newExtent.ymax > map_ext.ymax) {
                        evt.stopPropagation();
                    }
                    else if (y > evt.y && newExtent.ymin < map_ext.ymin) {
                        evt.stopPropagation();
                    }
                    break;

            }
        })
        // view.on("mouse-wheel", function (evt) {
        //     var newExtent = view.extent;
        //     if (evt.deltaY > 0) {
        //         if (newExtent.ymax > map_ext.ymax) {
        //             evt.stopPropagation();
        //         }
        //     }

        // });
        var layerNhaMay;
        view.on("layerview-create", function (event) {
            if (event.layer.id === "NhaMay") {
                layerNhaMay = event.layerView.layer;
            }
        });
        var script;
        // if (script) {
        //     document.head.removeChild(script);
        // }
        script = document.createElement('script');
        var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
        script.src = 'http://query.yahooapis.com/v1/public/yql?q='
            + encodedQuery + "&format=json&callback=callbackFunction";
        document.head.appendChild(script);

        watchUtils.whenTrue(view, "stationary", function (evt) {
            // if (view.zoom == 6 &&  view.extent.xmax != map_ext.xmax) {
            //     view.extent = map_ext;
            // }
            if (view.zoom >= 15) {
                layerNhaMay.renderer.symbol.color.a = 0;
            }
            else {
                if (layerNhaMay)
                    layerNhaMay.renderer.symbol.color.a = 1;
            }
        });

        var weather_Element = domConstruct.create("div", {
            id: "weather",
            class: 'weather'
        });
        var doam = domConstruct.create("div", {
            id: "doam",
        });
        weather_Element.appendChild(doam);
        var nhietdo = domConstruct.create("div", {
            id: "nhietdo",
        });
        weather_Element.appendChild(nhietdo);
        var tocdogio = domConstruct.create("div", {
            id: "tocdogio",
        });
        weather_Element.appendChild(tocdogio);
        var refresh_weather = domConstruct.create("button", {
            id: "refresh_weather",
            innerHTML: "Làm mới"
        });
        refresh_weather.onclick = function () {
            if (script) {
                document.head.removeChild(script);
            }
            script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
            script.src = 'http://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=callbackFunction";
            document.head.appendChild(script);
        }
        weather_Element.appendChild(refresh_weather);
        view.ui.add(weather_Element, 'top-right');


    });