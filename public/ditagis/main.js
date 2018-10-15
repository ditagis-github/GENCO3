document.getElementById("userName").innerHTML = localStorage.getItem("username");
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
        var mapTools;
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
            mapTools = new MapTools(view);
        });

        function initFeatureLayer() {

            for (const layerCfg of view.systemVariable.user.Layers) {
                // tạo layer
                if (!layerCfg.IsView) continue;
                if (layerCfg.LayerID == "baoLYR" && layerCfg.IsCreate) {
                    var element = $("<a/>", {
                        target: "_blank",
                        href: "/quanlybao.html",
                        id: "storm-widget",
                        class: "control_item item "
                    });
                    $('#control_toolbar').append(element);
                    var label = $("<span/>", {
                        class: "esri-icon-environment-settings",
                        title: "Đưa dữ liệu bão"
                    });
                    element.append(label);
                }
                let fl = new FeatureLayer({
                    url: layerCfg.Url,
                    title: layerCfg.LayerTitle,
                    id: layerCfg.LayerID,
                    groupId: layerCfg.GroupID,
                    outFields: layerCfg.OutFields ? layerCfg.OutFields.split(',') : ['*'],
                    permission: {
                        create: layerCfg.IsCreate,
                        delete: layerCfg.IsDelete,
                        edit: layerCfg.IsEdit,
                        view: layerCfg.IsView,
                    },
                    // visible:layerCfg.IsVisible,
                });
                if (layerCfg.Definition != null && layerCfg.Definition != "") {
                    fl.definitionExpression = layerCfg.Definition;
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
        view.on("click", function (event) {
            if (this.view.draw) {
                event.stopPropagation();
            }
        });
        view.popup.watch('selectedFeature', (newVal, oldVal) => {
            // khi mà người dùng chọn đối tượng mới
            // thì kiểm tra đối tượng có phải là nhà máy hay không
            // nếu là nhà máy thì hiển thị thời tiết lên
            if (!this.view.draw) {
                if (newVal && newVal.layer.id == defineName.NHAMAY) {
                    var manhamay = newVal.attributes[fieldName_NhaMay.MANHAMAY];
                    thoitiet.laythongtinthoitiet(newVal.geometry, manhamay);
                } else if (newVal && newVal.layer.id == defineName.NHAMAYDIEN) {
                    var manhamay = newVal.attributes[fieldName_NhaMay.MANHAMAY];
                    thoitiet.laythongtinthoitiet(newVal.geometry.centroid, manhamay);
                }
                // nếu không phải là nhà máy hoặc là không có đối tượng nào cả thì tắt thời tiết
                else thoitiet.close();
            }

        });
        view.popup.watch('visible', (rs) => {
            !rs && thoitiet.close();
        });
        var count = 0;
        var layerNhaMay;

        view.on("layerview-create", function (event) {
            let layer = event.layer;
            if (event.layer.id === defineName.NHAMAYDIEN) {
                layerNhaMay = event.layerView.layer;
                new Renderer(view, layerNhaMay);
                mapTools.setLayerNhaMay(layerNhaMay);
            }
            if (event.layer.id === "baoLYR") {
                var layerBao = event.layerView.layer;
                layerBao.listMode = 'hide';
                new HienThiBao(view, layerBao)
            }
        });
    });