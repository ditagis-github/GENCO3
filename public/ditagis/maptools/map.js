define([
    "esri/widgets/Locate",
    "esri/widgets/Locate/LocateViewModel",
    "esri/widgets/Legend",
    "esri/widgets/Print",
    "ditagis/maptools/thoitiet",
    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/QueryLayer",
    "ditagis/toolview/PaneManager",


], function (Locate, LocateViewModel, Legend, Print, ThoiTiet,
    LayerEditor,
    QueryLayer,
    PaneManager,
    ) {

        return class {
            constructor(view, layerNhaMay) {
                this.view = view;
                this.layerNhaMay = layerNhaMay
                this.featuresNhaMay;
                this.startup();
                this.thoitiet = new ThoiTiet();
                this.locateBtn = new Locate({
                    view: view,
                });
                this.locateViewModel = new LocateViewModel({
                    view: view,
                    goToLocationEnabled: false
                });
                this.legend = new Legend({
                    view: this.view,
                    container: "legend-symbols",
                });
                this.layerEditor = new LayerEditor(view);
                this.layerEditor.on("click", addPane);
                this.queryLayer = new QueryLayer(view);
                this.queryLayer.on("click", addPane);

                var paneManager = new PaneManager({
                    element: "#pane-tools"
                })
                function addPane(pane) {
                    paneManager.add(pane);
                }

            }

            startup() {
                $("#danhsachnhamay").on("click", "span.viewData", (result) => {
                    var value = result.currentTarget.attributes.alt.nodeValue;
                    var feature = this.featuresNhaMay.find(f => {
                        return f.attributes['OBJECTID'] == value;
                    });
                    this.view.center = [feature.geometry.centroid.x, feature.geometry.centroid.y];
                    this.view.zoom = 14;
                    var manhamay = feature.attributes["Ma"];
                    this.thoitiet.laythongtinthoitiet(this.view.center, manhamay);
                    $("div#weather-panel").removeClass("hidden");
                });

                $("#danhsachnhamay").on("click", "div.goToDirection", (result) => {
                    var value = result.currentTarget.attributes.alt.nodeValue;
                    var feature = this.featuresNhaMay.find(f =>
                        f.attributes['OBJECTID'] == value
                    );
                    // toa do nha may
                    var longitude = feature.geometry.centroid.x, latitude = feature.geometry.centroid.y;
                    this.locateViewModel.locate().then((response) => {
                        var coords = response.coords;// toa do hien tai
                        var url = `https://www.google.com/maps/dir/${coords.latitude},${coords.longitude}/${latitude},${longitude}`;
                        var win = window.open(url, '_blank');
                        win.focus();
                    });
                });
                $("#danhsachnhamay").on("click", "div.goToDirection1", (result) => {
                    result.stopPropagation();
                    var objectId_first = result.currentTarget.attributes.alt.nodeValue;
                    $('.item-nhamay').css('border', 'red solid 2px');
                    $(`.item-nhamay[alt="${objectId_first}"]`).css('border', 'none');
                    $("#danhsachnhamay").one("click", ".item-nhamay", (evt) => {
                        evt.stopPropagation();
                        $(`.item-nhamay`).css('border', 'none');
                        var feature_first = this.featuresNhaMay.find(f =>
                            f.attributes['OBJECTID'] == objectId_first
                        );
                        var longitude_first = feature_first.geometry.centroid.x, latitude_first = feature_first.geometry.centroid.y;
                        var objectId_second = evt.currentTarget.attributes.alt.nodeValue;
                        if (objectId_first != objectId_second) {
                            var feature_second = this.featuresNhaMay.find(f =>
                                f.attributes['OBJECTID'] == objectId_second
                            );
                            var longitude_second = feature_second.geometry.centroid.x, latitude_second = feature_second.geometry.centroid.y;
                            var url = `https://www.google.com/maps/dir/${latitude_second},${longitude_second}/${latitude_first},${longitude_first}`;
                            var win = window.open(url, '_blank');
                            win.focus();
                        }
                    });
                });

                // function - tools

                // hien thi danh sach nha may
                $("#factorylist").click(() => {
                    $("div#danhsachnhamay").toggleClass("hidden");
                    this.danhsachnhamay();
                });

                // hien thi cac widget ban do
                $("#map-tools").click(() => {
                    $("div.map-tool").toggleClass("hidden");
                });

                // hien thi thong tin thoi tiet
                $("#weather").click(() => {
                    this.thoitiet.laythongtinthoitiet(this.view.center);
                    $("div#weather-panel").toggleClass("hidden");
                });
                $(".closePanel_weather").click(function () {
                    $("div#weather-panel").toggleClass("hidden");
                });

                // In bản đồ

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

                // hien thi chu thich ban do
                $("#legend-widget").click(() => {
                    // this.showLegend();
                    $("div#legend-panel").toggleClass("hidden");
                });
                $(".closePanel_legend").click(function () {
                    $("div#legend-panel").toggleClass("hidden");

                });
                // Biên tập dữ liệu
                $("#editor-widget").click(() => {
                    this.layerEditor.editor();
                });

                $("#statistics-widget").click(() => {
                    this.queryLayer.start();
                })
                
                // map - tools (zoom in, out, location)
                $("#zoom-in").click(() => {
                    this.view.zoom += 1;
                });
                $("#zoom-out").click(() => {
                    this.view.zoom -= 1;
                });
                $("#location").click(() => {
                    this.locateBtn.locate().then((response) => {
                    });
                });

            }
            showLegend() {
                document.getElementById("legend-symbols").innerHTML = "";
                var index = 1;
                var attr = {};
                var resultHtml = "";
                var items = this.legend.activeLayerInfos.items;
                for (const item of items) {
                    if (item.legendElements.length > 0) {
                        var symbol = item.legendElements[0].infos[0].symbol;
                        var title, url, size;
                        title = item.title;
                        url = symbol.url;
                        var row_item_begin = "<div class='row-item'>"
                            + item.title + "<div class='label pull-right'><div class='esri - legend__symbol'>";
                        var row_item_end = " </div>"
                            + " </div>"
                            + "</div>";
                        resultHtml += row_item_begin;
                        if (symbol.type == "picture-marker") {
                            size = 14;

                            if (title == "Camera" || title == "Van")
                                size = 17;
                            resultHtml += "<div style='opacity: 1;'>"
                                + " <svg overflow='hidden' width=" + size + " height=" + size + " style='touch-action: none;'>"
                                + "<defs></defs>"
                                + "<g transform='matrix(1.00000000,0.00000000,0.00000000,1.00000000,6.00000000,6.00000000)'>"
                                + "<image fill-opacity='0' stroke='none' stroke-opacity='0' stroke-width='1' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='4'"
                                + "x='-6' y='-6' width=" + size + " height=" + size + " preserveAspectRatio='none' xmlns: xlink='http://www.w3.org/1999/xlink'"
                                + "xlink:href=" + symbol.url + "></image>"
                                + "</g>"
                                + "</svg >"
                                + "</div >";
                        }
                        if (symbol.type == "simple-fill") {
                            var rgb_fill = "rgb(" + symbol.color.r + ", " + symbol.color.g + ", " + symbol.color.b + ")";
                            var rgb_stroke = "rgb(" + symbol.outline.color.r + ", " + symbol.outline.color.g + ", " + symbol.outline.color.b + ")";
                            resultHtml += "<svg overflow='hidden' width='24' height='24' style='touch-action: none;'>"
                                + "<defs></defs>"
                                + "<g transform='matrix(1.00000000,0.00000000,0.00000000,1.00000000,12.00000000,12.00000000)'>"
                                + "   <path fill='" + rgb_fill + "' fill-opacity= '" + symbol.color.a + "' stroke= '" + rgb_stroke + "' stroke-opacity='" + symbol.outline.color.a
                                + "'       stroke-width='0.5333333333333333' stroke-linecap='butt' stroke-linejoin='miter' stroke-miterlimit='10'"
                                + "        path='M -10,-10 L 10,0 L 10,10 L -10,10 L -10,-10 Z' d='M-10-10L 10 0L 10 10L-10 10L-10-10Z'"
                                + "        fill-rule='evenodd' stroke-dasharray='none' dojoGfxStrokeStyle='solid'></path>"
                                + " </g>"
                                + "  </svg>";
                        }
                        resultHtml += row_item_end;
                    }
                }

                document.getElementById("legend-symbols").innerHTML += resultHtml;

            }

            async danhsachnhamay() {
                var displayResults = await this.queryListNhaMay();
                this.featuresNhaMay = displayResults.features;
                var index = 0;
                var resultHtml = "<ul class='widget-runway-all-cards'>";
                for (var i = 0; i < this.featuresNhaMay.length; i++) {
                    var feature = this.featuresNhaMay[i];
                    var attr = feature.attributes;
                    var imageResults = await this.layerNhaMay.getAttachments(attr["OBJECTID"]);
                    var src = "../public/images/factory/EPS1.jpg";
                    if (imageResults && imageResults.attachmentInfos && imageResults.attachmentInfos.length > 0) {
                        src = imageResults.attachmentInfos[0].src;
                    }
                    index = index + 1;
                    resultHtml += `
                    <span alt='${attr["OBJECTID"]}'class="item-nhamay viewData">
                        <li >
                            <button>
                                <div class="image-hack-clip">
                                    <div class="image-hack-wrapper">
                                        <img src="${src}" alt="Nhà máy">
                                    </div>
                                </div>
                                <div class="image-direction">
                                    <div alt='${attr["OBJECTID"]}' class="widget_item goToDirection1"title="Đến nhà máy khác" >
                                    </div>
                                </div>
                                <div class="image-direction">
                                    <div alt='${attr["OBJECTID"]}' class="widget_item goToDirection" title="Đi đến nhà máy">
                                    </div>
                                </div>
                                <div class="caption-image">
                                    <label class="title-image">${attr["Ten"]}</label>
                                   
                                </div>
                            </button>
                        </li>
                    </span>
                    `
                }
                resultHtml += "</ul>";
                document.getElementById("danhsachnhamay").innerHTML = resultHtml;
            }
            queryListNhaMay() {
                var query = this.layerNhaMay.createQuery();
                query.where = "1=1";
                return this.layerNhaMay.queryFeatures(query);
            }
        }
    });