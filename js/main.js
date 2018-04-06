var view;
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/views/2d/draw/Draw",
    "esri/Graphic",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/widgets/BasemapToggle",
    "esri/widgets/Zoom",
    "esri/geometry/Extent",

    "dojo/domReady!"
], function (
    Map, MapView,
    Draw, Graphic,
    Polyline, geometryEngine,
    BasemapToggle, Zoom, Extent
) {
        var map = new Map({
            basemap: "osm"
        });
        var last_ext = null;
        var map_ext = new Extent({
            xmin: 10845984.081315313,
            ymin: 1098460.399686209,
            xmax: 12966652.99405868,
            ymax: 2715256.4219738273,
            spatialReference: {
                wkid: 102100
            }
        });
        // var map_ext = new Extent({
        //     xmin: 11283815.379332686,
        //     ymin: 1098460.3996862087,
        //     xmax: 12528821.696041306,
        //     ymax: 2715256.4219738273,
        //     spatialReference: {
        //         wkid: 102100
        //     }
        // });
        view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 6,
            center: [106.9562792, 16.8799795],
            // extent: map_ext

        });
        view.ui.move(["zoom"]);
       
        last_ext = view.extent;
        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "satellite"
        });
        view.constraints = {
            // minZoom: 6  ,  // User cannot zoom out beyond a scale of 1:500,000
            rotationEnabled: false  // Disables map rotation
        };
        // prevents zooming with the + and - keys
        view.on("key-down", function (evt) {
            setExtentKeyDown(evt);
            var newExtent = view.extent;
            // console.log([newExtent.xmax, newExtent.xmin, newExtent.ymax, newExtent.ymin]);
        });
        // view.on("double-click", setExtent);
        // view.on("mouse-wheel", setExtent);
        // view.on("drag", setExtentKeyDown);
        function setLast_Extent(evt) {
            last_ext = view.extent;
        }
        function setExtentKeyDown(evt) {
            // evt.stopPropagation();

            var newExtent = view.extent;
            // console.log([newExtent.xmax, newExtent.xmin, newExtent.ymax, newExtent.ymin]);
            // console.log([map_ext.xmax, map_ext.xmin, map_ext.ymax, map_ext.ymin]);
            // console.log([last_ext.xmax, last_ext.xmin, last_ext.ymax, last_ext.ymin]);
            if (newExtent.xmax >= map_ext.xmax || newExtent.xmin <= map_ext.xmin || newExtent.ymin <= map_ext.ymin || newExtent.ymax >= map_ext.ymax) {
                evt.stopPropagation();
                // console.log([newExtent.xmax, map_ext.xmax]);
                // console.log("1");
                // console.log([last_ext.xmax, last_ext.xmin, last_ext.ymax, last_ext.ymin]);
                view.extent = last_ext;
                // view.extent = map_ext;
                // evt.stopPropagation();
            }

            last_ext = view.extent;
        }
        function setExtent(evt) {
            // evt.stopPropagation();

            var newExtent = view.extent;
            // console.log([newExtent.xmax, newExtent.xmin, newExtent.ymax, newExtent.ymin]);
            // console.log([map_ext.xmax, map_ext.xmin, map_ext.ymax, map_ext.ymin]);
            // console.log([last_ext.xmax, last_ext.xmin, last_ext.ymax, last_ext.ymin]);
            // if (newExtent.xmax > last_ext.xmax || newExtent.xmin < last_ext.xmin || newExtent.ymin < last_ext.ymin || newExtent.ymax > last_ext.ymax) {
            //     evt.stopPropagation();
            //     // console.log([newExtent.xmax, map_ext.xmax]);
            //     // console.log("1");
            //     console.log([last_ext.xmax, last_ext.xmin, last_ext.ymax, last_ext.ymin]);
            //     // view.extent = last_ext;
            //     // view.extent = map_ext;
            //     // evt.stopPropagation();
            // }
            // else if (newExtent.xmax > map_ext.xmax || newExtent.xmin < map_ext.xmin || newExtent.ymin < map_ext.ymin || newExtent.ymax > map_ext.ymax) {
            //     evt.stopPropagation();
            //     // console.log([newExtent.xmax, map_ext.xmax]);
            //     // console.log("1");
            //     // console.log([last_ext.xmax, last_ext.xmin, last_ext.ymax, last_ext.ymin]);
            //     // view.extent = last_ext;
            //     // view.extent = map_ext;
            //     // evt.stopPropagation();
            // }

            last_ext = view.extent;
        }



    });