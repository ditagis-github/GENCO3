require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Zoom",
    "esri/widgets/Legend",
    "esri/layers/FeatureLayer",
    "esri/geometry/Extent",
    "ditagis/js/Popup",
    "ditagis/js/MapConfigs",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    Polyline, geometryEngine,
    BasemapToggle, Zoom, Legend,
    FeatureLayer,
    Extent, Popup, MapConfigs
) {
        var map = new Map({
            basemap: "osm"
        });
        var map_ext = new Extent({
            xmin: 11283815.379332686,
            ymin: 1098460.3996862087,
            xmax: 12528821.696041306,
            ymax: 2715256.4219738273,
            spatialReference: {
                wkid: 102100
            }
        });
        view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 6,
            // center: [106.9562792, 16.8799795],
            extent: map_ext

        });
        view.ui.move(["zoom"]);

        last_ext = view.extent;
        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite"
        });
        view.ui.add(toggle, "bottom-left");
        view.constraints = {
            // minZoom: 6  ,  // User cannot zoom out beyond a scale of 1:500,000
            rotationEnabled: false  // Disables map rotation
        };
        initFeatureLayer();
        function initFeatureLayer() {
            for (const layer of MapConfigs.layers) {
                var featureLayer = new FeatureLayer(layer);
                if (layer.id != "NhaMay") {
                    featureLayer.minScale = 30000;
                }
                map.add(featureLayer);
            }
        }
        view.when(function () {
            var legend = new Legend({
                view: view,
            });
            // Add widget to the bottom right corner of the view
            view.ui.add(legend, "bottom-right");
        });
        var popup = new Popup(view);
        popup.startup();
        // view.on("mouse-wheel", function (evt) {
        //     evt.stopPropagation();
        //     if (evt.deltaY < 0) {
        //         var zm = view.zoom + 1;

        //         view.goTo({
        //             target: view.center,
        //             zoom: zm
        //         });
        //         console.log(zm);
        //     }
        //     else if (evt.deltaY > 0) {
        //         var zm = view.zoom - 1;

        //         view.goTo({
        //             target: view.center,
        //             zoom: zm
        //         });
        //     }
        // });



    });