define([
    "esri/Graphic",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/Query",
], function (Graphic,
    Point,
    GraphicsLayer, Query) {

        return class {
            constructor(view, baoFL) {
                this.view = view;
                this.baoFL = baoFL;
                this.graphicsLayer = new GraphicsLayer({
                    // listMode: 'hide',
                    opacity: 0.6,
                    title: baoFL.title,
                    visible:false
                });
                
                this.view.map.add(this.graphicsLayer);
                this.view.then(() => {
                    this.showSymbolFeature();
                });
                
                this.view.watch('scale', (newVal, oldVal) => {
                    var items = this.graphicsLayer.graphics.items;
                    for (const i in items) {
                        var item = items[i];
                        var points = item.points;
                        let width = this.getDistance2Point(points[0], points[1]);
                        let height = this.getDistance2Point(points[1], points[2]);
                        item.symbol.width = width + "px";
                        item.symbol.height = height + "px";
                    }

                });
            }
            showSymbolFeature() {
                this.layDanhSachDiemBao(this.baoFL).then((displayResults) => {
                    this.graphicsLayer.removeAll();
                    var features = displayResults.features;
                    for (var i = 0; i < features.length; i++) {
                        let feature = features[i];
                        let attr = feature.attributes;
                        feature.layer.getAttachments(attr["OBJECTID"]).then((imageResults) => {
                            if (imageResults && imageResults.attachmentInfos && imageResults.attachmentInfos.length > 0) {
                                var src = imageResults.attachmentInfos[0].src;
                                var point1 = this.latLngToPoint(attr.D1_Lat, attr.D1_Lng);
                                var point2 = this.latLngToPoint(attr.D2_Lat, attr.D2_Lng);
                                var point3 = this.latLngToPoint(attr.D3_Lat, attr.D3_Lng);
                                let width = this.getDistance2Point(point1, point2);
                                let height = this.getDistance2Point(point2, point3);
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
            layDanhSachDiemBao(layer) {
                var query = new Query();
                query.where = "1=1";
                query.outFields = ["*"];
                query.returnGeometry = true;
                query.outSpatialReference = view.spatialReference;
                return layer.queryFeatures(query);
            }
            latLngToPoint(D1_Lat, D1_Lng) {
                return new Point({
                    latitude: D1_Lat,
                    longitude: D1_Lng,
                    spatialReference: view.spatialReference
                });
            }
            getDistance2Point(point1, point2) {
                var screen1 = view.toScreen(point1);
                var screen2 = view.toScreen(point2);
                let x1 = screen1.longitude, x2 = screen2.longitude,
                    y1 = screen1.latitude, y2 = screen2.latitude;
                return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
            }
            start() {

            }
        }
    });