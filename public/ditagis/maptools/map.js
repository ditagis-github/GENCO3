define([
    "esri/widgets/Locate",
    "esri/widgets/Locate/LocateViewModel",
    "esri/widgets/Legend",
    "esri/widgets/Print",
    "esri/widgets/Home",
    "ditagis/widgets/LayerEditor",
    "ditagis/widgets/QueryLayer",
    "ditagis/toolview/PaneManager",
    "esri/widgets/LayerList",

], function (Locate, LocateViewModel, Legend, Print, Home,
    LayerEditor,
    QueryLayer,
    PaneManager, LayerList
) {

        return class {
            constructor(view, layerNhaMay) {
                this.view = view;
                this.layerNhaMay = layerNhaMay;
                this.featuresNhaMay;
                this.startup();
                this.locateBtn = new Locate({
                    view: view,
                });
                this.locateViewModel = new LocateViewModel({
                    view: view,
                    goToLocationEnabled: false
                });

                this.layerEditor = new LayerEditor(view);
                this.layerEditor.on("click", addPane);
                this.queryLayer = new QueryLayer(view);
                this.queryLayer.on("click", addPane);
                this.layerList = new LayerList({
                    view: view,
                    container: "layer-list-panel"
                });

                this.legend = new Legend({
                    view: this.view,
                    container: "legend-layer-list-panel",
                });
                // this.view.ui.add(this.legend,"top-right");
                $(".esri-component.esri-layer-list.esri-widget.esri-widget--panel").show();
                // Adds widget below other elements in the top left corner of the view

                var paneManager = new PaneManager({
                    element: "#pane-tools"
                })
                function addPane(pane) {
                    paneManager.add(pane);
                }

                var element = $("<div/>", {
                    id: "close-widget",
                    class: "control_item item"
                });
                $('#control_toolbar').append(element);
                var span = $("<span/>", {
                    class: "esri-icon-close",
                    title: "Đóng"
                });
                element.append(span);
                $(".left_panel").hide();
                $("#close-widget").hide();
                $("#close-widget").click(() => {
                    $(".left_panel").hide();
                    $("#close-widget").hide();
                });
            }

            startup() {
                $("#danhsachnhamay").on("click", "span.viewData", (result) => {
                    var value = result.currentTarget.attributes.alt.nodeValue;
                    var feature = this.featuresNhaMay.find(f => {
                        return f.attributes['OBJECTID'] == value;
                    });
                    this.view.popup.open({
                        features: [feature],  // array of graphics
                        updateLocationEnabled: true
                    });

                });

                $("#danhsachnhamay").on("click", "div.goToDirection", (result) => {
                    result.stopPropagation();
                    var value = result.currentTarget.attributes.alt.nodeValue;
                    var feature = this.featuresNhaMay.find(f =>
                        f.attributes['OBJECTID'] == value
                    );
                    // toa do nha may
                    var longitude = feature.geometry.centroid.longitude, latitude = feature.geometry.centroid.latitude;
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
                    $('.item-nhamay li').css('border', 'red solid 2px');
                    $(`.item-nhamay[alt="${objectId_first}"] li`).css('border', 'none');
                    $("#danhsachnhamay").one("click", ".item-nhamay", (evt) => {
                        evt.stopPropagation();
                        $(`.item-nhamay li`).css('border', 'none');
                        var feature_first = this.featuresNhaMay.find(f =>
                            f.attributes['OBJECTID'] == objectId_first
                        );
                        var longitude_first = feature_first.geometry.centroid.longitude, latitude_first = feature_first.geometry.centroid.latitude;
                        var objectId_second = evt.currentTarget.attributes.alt.nodeValue;
                        if (objectId_first != objectId_second) {
                            var feature_second = this.featuresNhaMay.find(f =>
                                f.attributes['OBJECTID'] == objectId_second
                            );
                            var longitude_second = feature_second.geometry.centroid.longitude, latitude_second = feature_second.geometry.centroid.latitude;
                            var url = `https://www.google.com/maps/dir/${latitude_second},${longitude_second}/${latitude_first},${longitude_first}`;
                            var win = window.open(url, '_blank');
                            win.focus();
                        }
                    });
                });

                // function - tools

                // hien thi danh sach nha may
                $("#factorylist").click(() => {
                    $(".left_panel").hide();
                    $("div#danhsachnhamay").toggleClass("hidden");
                    this.danhsachnhamay();

                });

                // In bản đồ

                new Print({
                    view: this.view,
                    container: $("#print-widget")[0],
                    printServiceUrl: "https://ditagis.com:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                });


                $("#printer-widget").click(() => {
                    this.showElement($("div#print-panel"),true);
                });

                // hien thi chu thich ban do
                $("#legend-widget").click(() => {
                    this.showElement($("#legend-layer-list-panel"),true);
                });
                // Biên tập dữ liệu
                $("#editor-widget").click(() => {
                    this.showElement($("#pane-tools"));
                    this.layerEditor.editor();
                });

                $("#statistics-widget").click(() => {
                    this.showElement($("#pane-tools"));
                    this.queryLayer.start();
                })

                // Hiển thị ẩn lớp dữ liệu
                $("#layer-list-widget").click(() => {
                    this.showElement($("#layer-list-panel"),true);

                });
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
                var homeWidget = new Home({
                    view: view,
                });

                $("#home").click(() => {
                    this.view.viewpoint = homeWidget.viewpoint;
                });



            }
            showElement(element, isClose) {
                $(".left_panel").hide();
                element.show();
                if (isClose)
                    $("#close-widget").show();
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
                    let length = imageResults.attachmentInfos.length;
                    if (imageResults && imageResults.attachmentInfos && length> 0) {
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
                query.outSpatialReference = this.view.spatialReference;
                query.where = "1=1";
                query.outFields = ['*'];
                query.orderByFields = ["Ten ASC"];
                if (this.layerNhaMay.definitionExpression != null) {
                    query.where = this.layerNhaMay.definitionExpression;
                }
                return this.layerNhaMay.queryFeatures(query);
            }
        }
    });