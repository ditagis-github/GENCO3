define([
    "ditagis/layers/FeatureLayer",
    "esri/core/watchUtils",
    "esri/Graphic",
    "esri/tasks/support/Query",
], function (FeatureLayer, watchUtils, Graphic, Query) {

    return class {
        constructor(view, featureLayer) {
            this.view = view;
            this.featureLayer = featureLayer;
            this.rendererSymbol();
            this.createGraphicLayer();
        }
        createGraphicLayer() {
            var renderer = {
                type: "unique-value",
                field: 'PhanLoaiNhaMay',
                uniqueValueInfos: [{
                    value: 1,
                    symbol: {
                        type: "picture-marker",
                        url: "../public/images/map/nhietdien.png",
                        width: "25px",
                        height: "25px"
                    }
                },
                {
                    value: 2,
                    symbol: {
                        type: "picture-marker",
                        url: "../public/images/map/thuydien.png",
                        width: "25px",
                        height: "25px"
                    }
                }, {
                    value: 3,
                    symbol: {
                        type: "picture-marker",
                        url: "../public/images/map/factory.png",
                        width: "12px",
                        height: "12px"
                    }
                }
                ]
            };
            this.graphicLayer = new FeatureLayer({
                fields: this.featureLayer.fields,
                objectIdField: "ObjectID",
                geometryType: "point",
                spatialReference: this.view.spatialReference,
                source: [],
                renderer: renderer,
                title: "Nhà máy",
                outFields: ['*'],
                permission: {
                    create: false,
                    delete: false,
                    edit: false,
                    view: true,
                },
            });
            this.featureLayer.visible = false;
            this.view.map.add(this.graphicLayer);
            this.queryListNhaMay().then((displayResults) => {
                var features = displayResults.features;
                var graphics = [];
                for (const feature of features) {
                    var pointGraphic = new Graphic({
                        geometry: {
                            type: "point", // autocasts as new Point()
                            longitude: feature.geometry.centroid.longitude,
                            latitude: feature.geometry.centroid.latitude
                        },
                        attributes: feature.attributes,
                    });
                    this.graphicLayer.source.add(pointGraphic);
                }
                // this.graphicLayer.renderer = renderer;
            });
        }

        rendererSymbol() {
            var uniqueValueInfos = this.featureLayer.renderer.uniqueValueInfos;
            for (const uniqueValueInfo of uniqueValueInfos) {
                uniqueValueInfo.symbol.color.a = 0.2;
            }
            watchUtils.whenTrue(this.view, "stationary", (evt) => {
                if (this.view.zoom >= 14) {
                    this.graphicLayer.visible = false;
                    this.featureLayer.visible = true;
                }
                else {
                    if (this.featureLayer && this.graphicLayer) {
                        this.graphicLayer.visible = true;
                        this.featureLayer.visible = false;
                    }

                }
            });

        }
        queryListNhaMay() {
            var query = new Query();
            query.where = "1=1";
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.outSpatialReference = view.spatialReference;
            if (this.featureLayer.definitionExpression != null) {
                query.where = this.featureLayer.definitionExpression;
            }
            return this.featureLayer.queryFeatures(query);
        }
    }
});