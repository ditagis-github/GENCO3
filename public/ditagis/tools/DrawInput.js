define(["../core/Base",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
    "esri/tasks/support/ProjectParameters", "esri/tasks/GeometryService",
    "esri/geometry/support/webMercatorUtils"], function (
        Base, Point, Polyline,
        Graphic, GraphicsLayer,
        ProjectParameters, GeometryService, webMercatorUtils) {
        "use strict";
        class DrawInput extends Base {
            constructor(view) {
                super();
                this.view = view;
                this.graphicsLayer = new GraphicsLayer({
                    listMode: "hide"
                });
                this.view.map.add(this.graphicsLayer);
                this.geometryService = new GeometryService({ url: "https://ditagis.com:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer" });
                $('<div/>', {
                    id: "nhaptoado"
                }).appendTo(document.body);
                this.paths = [];

            }
            refreshMainGraphic(paths) {
                this.graphicsLayer.removeAll();
                var graphic = new Graphic({
                    geometry: new Polyline({
                        paths: paths,
                        spatialReference: this.view.spatialReference
                    }),
                    symbol: {
                        type: "simple-line",
                        color: [178, 102, 234],
                        width: 1,
                        cap: "round",
                        join: "round"
                    }
                });
                this.graphicsLayer.add(graphic);
            }
            resetInput() {
                $("#nhaptoado input[name='toadox']").val(null);
                $("#nhaptoado input[name='toadoy']").val(null);
            }
            closeWindowKendo() {
                this.paths = [];
                this.resetInput();
                this.graphicsLayer.removeAll();
            }
            getInputPoints() {
                return new Promise((resolve, reject) => {
                    var inputWindow;
                    $('#nhaptoado').html(
                        `<div class="k-popup-edit-form k-window-content k-content">
                        <div class="k-edit-form-container input-container">
                            <div class="group-input">
                                <div class="k-edit-label">
                                    <label for="toadox">Tọa độ x:</label>
                                </div>
                                <div data-container-for="toadox" class="k-edit-field">
                                    <input type="text" name="toadox" class="k-input k-textbox" />
                                </div>
                                <div class="k-edit-label">
                                    <label for="toadoy">Tọa độ y:</label>
                                </div>
                                <div data-container-for="toadoy" class="k-edit-field">
                                    <input type="text" name="toadoy" class="k-input k-textbox" />
                                </div>        
                            </div>
                            <div class="k-edit-buttons k-state-default">
                                <a role="button" class="k-button k-button-icontext k-primary k-grid-complete">
                                    <span class="k-icon k-i-check"> </span>Hoàn thành</a>
                                <a role="button" class="k-button k-button-icontext k-grid-cancel">
                                    <span class="k-icon k-i-cancel"> </span>Hủy</a>
                                <a role="button" class="k-button k-button-icontext k-grid-update">
                                    <span class="k-icon k-i-plus-circle"> </span>Thêm</a>
                            </div>
                        </div>
                    </div>`);
                    inputWindow = $('#nhaptoado').kendoWindow({
                        title: "Nhập tọa độ",
                        position: {
                            top: 100,
                            left: 8
                        },
                        visible: false,
                        actions: [
                            "Close"
                        ],
                        close: this.closeWindowKendo.bind(this)
                    }).data("kendoWindow");
                    $('#nhaptoado .k-primary').click(() => {
                        const toadox = $("#nhaptoado input[name='toadox']").val().toString();
                        const toadoy = $("#nhaptoado input[name='toadoy']").val().toString();
                        if (!toadox || !toadoy)
                            kendo.alert('Vui lòng điền đầy đủ thông tin');
                        else {
                            let point = new Point({
                                longitude: parseFloat(toadox),
                                latitude: parseFloat(toadoy),
                            });
                            var xy = webMercatorUtils.lngLatToXY(parseFloat(toadox), parseFloat(toadoy));
                            this.paths.push(xy);
                            this.refreshMainGraphic(this.paths);
                            resolve({
                                paths: this.paths,
                                point: point
                            });
                            inputWindow.close();

                        }
                    });
                    $('#nhaptoado .k-grid-update').click(() => {
                        const toadox = $("#nhaptoado input[name='toadox']").val().toString();
                        const toadoy = $("#nhaptoado input[name='toadoy']").val().toString();
                        if (!toadox || !toadoy)
                            kendo.alert('Vui lòng điền đầy đủ thông tin');
                        else {
                            var xy = webMercatorUtils.lngLatToXY(parseFloat(toadox), parseFloat(toadoy));
                            this.paths.push(xy);
                            this.refreshMainGraphic(this.paths);
                            this.resetInput();
                        }
                    });

                    $('#nhaptoado .k-grid-cancel').click(function () {
                        inputWindow.close();
                    });
                    inputWindow.open();
                });
            }
        }
        return DrawInput;
    });
