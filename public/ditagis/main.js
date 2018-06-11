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
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,GroupLayer,
    Polyline, geometryEngine,
    BasemapToggle, Zoom,
    FeatureLayer,
    Extent, Popup, MapConfigs, ThoiTiet, HiddenMap,
    MapTools,
    watchUtils, Renderer, SystemStatusObject,
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
        view.systemVariable = new SystemStatusObject();
        var user = {
            Capabilities: "QLTKNQ-QLTK",
            DisplayName: "Bưu chính viễn thông",
            Email: null,
            GroupRole: "STTTT",
            ID: "10066",
            Layers: [{
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/7",
                id: "DiemDichVu",
                title: "Điểm dịch vụ",
                outFields: ["*"],
                permission: {
                    create: true,
                    delete: true,
                    edit: true,
                    view: true,
                },
                queryFields: "",
            },
            {
                url: "https://ditagis.com:6443/arcgis/rest/services/GENCO3/DuLieuChuyenDe/FeatureServer/1",
                id: "TramBTS",
                title: "Trạm BTS",
                outFields: ["*"],
                permission: {
                    create: true,
                    delete: true,
                    edit: true,
                    view: true,
                },
                queryFields: "",
            },],
            Password: "bcvt",
            Phone: null,
            PrimaryCapability: null,
            Role: "BCVT",
            RoleName: "Phòng Bưu Chính Viễn Thông",
            Status: true,
            Username: "bcvt",
            date_create: "2017-11-27T17:36:50.997Z",
            expired_date: null,
            last_access: null,
            usser_create: null
        };
        view.systemVariable.user = user;

        var hiddenmap = new HiddenMap(view);
        hiddenmap.start();
        view.ui.move(["zoom"]);

        last_ext = view.extent;
        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite",
            container: document.getElementById('toggle-basemap')
        });
        view.ui.components = ["attribution"];
        // view.ui.add(toggle, "bottom-left");
        initFeatureLayer();
        function initFeatureLayer() {
            // for (const layer of MapConfigs.layers) {
            //     var featureLayer = new FeatureLayer(layer);
            //     if (layer.id != "NhaMay") {
            //         // featureLayer.minScale = 30000;
            //         featureLayer.minScale = 36111.909643;
            //     }
            //     map.add(featureLayer);
            // }
            let gr = new GroupLayer({
                title: 'Dữ liệu chuyên đề',
                id: "chuyendehientrang"
            });
            map.add(gr);
            for (const layerCfg of MapConfigs.layers) {
                if (layerCfg.groupLayer === 'chuyendehientrang' && layerCfg.permission.view) {
                    let fl = new FeatureLayer(layerCfg);
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