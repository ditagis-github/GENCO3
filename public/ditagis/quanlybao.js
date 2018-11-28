document.getElementById("userName").innerHTML = localStorage.getItem("username");
require([
    "esri/Map",
    "ditagis/views/MapView",
    "esri/Graphic",
    "esri/widgets/BasemapToggle",
    "ditagis/MapConfigs",
    "ditagis/maptools/hiddenmap",
    "ditagis/layers/FeatureLayer",
    "ditagis/classes/SystemStatusObject",
    "esri/widgets/Print",
    "esri/widgets/Locate",
    "esri/geometry/Polygon",
    "esri/geometry/Point",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/Query",
    "esri/widgets/Home",
    "dojo/domReady!"
], function (
    Map, MapView, Graphic,
    BasemapToggle, MapConfigs, HiddenMap, FeatureLayer, SystemStatusObject,
    Print, Locate, Polygon, Point, GraphicsLayer, Query, Home
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
        view.systemVariable = new SystemStatusObject();
        view.systemVariable.user = MapConfigs.user;
        view.session().then(() => {
            initFeatureLayer();
            $('.esri-component.esri-attribution.esri-widget').css("visibility", "visible");
            $('.esri-attribution__powered-by').text('Copyright © 2018 TỔNG CÔNG TY PHÁT ĐIỆN 3 - CTCP');
        });
        this.outFields = ['OBJECTID', 'TenBao', 'TrangThai', 'NguoiCapNhat', 'NgayCapNhat', 'GhiChu'];
        function initFeatureLayer() {
            for (const layerCfg of view.systemVariable.user.Layers) {
                if (layerCfg.LayerID == "baoLYR") {
                    if (!layerCfg.IsCreate) {
                        location.href = '/index.html';
                        return;
                    }
                    if (layerCfg.IsView) {
                        this.baoFL = new FeatureLayer({
                            url: layerCfg.Url,
                            id: layerCfg.LayerID,
                            outFields: ["*"],
                            title: layerCfg.LayerTitle
                        });
                        let data_bao = $("<div/>", {
                            class: "control_item item",
                            id: "show-data"
                        });
                        $('#control_toolbar').append(data_bao);
                        let span = $("<span/>", {
                            title: 'Danh sách bão',
                            class: "esri-icon-duplicate",
                        });
                        data_bao.append(span);
                        data_bao.click(() => {
                            $(".left_panel").hide();
                            $("div#danhsachdiembao").toggleClass("hidden");
                            danhsachdiembao();
                        });
                    }
                    if (layerCfg.IsCreate) {
                        var import_image_widget = $("<div/>", {
                            id: "import-image-widget",
                            class: "control_item item"
                        });
                        $('#control_toolbar').append(import_image_widget);
                        var label = $("<label/>", {
                            title: 'Thêm dữ liệu bão',
                            class: "esri-icon-media",
                            for: 'inputFiles'
                        });
                        var input = $("<input/>", {
                            id: 'inputFiles',
                            type: 'file',
                            name: 'attachment',
                            multiple: 'multiple',
                        });
                        input.attr("hidden", "true")
                        import_image_widget.append(label);
                        this.form = $("<form/>", {
                            enctype: "multipart/form-data", method: "post",
                            html: `<input value="json" name="f" hidden/>`
                        }).appendTo(import_image_widget);
                        form.append(input);
                        input.change(onInputAttachmentChangeHandler.bind(this));

                    }
                    if (layerCfg.IsDelete) {
                        var store_data = $("<div/>", {
                            id: "store-data",
                            class: "control_item item"
                        });
                        $('#control_toolbar').append(store_data);
                        var span = $("<span/>", {
                            title: 'Kết thúc bão',
                            class: "esri-icon-save",
                        });
                        store_data.append(span);
                        // thanh đổi trạng thái hiển thị sang lưu trữ
                        store_data.click(() => {
                            let where = "TrangThai = 1";
                            layDanhSachDiemBao(this.baoFL, where).then((displayResults) => {
                                this.graphicsLayer.removeAll();
                                var features = displayResults.features;
                                for (var i = 0; i < features.length; i++) {
                                    let feature = features[i];
                                    feature.attributes.TrangThai = 2;
                                    let edits = {
                                        updateFeatures: [{
                                            attributes: feature.attributes
                                        }],
                                    };
                                    this.baoFL.applyEdits(edits);
                                }

                            });
                        });
                    }

                }

            }

            var hiddenmap = new HiddenMap(view);
            hiddenmap.start();
            this.graphicsLayer = new GraphicsLayer({
                listMode: 'hide',
                opacity: 0.6
            });


            view.map.add(this.graphicsLayer);
            locateBtn = new Locate({
                view: view,
            });
            view.then(() => {
                showSymbolFeatures();
            })
        }


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
        var homeWidget = new Home({
            view: view,
        });

        $("#home").click(() => {
            this.graphicsLayer.removeAll();
            showSymbolFeatures();
            this.view.viewpoint = homeWidget.viewpoint;
        });
        // print tools
        var print = new Print({
            view: view,
            container: $("#print-widget")[0],
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
        $("#printer-widget").click(() => {
            $("div#print-panel").toggleClass("hidden");
        });
        $("#pane > div > div.widget_item.close").click(() => {
            $("div#pane-storm").addClass("hidden");
        });
        $("#danhsachdiembao").on("click", "span.viewData", (result) => {
            this.graphicsLayer.removeAll();
            let objectID = result.currentTarget.attributes.alt.nodeValue;
            var feature = this.features.find(f => {
                return f.attributes['OBJECTID'] == objectID;
            });
            showSymbolFeature(feature);
            this.view.goTo({
                target: feature.geometry
            });

        });
        $("#danhsachdiembao").on("click", "div#delete-bao", (result) => {
            result.stopPropagation();
            let objectID = result.currentTarget.attributes.alt.nodeValue;
            this.baoFL.applyEdits({
                deleteFeatures: [{
                    objectId: objectID
                }]
            }).then((res) => {
                danhsachdiembao();
                showSymbolFeatures();
            });
        });
        $("#danhsachdiembao").on("click", "div#edit-bao", (result) => {
            result.stopPropagation();
            let objectID = result.currentTarget.attributes.alt.nodeValue;

            if (this.windowKendo && this.windowKendo.data("kendoWindow")) {
                this.windowKendo.data("kendoWindow").close();
                this.windowKendo = null;
            }
            var window = $('<div/>', {
            });
            this.windowKendo = window;
            window.kendoWindow({
                width: "300px",
                title: "Dữ liệu bão",
                visible: false,
                actions: [
                    "Edit",
                    "Delete",
                    "Close"
                ],
                deactivate: function () {
                    this.destroy();
                }
            }).data("kendoWindow").center().open();

            window.data("kendoWindow").wrapper
                .find(".k-i-edit").parent().click((e) => {
                    window.empty();
                    var feature = this.features.find(f => {
                        return f.attributes['OBJECTID'] == objectID;
                    });
                    var attributes = feature.attributes;
                    let divInfo = $('<div/>', {
                        class: 'form-horizontal'
                    }).appendTo(window);
                    let model = {};
                    for (let field of this.baoFL.fields) {
                        for (let outField of this.outFields) {
                            if (outField == field.name) {
                                editField(field, attributes, model, divInfo);
                            }
                        }
                    }
                    var kendoModel = kendo.observable(model);
                    kendo.bind($(window), kendoModel);
                    var accept_button = $('<button/>', {
                        class: "k-button k-primary",
                        text: "Chấp nhận",
                        id: "accept-update"
                    }).appendTo(window);
                    accept_button.click(() => {
                        editFeature(attributes, kendoModel, window);

                    });

                });
            window.data("kendoWindow").wrapper
                .find(".k-i-delete").parent().click((e) => {
                    this.baoFL.applyEdits({
                        deleteFeatures: [{
                            objectId: objectID
                        }]
                    }).then((res) => {
                        danhsachdiembao();
                        showSymbolFeatures();
                        window.data("kendoWindow").close();
                    });
                });

            showDetailFeature(objectID, window);
        });


        view.watch('scale', (newVal, oldVal) => {
            if (this.graphicsLayer) {
                var items = this.graphicsLayer.graphics.items;
                for (const i in items) {
                    var item = items[i];
                    var points = item.points;
                    let width = getDistance2Point(points[0], points[1]);
                    let height = getDistance2Point(points[1], points[2]);
                    item.symbol.width = width + "px";
                    item.symbol.height = height + "px";
                }
            }
        });

        $("#pane > div > div.widget_item.check").click(() => {
            let attributes = {};
            var pane = $('#pane');
            let screenCoods = pane.position();
            console.log(screenCoods);
            let width = pane.width(), height = pane.height();
            console.log(width, height);
            var top = screenCoods.top - 70;
            var left = screenCoods.left;
            var point1 = topLeftToPoint(top, left);
            var point2 = topLeftToPoint(top, left + width);
            var point3 = topLeftToPoint(top + height, left + width);
            var point4 = topLeftToPoint(top + height, left);
            attributes.D1_Lat = point1.latitude;
            attributes.D1_Lng = point1.longitude;
            attributes.D2_Lat = point2.latitude;
            attributes.D2_Lng = point2.longitude;
            attributes.D3_Lat = point3.latitude;
            attributes.D3_Lng = point3.longitude;
            attributes.NguoiCapNhat = localStorage.username;
            attributes.NgayCapNhat = new Date().getTime();
            attributes.TrangThai = 1;
            var polygon = new Polygon({
                rings: [
                    [  // first ring
                        [point1.longitude, point1.latitude],
                        [point2.longitude, point2.latitude],
                        [point3.longitude, point3.latitude],
                        [point4.longitude, point4.latitude],
                    ]
                ]
            });
            let edits = {
                addFeatures: [{
                    geometry: polygon.extent.center,
                    attributes: attributes
                }]
            };
            this.baoFL.applyEdits(edits).then((result) => {
                $("div#pane-storm").addClass("hidden");
                this.baoFL.addAttachments(result.addFeatureResults[0].objectId, this.fileInput_form).then((addRes) => {
                    if (addRes.addAttachmentResult.success) {
                        showSymbolFeatures();
                        danhsachdiembao();
                    }
                });
            });
        });
        async function showDetailFeature(objectID, window) {
            let where = "1 = 1";
            var displayResults = await layDanhSachDiemBao(this.baoFL, where);
            this.features = displayResults.features;
            var feature = this.features.find(f => {
                return f.attributes['OBJECTID'] == objectID;
            });
            var attributes = feature.attributes;
            window.empty();
            let table = $('<table/>', {}).appendTo(window);
            table.kendoGrid({
                sortable: true,
            });
            for (let field of this.baoFL.fields) {
                for (let outField of this.outFields) {
                    if (outField == field.name) {
                        let value = attributes[field.name];
                        let row = $('<tr/>').appendTo(table);
                        $('<td/>', {
                            text: field.alias
                        }).appendTo(row);
                        let tdValue = $('<td/>').appendTo(row);
                        if (value) {
                            let content = value;
                            if (field.domain && field.domain.type === "codedValue") {
                                const codedValues = field.domain.codedValues;
                                content = codedValues.find(f => {
                                    return f.code === value;
                                }).name;
                            } else if (field.type === 'date') {
                                var date = new Date(value)
                                var month = date.getMonth() + 1;
                                var day = date.getDate();
                                var output = (day < 10 ? '0' : '') + day + "/"
                                    + (month < 10 ? '0' : '') + month + '/'
                                    + date.getFullYear();
                                content = output;
                            }

                            tdValue.text(content);
                        }
                    }
                }
            }
        }
        function editFeature(attributes, kendoModel, window) {

            let applyAttributes = {
                objectId: attributes.OBJECTID
            };
            if (!attributes || !kendoModel)
                kendo.alert("Có lỗi xảy ra trong quá trình cập nhật");
            for (let field of this.baoFL.fields) {
                let value = kendoModel.get(field.name);
                if (!value ||
                    (value && value == -1))
                    continue;
                if (field.type === 'date') {
                    if (value.getTime() <= 0)
                        continue;
                    applyAttributes[field.name] = value.getTime();
                } else
                    applyAttributes[field.name] = value;
            }
            this.baoFL.applyEdits({
                updateFeatures: [{
                    attributes: applyAttributes
                }]
            }).then((res) => {
                let updateFeatureResults = res.updateFeatureResults;
                if (updateFeatureResults[0].objectId) {
                    showDetailFeature(updateFeatureResults[0].objectId, window);
                }
            });
        }
        function editField(field, attributes, model, divInfo) {
            if (field.type === 'oid')
                return;
            let inputHTML = '';
            if (field.domain && field.domain.type === "codedValue") {
                let domain = field.domain,
                    codedValues = domain.codedValues;
                let optionHTML = codedValues.map(m => `<option value="${m.code}">${m.name}</option>`);
                inputHTML = `
                                    <select class="form-control" data-bind="value:${field.name}">
                                        <option value='-1'>Chọn ${field.alias}</option>
                                        ${optionHTML}
                                    </select>
                                `;
            } else {
                let inputType = field.type === "string" ? "text" :
                    field.type === "date" ? "date" : "number";
                inputHTML = `<input class="form-control" type="${inputType}" data-bind="value:${field.name}">`;
            }
            let html = `
                        <div class="form-group">
                        <label class="col-sm-4 control-label" for="textinput">${field.alias}</label>
                        <div class="col-sm-8">
                            ${inputHTML}
                        </div>
                        </div>`;
            if (field.type === "date")
                model[field.name] = new Date(attributes[field.name]);
            else
                model[field.name] = attributes[field.name];
            divInfo[0].innerHTML += html;
        }
        // lấy tất cả các điểm bão (lịch sử)
        async function danhsachdiembao() {
            let where = "1 = 1";
            var displayResults = await layDanhSachDiemBao(this.baoFL, where);
            this.features = displayResults.features;
            var index = 0;
            var resultHtml = "<ul class='widget-runway-all-cards'>";
            for (var i = 0; i < this.features.length; i++) {
                var feature = this.features[i];
                var attr = feature.attributes;
                var imageResults = await this.baoFL.getAttachments(attr["OBJECTID"]);
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
                                    <img src="${src}" alt="Điểm bão">
                                </div>
                            </div>
                            <div alt='${attr["OBJECTID"]}' id="edit-bao" class="bao-item">
                                <span class="esri-icon-authorize" title="Thông tin">
                                </span>
                            </div>
                            <div alt='${attr["OBJECTID"]}' id="delete-bao" class="bao-item">
                                <span class="esri-icon-trash" title="Xóa">
                                </span>
                            </div>
                            <div class="caption-image">
                                <label class="title-image">${attr["TenBao"]}</label>
                               
                            </div>
                        </button>
                    </li>
                </span>
                `
            }
            resultHtml += "</ul>";
            document.getElementById("danhsachdiembao").innerHTML = resultHtml;
        }
        // lấy danh sách các điểm bão có trạng thái hiện thị
        function showSymbolFeatures() {
            let where = "TrangThai = 1";
            layDanhSachDiemBao(this.baoFL, where).then((displayResults) => {
                this.graphicsLayer.removeAll();
                var features = displayResults.features;
                for (var i = 0; i < features.length; i++) {
                    let feature = features[i];
                    showSymbolFeature(feature);
                }
            });
        }
        function showSymbolFeature(feature) {
            let attr = feature.attributes;
            feature.layer.getAttachments(attr["OBJECTID"]).then((imageResults) => {
                if (imageResults && imageResults.attachmentInfos && imageResults.attachmentInfos.length > 0) {
                    var src = imageResults.attachmentInfos[0].src;
                    var point1 = latLngToPoint(attr.D1_Lat, attr.D1_Lng);
                    var point2 = latLngToPoint(attr.D2_Lat, attr.D2_Lng);
                    var point3 = latLngToPoint(attr.D3_Lat, attr.D3_Lng);
                    let width = getDistance2Point(point1, point2);
                    let height = getDistance2Point(point2, point3);
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

        function layDanhSachDiemBao(layer, where) {
            var query = new Query();
            query.where = where;
            query.outFields = ["*"];
            query.returnGeometry = true;
            query.outSpatialReference = view.spatialReference;
            query.orderByFields = ["NgayCapNhat DESC"];
            return layer.queryFeatures(query);
        }
        function getDistance2Point(point1, point2) {
            var screen1 = view.toScreen(point1);
            var screen2 = view.toScreen(point2);
            let x1 = screen1.longitude, x2 = screen2.longitude,
                y1 = screen1.latitude, y2 = screen2.latitude;
            return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        }
        function latLngToPoint(D1_Lat, D1_Lng) {
            return new Point({
                latitude: D1_Lat,
                longitude: D1_Lng,
                spatialReference: view.spatialReference
            });
        }
        function topLeftToPoint(top, left) {
            return view.toMap({
                x: left,
                y: top
            });

        }
        function onInputAttachmentChangeHandler(e) {
            $("div#pane-storm").toggleClass("hidden");
            var img = $('#pane img')[0];
            var file1 = e.currentTarget.files[0];
            var reader = new FileReader();
            reader.onloadend = function () {
                img.src = reader.result;
            };
            reader.readAsDataURL(file1);
            let fileInput = e.target;
            let file = fileInput.files[0];
            if (file.size > 20000000) {
                kendo.alert("Dung lượng tệp quá lớn");
                return;
            }
            this.fileInput_form = fileInput.form;
        }

    });