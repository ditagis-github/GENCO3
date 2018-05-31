define([
    "esri/layers/FeatureLayer",
    "esri/geometry/Extent",
    "esri/core/watchUtils",
    "esri/widgets/Locate",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "ditagis/js/maptools/thoitiet",
    "esri/Graphic",
], function (FeatureLayer, Extent, watchUtils, Locate, Legend, Expand, ThoiTiet, Graphic) {

    return class {
        constructor(view, layerNhaMay) {
            this.view = view;
            this.layerNhaMay = layerNhaMay;
            this.featuresNhaMay;
            this.startup();
            this.thoitiet = new ThoiTiet();
            this.locateBtn = new Locate({
                viewModel: {
                    view: view,
                }
            });
            this.view.when(() => {
                this.legend = new Legend({
                    view: this.view,
                });
            })
        }
        startup() {
            $("#inforDetails").on("click", "span.viewData", (result) => {
                $("div#weather_panel").toggleClass("hidden");
                var value = result.currentTarget.attributes.alt.nodeValue;
                var feature = this.featuresNhaMay.find(f => {
                    return f.attributes['OBJECTID'] == value;
                })
                this.view.center = [feature.geometry.centroid.x, feature.geometry.centroid.y];
                this.view.zoom = 14;
                this.thoitiet.laythongtinthoitiet(this.view.center);
            });

            // function - tools

            // hien thi danh sach nha may
            $("#factorylist").click(() => {
                $("div#danhsachnhamay").toggleClass("hidden");
                this.danhsachnhamay();
            });
            $(".closePanel_NhaMay").click(function () {
                $("div#listNhaMay").toggleClass("hidden");
            });

            // hien thi cac widget ban do
            $("#map-tools").click(() => {
                $("div.map-tool").toggleClass("hidden");
            });

            // hien thi thong tin thoi tiet
            $("#weather").click(() => {
                $("div#weather-panel").toggleClass("hidden");
            });
            $(".closePanel_weather").click(function () {
                $("div#weather-panel").toggleClass("hidden");
            });

            // hien thi chu thich ban do
            $("#legend-widget").click(() => {
                this.showLegend();
                $("div#legend-panel").toggleClass("hidden");
            });
            $(".closePanel_legend").click(function () {
                $("div#legend-panel").toggleClass("hidden");
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
                    console.log(response);
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

            document.getElementById("legend-symbols").innerHTML += resultHtml;

        }
        danhsachnhamay() {
            this.queryListNhaMay().then((displayResults) => {
                this.featuresNhaMay = displayResults.features;
                var resultHtml = "<ul class='widget-runway-all-cards'>";
                var index = 0;
                for (var i = 0; i < this.featuresNhaMay.length; i++) {
                    var feature = this.featuresNhaMay[i];
                    var attr = feature.attributes;
                    index = index += 1;
                    resultHtml += `
                    <span class="item-nhamay">
                        <li >
                            <button>
                                <div class="image-hack-clip">
                                    <div class="image-hack-wrapper">
                                        <img src="../ditagis/images/factory/EPS1.jpg" alt="Nhà máy">
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
            });
        }
        danhsachnhamay1() {
            this.queryListNhaMay().then((displayResults) => {
                this.featuresNhaMay = displayResults.features;
                var resultHtml = "";
                var index = 0;
                for (var i = 0; i < this.featuresNhaMay.length; i++) {
                    var feature = this.featuresNhaMay[i];
                    var attr = feature.attributes;
                    index = index += 1;
                    resultHtml += "<tr class='item'> <td> " + (index) + "</td> <td>" + attr["Ma_NhaMay"] + "</td> <td> " + attr["Ten"] + "  </td>  <td> " + attr["DiaChi"]
                        + "  </td> <td> " + attr["LoaiHinhSX"] + " </td> <td> <span alt='" + attr["OBJECTID"] + "' class='label label-danger pull-right viewData' >Xem</span> </td></tr>";

                }
                document.getElementById("inforDetails").innerHTML = resultHtml;
            });
        }
        xemchitietnhamay(OBJECTID) {

        }
        queryListNhaMay() {
            var query = this.layerNhaMay.createQuery();
            query.where = "1=1";
            return this.layerNhaMay.queryFeatures(query);
        }
    }
});