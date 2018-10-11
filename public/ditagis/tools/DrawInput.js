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
                this.resetInput();
                this.graphicsLayer.removeAll();
            }
            getInputPoints() {
                return new Promise((resolve, reject) => {
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
                    this.inputWindow = $('#nhaptoado').kendoWindow({
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
                            this.inputWindow.close();

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
                        this.inputWindow.close();
                    });
                    this.inputWindow.open();
                });
            }
            actionEventInputTable() {

                $(document).ready(() => {
                    var actions = $("div.group-input table td:last-child").html();
                    $(".k-grid-addnew").attr("disabled", "disabled");
                    $(".k-grid-complete").attr("disabled", "disabled");
                    $('#nhaptoado .k-grid-addnew').click(() => {
                        $(".k-grid-addnew").attr("disabled", "disabled");
                        var row = '<tr>' +
                            '<td><input type="number" class="form-control" name="name" id="name"></td>' +
                            '<td><input type="number" class="form-control" name="department" id="department"></td>' +
                            '<td>' + actions + '</td>' +
                            '</tr>';
                        $("div.group-input table").append(row);
                    });
                    $(document).on("click", ".add", (event) => {
                        var target = event.target;
                        var empty = false;
                        var input = $(target).parents("tr").find('input[type="number"]');
                        input.each(function () {
                            if (!$(this).val()) {
                                $(this).addClass("error");
                                empty = true;
                            } else {
                                $(this).removeClass("error");
                            }
                        });
                        $(target).parents("tr").find(".error").first().focus();
                        if (!empty) {
                            input.each(function () {
                                $(this).parent("td").html($(this).val());
                            });
                            $(target).parents("tr").find(".add, .edit").toggle();
                            $(".k-grid-addnew").removeAttr("disabled");
                            var trs = $("table tbody tr");
                            this.getPathsOfTable(trs);
                        }

                    });
                    // Edit row on edit button click
                    $(document).on("click", ".edit", function () {
                        $(this).parents("tr").find("td:not(:last-child)").each(function () {
                            $(this).html('<input type="number" class="form-control" value="' + $(this).text() + '">');
                        });
                        $(this).parents("tr").find(".add, .edit").toggle();
                        $(".k-grid-addnew").removeAttr("disabled");

                    });
                    // Delete row on delete button click
                    $(document).on("click", ".delete", function () {
                        $(this).parents("tr").remove();
                        var trs = $("table tbody tr");
                        this.getPathsOfTable(trs);
                        $(".k-grid-addnew").removeAttr("disabled");
                    });

                    $('#nhaptoado .k-grid-cancel').click(() => {
                        this.inputWindow.close();
                    });
                });


            }
            getPathsOfTable(trs) {
                var paths = [];
                trs.each(function () {
                    let toadox = $(this).find('td').eq(0).text();
                    let toadoy = $(this).find('td').eq(1).text();
                    var xy = webMercatorUtils.lngLatToXY(parseFloat(toadox), parseFloat(toadoy));
                    paths.push(xy);
                });
                if (paths.length > 1){
                    $(".k-grid-complete").removeAttr("disabled");
                }
                   
                this.refreshMainGraphic(paths);
            }

            getInputPolyline() {
                return new Promise((resolve, reject) => {
                    $('#nhaptoado').html(
                        `<div class="k-popup-edit-form k-window-content k-content">
                        <div class="k-edit-form-container input-container">
                            <div class="group-input">
                                <table class="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Kinh độ</th>
                                            <th>Vĩ độ</th>
                                            <th>Chức năng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><input type="number" class="form-control" name="name" id="name"></td>
                                            <td><input type="number" class="form-control" name="department" id="department"></td>
                                            <td>
                                                <a class="add" title="Thêm" data-toggle="tooltip"><i class="material-icons">&#xE03B;</i></a>
                                                <a class="edit" title="Sửa" data-toggle="tooltip"><i class="material-icons">&#xE254;</i></a>
                                                <a class="delete" title="Xóa" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>      
                            </div>
                            <div class="k-edit-buttons k-state-default">
                                <button class="k-button k-button-icontext k-primary k-grid-complete">
                                    <span class="k-icon k-i-check"> </span>Hoàn thành</button>
                                <button class="k-button k-button-icontext k-grid-cancel">
                                    <span class="k-icon k-i-cancel"> </span>Hủy</button>
                                <button class="k-button k-button-icontext k-grid-addnew">
                                    <span class="k-icon k-i-plus-circle"> </span>Thêm</button>
                            </div>
                        </div>
                    </div>`);
                    this.inputWindow = $('#nhaptoado').kendoWindow({
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
                    this.actionEventInputTable();
                    $('#nhaptoado .k-primary').click(() => {
                        var paths = [];
                        var trs = $("table tbody tr");
                        trs.each(function () {
                            let toadox = $(this).find('td').eq(0).text();
                            let toadoy = $(this).find('td').eq(1).text();
                            var xy = webMercatorUtils.lngLatToXY(parseFloat(toadox), parseFloat(toadoy));
                            paths.push(xy);
                        });
                        this.refreshMainGraphic(paths);
                        resolve({
                            paths: paths,
                        });
                        this.inputWindow.close();
                    });
                    this.inputWindow.open();
                });
            }
        }
        return DrawInput;
    });
