if (!localStorage.login_code) {
    location.href = '/login.html'
}
require([
    "esri/Map",
    "ditagis/views/MapView",
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
    "esri/widgets/LayerList",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic, GroupLayer,
    Polyline, geometryEngine,
    BasemapToggle, Zoom,
    FeatureLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,
    MapTools,
    watchUtils, Renderer, SystemStatusObject,
    domConstruct, Print, LayerList
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

        var basemapToggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite",
            container: document.getElementById('toggle-basemap')
        });
        basemapToggle.on('toggle', function (event) {
            hiddenmap.toogleGraphics();
        });
        view.ui.components = ["attribution"];


        view.systemVariable = new SystemStatusObject();
        view.systemVariable.user = MapConfigs.user;
        view.session().then(function (user) {
            console.log(user);
            initFeatureLayer();
        });
        function initFeatureLayer() {
            let gr = new GroupLayer({
                title: 'Dữ liệu chuyên đề',
                id: "chuyende"
            });
            map.add(gr);
            for (const layerCfg of view.systemVariable.user.Layers) {
                // for (const layerCfg of MapConfigs.layers) {
                if (layerCfg.GroupName === 'chuyende' && layerCfg.IsView) {
                    let fl = new FeatureLayer({
                        url: 'https://' + layerCfg.Url,
                        title: layerCfg.LayerTitle,
                        id: layerCfg.LayerID,
                        outFields: layerCfg.OutFields ? layerCfg.OutFields.split(',') : ['*'],
                        permission: {
                            create: layerCfg.IsCreate,
                            delete: layerCfg.IsDelete,
                            edit: layerCfg.IsEdit,
                            view: layerCfg.IsView,
                        },
                    });
                    if (layerCfg.Definition != null && layerCfg.Definition != "") {
                        fl.definitionExpression = layerCfg.Definition;
                    }
                    if (fl.id != "NhaMayDienLYR") {
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
            if (event.layer.id === "NhaMayDienLYR") {
                layerNhaMay = event.layerView.layer;

                new Renderer(view, layerNhaMay);
                new MapTools(view, layerNhaMay);
            }
        });
    });