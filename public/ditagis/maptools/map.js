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
    "esri/widgets/Search",
    "esri/layers/FeatureLayer"

], function (Locate, LocateViewModel, Legend, Print, Home,
    LayerEditor,
    QueryLayer,
    PaneManager, LayerList, Search, FeatureLayer
) {

        return class {
            constructor(view) {
                this.view = view;
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
                    container: "layer-list"
                });

                this.legend = new Legend({
                    view: this.view,
                    container: "legend-layer-list",
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
                $(".left_panel").hide();
                $(".close-widget").click(() => {
                    $(".left_panel").hide();
                    $("#weather-panel").hide();
                    $(".pane-item").addClass("hidden");
                });
                var searchWidget = new Search({  
                    includeDefaultSources:false, 
                    locationEnabledBoolean:false,
                    view: view,
                    container:"search-pane",
                    allPlaceholder:"Nhập mã đối tượng"
                 });  
                view.when(() => {
                    // view.ui.add(searchWidget, {
                    //     position: "top-right"
                    // });
                });
                searchWidget.on("search-focus", function (event) {
                    document.querySelector('.esri-search__input').onfocusout = null;
                });
                this.view.on('layerview-create', (evt) => {
                    const layer = evt.layer;
                    var field = layer.getFields().find(function (element) {
                        return element.name == fieldName_NhaMay.MADOITUONG;
                    });
                    if (layer.type === 'feature' && layer.permission && layer.permission.view && field) {
                        var feature = {
                            featureLayer: layer,
                            searchFields: ["MaDoiTuong"],
                            displayField: "MaDoiTuong",
                            exactMatch: true,
                            outFields: ["*"],
                            name: layer.title,
                            placeholder:"Nhập mã đối tượng"
                        }
                        searchWidget.sources.push(feature);
                    }
                });

            }
            setLayerNhaMay(layerNhaMay) {
                this.layerNhaMay = layerNhaMay;
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
                $("#danhsachnhamay").on("click", "div#info-hinhanh-nhamay", (result) => {
                    result.stopPropagation();
                    var objectId = result.currentTarget.attributes.alt.nodeValue;
                    var feature = this.featuresNhaMay.find(f =>
                        f.attributes['OBJECTID'] == objectId
                    );
                    let gr = this.view.map.findLayerById(feature.layer.groupId);
                    var MaNhaMay = feature.attributes.MaNhaMay;
                    if (!gr) return;
                    var layers = gr.layers.items;
                    if (this.windowKendo && this.windowKendo.data("kendoWindow")) {
                        this.windowKendo.data("kendoWindow").close();
                        this.windowKendo = null;
                    }
                    var window = $('<div/>', {
                    });
                    this.windowKendo = window;
                    window.kendoWindow({
                        width: "300px",
                        maxHeight: 300,
                        title: "Thông tin hình ảnh",
                        open: () => {
                        },
                        visible: false,
                        actions: [
                            "Close"
                        ],
                        deactivate: function () {
                            this.destroy();
                        },
                        position: {
                            top: 100, // or "100px"
                            left: 235
                        }
                    });
                    this.ul_treeview = $('<ul/>', {
                        id: "treeview"
                    }).appendTo(window);

                    let li_layer = $('<li/>', {
                    }).appendTo(this.ul_treeview);
                    $('<span/>', {
                        class: "fa fa-folder",
                        text: feature.attributes.TenNhaMay
                    }).appendTo(li_layer)
                    let ul_layer = $('<ul/>').appendTo(li_layer);

                    if (layers && layers.length > 0) {
                        for (const index in layers) {
                            var layer = layers[index];
                            if (layer.id != defineName.TRUSO && layer.id != defineName.GIAOTHONG) {
                                let li_feature = $('<li/>', {
                                }).appendTo(ul_layer);
                                $('<span/>', {
                                    class: "fa fa-folder",
                                    id: 'layerID',
                                    text: layer.title
                                }).appendTo(li_feature);
                                this.featuresOfLayer(layer, MaNhaMay, li_feature);
                            }

                        }
                    }
                    window.data("kendoWindow").open();
                    window.find('#treeview').kendoTreeView();
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
                    // this.danhsachnhamay1();

                });

                // In bản đồ

                new Print({
                    view: this.view,
                    container: $("#print-widget")[0],
                    printServiceUrl: "https://ditagis.com:6443/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                });


                $("#printer-widget").click(() => {
                    this.showElement($("div#print-panel"));
                });

                // hien thi chu thich ban do
                $("#legend-widget").click(() => {
                    this.showElement($("#legend-layer-list-panel"));

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
                $("#search-widget").click(() => {
                    this.showElement($("#search-panel"));

                });
                // Hiển thị ẩn lớp dữ liệu
                $("#layer-list-widget").click(() => {
                    this.showElement($("#layer-list-panel"));

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
            showElement(element) {
                $(".left_panel").hide();
                $(".pane-item").addClass("hidden");
                element.show();
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
            async featuresOfLayer(layer, MaNhaMay, li_feature) {
                let ul_feature = $('<ul/>', {
                }).appendTo(li_feature);
                var rs = await this.queryFeatureLayer(layer, MaNhaMay);
                if (!rs) return;
                let features = rs.features;
                var sumImage = 0;
                if (features.length > 0)
                    for (var i = 0; i < features.length; i++) {
                        var feature = features[i];
                        var attr = feature.attributes;
                        var image_rs = await layer.getAttachments(attr["OBJECTID"]);
                        if (image_rs && image_rs.attachmentInfos.length > 0) {
                            sumImage += 1;
                            let li_object = $('<li/>', {
                                class: 'folder-objectid'
                            }).appendTo(ul_feature);
                            $('<span/>', {
                                class: "fa fa-folder",
                                text: attr["MaDoiTuong"] || attr["MaNhaMay"] || attr["OBJECTID"]
                            }).appendTo(li_object);
                            if (image_rs && image_rs.attachmentInfos) {
                                let infos = image_rs.attachmentInfos;
                                let ul_object = $('<ul/>', {
                                }).appendTo(li_object);
                                for (const info of infos) {
                                    let li_image = $('<li/>', {
                                        class: 'li-image'
                                    }).appendTo(ul_object);
                                    $('<a/>', {
                                        href: info.src,
                                        text: info.name,
                                        target: '_blank'
                                    }).appendTo(li_image);
                                }
                            }
                        }
                    }

                else {
                    li_feature.addClass("hidden");
                }
                if (sumImage > 0)
                    li_feature.find('span#layerID').text(layer.title + "  (" + sumImage + " hình ảnh)");

            }

            async danhsachnhamay() {
                var displayResults = await this.queryListNhaMay();
                if (!displayResults) return;
                this.featuresNhaMay = displayResults.features;
                var index = 0;
                var resultHtml = "<ul class='widget-runway-all-cards'>";
                for (var i = 0; i < this.featuresNhaMay.length; i++) {
                    var feature = this.featuresNhaMay[i];
                    var attr = feature.attributes;
                    var imageResults = await this.layerNhaMay.getAttachments(attr["OBJECTID"]);
                    var src = "../public/images/factory/EPS1.jpg";
                    let length = imageResults.attachmentInfos.length;
                    if (imageResults && imageResults.attachmentInfos && length > 0) {
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
                                <div alt='${attr["OBJECTID"]}' id="info-hinhanh-nhamay" class="nhamay-item">
                                    <span class="esri-icon-authorize" title="Xem thông tin hình ảnh">
                                    </span>
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
                                    <label class="title-image">${attr["TenNhaMay"]}</label>
                                   
                                </div>
                            </button>
                        </li>
                    </span>
                    `
                }
                resultHtml += "</ul>";
                document.getElementById("danhsachnhamay").innerHTML = resultHtml;
            }
            queryFeatureLayer(layer, MaNhaMay) {
                var query = layer.createQuery();
                query.where = "MaNhaMay = '" + MaNhaMay + "'";
                query.outFields = ['OBJECTID', 'MaNhaMay', 'MaDoiTuong'];
                return layer.queryFeatures(query);
            }
            queryListNhaMay() {
                var query = this.layerNhaMay.createQuery();
                query.outSpatialReference = this.view.spatialReference;
                query.where = "1=1";
                query.outFields = ['*'];
                query.orderByFields = ["STT"];
                if (this.layerNhaMay.definitionExpression != null) {
                    query.where = this.layerNhaMay.definitionExpression;
                }
                return this.layerNhaMay.queryFeatures(query);



            }
        }
    });