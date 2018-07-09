require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/layers/GroupLayer",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Zoom",
    "ditagis/layers/FeatureLayer",
    "esri/geometry/Extent",
    "ditagis/Popup",
    "ditagis/MapConfigs",
    "ditagis/maptools/thoitiet",
    "ditagis/maptools/hiddenmap",
    "ditagis/maptools/map",
    "esri/core/watchUtils",
    "ditagis/support/Renderer",
    "ditagis/classes/SystemStatusObject",
    "dojo/dom-construct",
    "esri/widgets/Print",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic, GroupLayer,
    Polyline, geometryEngine,
    BasemapToggle, Zoom,
    FeatureLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,
    MapTools,
    watchUtils, Renderer, SystemStatusObject,
    domConstruct, Print
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
        view.systemVariable = new SystemStatusObject();
        view.systemVariable.user = MapConfigs.user;
        var hiddenmap = new HiddenMap(view);
        hiddenmap.start();
        view.ui.move(["zoom"]);

        var basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite",
            container: document.getElementById('toggle-basemap')
        });
        basemapToggle.on('toggle', function (event) {
            hiddenmap.toogleGraphics();
        });
        view.ui.components = ["attribution"];
        initFeatureLayer();
        function initFeatureLayer() {
            let gr = new GroupLayer({
                title: 'Dữ liệu chuyên đề',
                id: "chuyendehientrang"
            });
            map.add(gr);
            for (const layerCfg of MapConfigs.layers) {
                if (layerCfg.groupLayer === 'chuyendehientrang' && layerCfg.permission.view) {
                    let fl = new FeatureLayer(layerCfg);
                    if (fl.id != "NhaMay") {
                        fl.minScale = 30000;
                        fl.minScale = 36111.909643;
                    }
                    gr.add(fl);
                }
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
                new MapTools(view, layerNhaMay);
            }
        });
    });