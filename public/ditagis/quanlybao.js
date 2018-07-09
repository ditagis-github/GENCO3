require([
    "esri/Map",
    "esri/views/MapView",
    "esri/Graphic",
    "esri/widgets/BasemapToggle",
    "ditagis/MapConfigs",
    "ditagis/maptools/hiddenmap",
    "esri/widgets/Print",
    "esri/widgets/Locate",
    "esri/geometry/Polygon",
    "esri/layers/GraphicsLayer",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    BasemapToggle, MapConfigs, HiddenMap,
    Print,Locate, Polygon, GraphicsLayer
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
        graphicsLayer = new GraphicsLayer({
            listMode: 'hide',
            opacity: 0.6
        });
        
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
            view: this.view,
            container: $("#print-widget")[0],
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
        $("#printer-widget").click(() => {
            $("div#print-panel").toggleClass("hidden");
        });
        $(".closePanel_print").click(function () {
            $("div#print-panel").toggleClass("hidden");
        });


        $("#pane > div > div.widget_item.close").click(() => {
            $("div#pane-storm").addClass("hidden");
        });
        $("#inputFiles").change(function (evt) {
            $("div#pane-storm").toggleClass("hidden");
            var img = $('#pane img')[0];
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onloadend = function () {
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        });
        this.view.watch('scale', (newVal, oldVal) => {
            var screen1 = this.view.toScreen(this.point1);
            var screen2 = this.view.toScreen(this.point2);
            var screen3 = this.view.toScreen(this.point3);
            var width = screen2.longitude - screen1.longitude;
            var height = screen3.latitude - screen2.latitude;
            if (this.graphic_polygon) {
                this.graphicsLayer.removeAll();
                this.graphic_polygon = null;
            }
            var img = $('#pane img')[0];
            var fillSymbol = {
                type: "picture-marker", // autocasts as new SimpleFillSymbol()
                url: img.src,
                width: width + "px",
                height: height + "px",
            };
            // Create a symbol for rendering the graphic
            // Add the geometry and symbol to a new graphic
            if (this.polygonGraphic) {
                this.graphic_polygon = new Graphic({
                    geometry: this.polygonGraphic.geometry,
                    symbol: fillSymbol
                });
                this.graphicsLayer.add(this.graphic_polygon);
            }

        });
        $("#pane > div > div.widget_item.check").click(() => {
            var pane = $('#pane');
            let screenCoods = pane.position();
            console.log(screenCoods);
            let width = pane.width(), height = pane.height();
            console.log(width, height);
            var top = screenCoods.top - 70;
            this.point1 = this.view.toMap({
                x: screenCoods.left,
                y: top
            });
            this.point2 = this.view.toMap({
                x: screenCoods.left + width,
                y: top
            });
            this.point3 = this.view.toMap({
                x: screenCoods.left + width,
                y: top + height
            });
            var point4 = this.view.toMap({
                x: screenCoods.left,
                y: top + height
            });
            var polygon = new Polygon({
                rings: [
                    [  // first ring
                        [this.point1.longitude, this.point1.latitude],
                        [this.point2.longitude, this.point2.latitude],
                        [this.point3.longitude, this.point3.latitude],
                        [point4.longitude, point4.latitude],
                    ]
                ]
            });
            this.polygonGraphic = new Graphic({
                geometry: polygon.extent.center,
                symbol: fillSymbol
            });
            var img = $('#pane img')[0];
            var fillSymbol = {
                type: "picture-marker", // autocasts as new SimpleFillSymbol()
                url: img.src,
                width: width + "px",
                height: height + "px",
            };
            if (this.polygonGraphic) {
                this.graphic_polygon = new Graphic({
                    geometry: this.polygonGraphic.geometry,
                    symbol: fillSymbol
                });

                graphicsLayer.add(this.graphic_polygon);
            }
        });
        var hiddenmap = new HiddenMap(view);
        hiddenmap.start();
    });