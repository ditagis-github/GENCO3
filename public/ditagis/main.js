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
    "esri/layers/MapImageLayer",
    "esri/geometry/Extent",
    "ditagis/Popup",
    "ditagis/MapConfigs",
    "ditagis/maptools/thoitiet",
    "ditagis/maptools/hiddenmap",
    "ditagis/maptools/map",
    "ditagis/maptools/hienthibao",
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
    FeatureLayer, MapImageLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,
    MapTools, HienThiBao,
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
        initFeatureLayer();
    });

    function initFeatureLayer() {

        for (const layerCfg of view.systemVariable.user.Layers) {
            // tạo layer
            if (!layerCfg.IsView) continue;
            let fl = new FeatureLayer({
                url: layerCfg.Url,
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
            } else {
                fl.opacity = 0.2;
            }

            // nếu layer tồn tại group
            if (layerCfg.GroupID) {
                // nếu chưa có group trong map thì thêm vào
                let gr = map.findLayerById(layerCfg.GroupID);
                if (!gr) {
                    gr = new GroupLayer({
                        title: layerCfg.GroupName,
                        id: layerCfg.GroupID
                    });
                    map.add(gr);
                }
                // thêm layer vào group
                gr.add(fl);
            }
            // nếu không có group thì add như bình thường
            else {
                map.add(fl);
            }
        }
    }
    var thoitiet = new ThoiTiet();
    var popup = new Popup(view);
    popup.startup();

    view.popup.watch('selectedFeature', (newVal, oldVal) => {
        // khi mà người dùng chọn đối tượng mới
        // thì kiểm tra đối tượng có phải là nhà máy hay không
        // nếu là nhà máy thì hiển thị thời tiết lên
        if (newVal && newVal.layer.id == "NhaMayLYR") {
            var manhamay = newVal.attributes["Ma"];
            thoitiet.laythongtinthoitiet(newVal.geometry, manhamay);
        } else if (newVal && newVal.layer.id == "NhaMayDienLYR") {
            var manhamay = newVal.attributes["Ma"];
            thoitiet.laythongtinthoitiet(newVal.geometry.centroid, manhamay);
        }
        // nếu không phải là nhà máy hoặc là không có đối tượng nào cả thì tắt thời tiết
        else thoitiet.close();
    });
    view.popup.watch('visible', (rs) => {
        !rs && thoitiet.close();
    });

    // if (layer.id == "NhaMayLYR" || layer.id == "NhaMayDienLYR") {
    //     var manhamay = graphic.attributes["Ma"];
    //     this.thoitiet.laythongtinthoitiet(graphic.geometry, manhamay);
    // }
    // else if (layer.id == "NhaMayDienLYR") {

    // }
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