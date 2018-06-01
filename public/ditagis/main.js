require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Zoom",
    "public/ditagis/layers/FeatureLayer",
    "esri/geometry/Extent",
    "public/ditagis/Popup",
    "public/ditagis/MapConfigs",
    "public/ditagis/maptools/thoitiet",
    "public/ditagis/maptools/hiddenmap",
    "public/ditagis/maptools/map",
    "esri/core/watchUtils",
    "public/ditagis/support/Renderer",
    "dojo/dom-construct",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    Polyline, geometryEngine,
    BasemapToggle, Zoom,
    FeatureLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,MapTools,
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
            nextBasemap: "satellite",
            container:document.getElementById('toggle-basemap')
        });
        view.ui.components = ["attribution"];
        // view.ui.add(toggle, "bottom-left");
        initFeatureLayer();
        function initFeatureLayer() {
            for (const layer of MapConfigs.layers) {
                var featureLayer = new FeatureLayer(layer);
                if (layer.id != "NhaMay") {
                    // featureLayer.minScale = 30000;
                    featureLayer.minScale = 36111.909643;
                }
                map.add(featureLayer);
            }
        }
        var popup = new Popup(view);
        popup.startup();
        var count = 0;

        var layerNhaMay;
        view.on("layerview-create", function (event) {
            if (event.layer.id === "NhaMay") {
                layerNhaMay = event.layerView.layer;
                
                new Renderer(view, layerNhaMay);
                new MapTools(view,layerNhaMay);
            }
        });
       








    });