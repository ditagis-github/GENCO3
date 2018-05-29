define([
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/core/watchUtils",
    "esri/Graphic",
], function (GraphicsLayer,FeatureLayer, watchUtils, Graphic) {

    return class {
        constructor(view, featureLayer) {
            this.view = view;
            this.featureLayer = featureLayer;
            this.rendererSymbol();
            this.createGraphicLayer();
        }
        createGraphicLayer() {
            const SYMBOL = {
                type: "picture-marker",
                url: "../ditagis/images/map/factory.png",
                width: "12px",
                height: "12px"
            };
            var renderer = {
                type: "simple",  // autocasts as new SimpleRenderer()
                symbol: SYMBOL
            };
            this.graphicLayer = new FeatureLayer({
                fields: this.featureLayer.fields,
                objectIdField: "ObjectID",
                geometryType: "point",
                spatialReference: this.view.spatialReference,
                source: [],
                renderer: renderer
            });
            this.view.map.add(this.graphicLayer);
            this.queryListNhaMay().then((displayResults) => {
                var features = displayResults.features;
                var graphics = [];
                for (const feature of features) {
                    var pointGraphic = new Graphic({
                        geometry: {
                            type: "point", // autocasts as new Point()
                            longitude: feature.geometry.centroid.x,
                            latitude: feature.geometry.centroid.y
                        },
                        attributes: feature.attributes,
                    });
                    this.graphicLayer.source.add(pointGraphic);
                }
                this.graphicLayer.renderer = renderer;
            });
        }
        rendererSymbol() {
            this.featureLayer.renderer.symbol.color.a = 0;
            watchUtils.whenTrue(this.view, "stationary", (evt) => {
                if (this.view.zoom >= 15) {
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
            var query = this.featureLayer.createQuery();
            query.where = "1=1";
            return this.featureLayer.queryFeatures(query);
        }
    }
});