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
    "ditagis/js/maptools/thoitiet",
    "ditagis/js/maptools/hiddenmap",
    "esri/core/watchUtils",
    "ditagis/support/Renderer",
    "dojo/dom-construct",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    Polyline, geometryEngine,
    BasemapToggle, Zoom, Legend,
    FeatureLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,
    watchUtils, Renderer,
    domConstruct
) {
        var map = new Map({
            basemap: "osm"
        });
        view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: MapConfigs.zoom,
            center: MapConfigs.center,
        });

        var hiddenmap = new HiddenMap(view);
        hiddenmap.start();
        view.ui.move(["zoom"]);

        last_ext = view.extent;
        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite"
        });
        view.ui.add(toggle, "bottom-left");
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

        var layerNhaMay;
        view.on("layerview-create", function (event) {
            if (event.layer.id === "NhaMay") {
                layerNhaMay = event.layerView.layer;
                new Renderer(view, layerNhaMay);
            }
        });
        var thoitiet = new ThoiTiet();
        thoitiet.start();








    });