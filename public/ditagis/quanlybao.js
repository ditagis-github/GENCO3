if (!localStorage.login_code) {
    location.href = '/login.html'
}

require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/widgets/BasemapToggle",
    "ditagis/MapConfigs",
    "ditagis/maptools/hiddenmap",
    "ditagis/layers/FeatureLayer",
    "esri/widgets/Print",
    "esri/widgets/Locate",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/Query",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    BasemapToggle, MapConfigs, HiddenMap, FeatureLayer,
    Print, Locate, Polygon, Point, GraphicsLayer, Query
) {
        var map = new Map({
            basemap: "osm"
        });
        var view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: MapConfigs.zoom,
            center: MapConfigs.center,
        });
        graphicsLayer = new GraphicsLayer({
            listMode: 'hide',
            opacity: 0.6
        });
        var baoFL = new FeatureLayer({
            url: 'https://ditagis.com:6443/arcgis/rest/services/GENCO3/QuanLyBao/FeatureServer/0',
            id: "BAOLYR",
            outFields: ["*"],
        });
        // map.add(baoFL);

        view.map.add(graphicsLayer);
        locateBtn = new Locate({
            view: view,
        });

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
        // map tools
        $("#zoom-in").click(() => {
            view.zoom += 1;
        });
        $("#zoom-out").click(() => {
            view.zoom -= 1;
        });
        $("#location").click(() => {
            locateBtn.locate().then((response) => {
            });
        });

        // print tools
        var print = new Print({
            view: view,
            container: $("#print-widget")[0],
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
        $("#printer-widget").click(() => {
            $("div#print-panel").toggleClass("hidden");
        });

        $("#clear-data").click(() => {
            layDanhSachDiemBao(baoFL).then((displayResults) => {
                this.graphicsLayer.removeAll();
                var features = displayResults.features;
                for (var i = 0; i < features.length; i++) {
                    let feature = features[i];
                    let edits = {
                        deleteFeatures: [{
                            objectId: feature.attributes['OBJECTID']
                        }]
                    };
                    baoFL.applyEdits(edits);
                }

            });
        });
        $(".closePanel_print").click(function () {
            $("div#print-panel").toggleClass("hidden");
        });


        $("#pane > div > div.widget_item.close").click(() => {
            $("div#pane-storm").addClass("hidden");
        });
        let attachmentPopup = $("#import-image-widget");
        this.form = $("<form/>", {
            enctype: "multipart/form-data", method: "post",
            html: `<input value="json" name="f" hidden/>`
        }).appendTo(attachmentPopup);
        let fileInput = $("#inputFiles");
        form.append(fileInput);
        fileInput.change(onInputAttachmentChangeHandler.bind(this));

        view.then(() => {
            showSymbolFeature();
        })

        view.watch('scale', (newVal, oldVal) => {
            var items = this.graphicsLayer.graphics.items;
            for (const i in items) {
                var item = items[i];
                var points = item.points;
                let width = getDistance2Point(points[0], points[1]);
                let height = getDistance2Point(points[1], points[2]);
                item.symbol.width = width + "px";
                item.symbol.height = height + "px";
            }

        });

        $("#pane > div > div.widget_item.check").click(() => {

            let attributes = {};
            var pane = $('#pane');
            let screenCoods = pane.position();
            console.log(screenCoods);
            let width = pane.width(), height = pane.height();
            console.log(width, height);
            var top = screenCoods.top - 70;
            var left = screenCoods.left;
            var point1 = topLeftToPoint(top, left);
            var point2 = topLeftToPoint(top, left + width);
            var point3 = topLeftToPoint(top + height, left + width);
            var point4 = topLeftToPoint(top + height, left);
            attributes.D1_Lat = point1.latitude;
            attributes.D1_Lng = point1.longitude;
            attributes.D2_Lat = point2.latitude;
            attributes.D2_Lng = point2.longitude;
            attributes.D3_Lat = point3.latitude;
            attributes.D3_Lng = point3.longitude;
            attributes.NguoiCapNhat = localStorage.username;
            attributes.NgayCapNhat = new Date().getTime();
            var polygon = new Polygon({
                rings: [
                    [  // first ring
                        [point1.longitude, point1.latitude],
                        [point2.longitude, point2.latitude],
                        [point3.longitude, point3.latitude],
                        [point4.longitude, point4.latitude],
                    ]
                ]
            });
            let edits = {
                addFeatures: [{
                    geometry: polygon.extent.center,
                    attributes: attributes
                }]
            };
            baoFL.applyEdits(edits).then((result) => {
                $("div#pane-storm").addClass("hidden");
                baoFL.addAttachments(result.addFeatureResults[0].objectId, this.fileInput_form).then((addRes) => {
                    if (addRes.addAttachmentResult.success) {
                        showSymbolFeature();
                    }
                });
            });
        });
        var hiddenmap = new HiddenMap(view);
        hiddenmap.start();
        function showSymbolFeature() {
            layDanhSachDiemBao(baoFL).then((displayResults) => {
                this.graphicsLayer.removeAll();
                var features = displayResults.features;
                for (var i = 0; i < features.length; i++) {
                    let feature = features[i];
                    let attr = feature.attributes;
                    feature.layer.getAttachments(attr["OBJECTID"]).then((imageResults) => {
                        if (imageResults && imageResults.attachmentInfos && imageResults.attachmentInfos.length > 0) {
                            src = imageResults.attachmentInfos[0].src;
                            var point1 = latLngToPoint(attr.D1_Lat, attr.D1_Lng);
                            var point2 = latLngToPoint(attr.D2_Lat, attr.D2_Lng);
                            var point3 = latLngToPoint(attr.D3_Lat, attr.D3_Lng);
                            let width = getDistance2Point(point1, point2);
                            let height = getDistance2Point(point2, point3);
                            var markerSimbol = {
                                type: "picture-marker",
                                url: src,
                                width: width + "px",
                                height: height + "px",
                            };
                            var points = [];
                            points.push(point1, point2, point3);
                            this.graphic = new Graphic({
                                geometry: feature.geometry,
                                symbol: markerSimbol,
                                points: points
                            });
                            this.graphicsLayer.add(this.graphic);
                        }
                    });
                }

            });

        }
        function layDanhSachDiemBao(layer) {
            var query = new Query();
            query.where = "1=1";
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.outSpatialReference = view.spatialReference;
            return layer.queryFeatures(query);
        }
        function getDistance2Point(point1, point2) {
            var screen1 = view.toScreen(point1);
            var screen2 = view.toScreen(point2);
            let x1 = screen1.longitude, x2 = screen2.longitude,
                y1 = screen1.latitude, y2 = screen2.latitude;
            return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        }
        function latLngToPoint(D1_Lat, D1_Lng) {
            return new Point({
                latitude: D1_Lat,
                longitude: D1_Lng,
                spatialReference: view.spatialReference
            });
        }
        function topLeftToPoint(top, left) {
            return view.toMap({
                x: left,
                y: top
            });

        }
        function onInputAttachmentChangeHandler(e) {
            $("div#pane-storm").toggleClass("hidden");
            var img = $('#pane img')[0];
            var file1 = e.currentTarget.files[0];
            var reader = new FileReader();
            reader.onloadend = function () {
                img.src = reader.result;
            };
            reader.readAsDataURL(file1);
            let fileInput = e.target;
            let file = fileInput.files[0];
            if (file.size > 20000000) {
                kendo.alert("Dung lượng tệp quá lớn");
                return;
            }
            this.fileInput_form = fileInput.form;
        }
    });