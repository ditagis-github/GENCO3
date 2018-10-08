var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "../core/Base", "dojo/dom-construct", "../core/ConstName", "esri/tasks/support/Query", "esri/geometry/geometryEngine"], function (require, exports, Base, domConstruct, ConstName, Query, geometryEngine) {
    "use strict";
    class ReportObject extends Base {
        constructor(view) {
            super();
            this.view = view;
            this.displayFields = {
                nhamaydienLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "Tên", field: "TenNhaMay" },
                    { width: 60, title: "Mã", field: "MaNhaMay " },
                ],
                bonChuaLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "Mã nhà máy", field: "MaNhaMay" },
                    { width: 60, title: "Mã", field: "Ma" },
                    { width: 60, title: "Ghi chú", field: "GhiChu" },
                ],
                tuabinLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "Mã nhà máy", field: "MaNhaMay" },
                    { width: 60, title: "Mã", field: "Ma" },
                    { width: 60, title: "Ghi chú", field: "GhiChu" },
                ],
                lohoiLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "Mã nhà máy", field: "MaNhaMay" },
                    { width: 60, title: "Mã", field: "Ma" },
                    { width: 60, title: "Ghi chú", field: "GhiChu" },
                ],
                ongkhoiLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "MaNhaMay", field: "MaNhaMay" },
                    { width: 60, title: "ChieuCao", field: "ChieuCao" },
                    { width: 60, title: "VatLieu", field: "VatLieu" },
                    { width: 60, title: "ChupOnge", field: "ChupOnge" },
                    { width: 60, title: "TrongLuong", field: "TrongLuong" },
                    { width: 60, title: "LoaiOK", field: "LoaiOK" },
                    { width: 60, title: "KichThuoc", field: "KichThuoc" },
                    { width: 60, title: "DuongKinh", field: "DuongKinh" },
                    { width: 60, title: "DoDay", field: "DoDay" },
                    { width: 60, title: "ApLuc", field: "ApLuc" },
                    { width: 60, title: "LuongKhiThai", field: "LuongKhiThai" },
                    { width: 60, title: "DVQL", field: "DVQL" },
                    { width: 60, title: "TinhTrang", field: "TinhTrang" },
                    { width: 60, title: "GhiChi", field: "GhiChi" },
                ],
                baoLYR: [
                    { width: 60, title: "STT", field: "STT" },
                    { width: 60, title: "Tên bão", field: "TenBao" },
                    { width: 60, title: "Ngày cập nhật", field: "NgayCapNhat" },
                    { width: 60, title: "Người cập nhật", field: "NguoiCapNhat" },
                    { width: 60, title: "Ghi chú", field: "GhiChu" },
                ],
            };
            this.initWindowKendo();

        }
        initWindowKendo() {
            this.report_content = $('<div/>', {
                id: "report-objects"
            }).appendTo(document.body);
            this.table = domConstruct.create('div', {
                id: 'table-report'
            });
            this.report_content.append(this.table);
        }
        convertAttributes(fields, lstAttributes) {
            if (fields && fields.length > 0) {
                fields.forEach(field => {
                    if (field.type === "date") {
                        lstAttributes.forEach(attributes => {
                            if (attributes[field.name])
                                attributes[field.name] = kendo.toString(new Date(attributes[field.name]), "HH:mm:ss dd-MM-yyyy");
                        });
                    }
                });
            }
            return lstAttributes;
        }
        showTable(layer, attributes) {
            let columns = this.displayFields[layer.id];
            var fields = layer.fields;
            if (columns)
                columns.forEach(c => {
                    if (!c.title) {
                        let field = layer.fields.find(f => f.name === c.field);
                        if (field)
                            c.title = field.alias;
                    }
                });
            let kendoData = this.convertAttributes(fields, attributes);
            this.kendoGrid = $('#table-report').empty().kendoGrid({
                toolbar: [{ name: "excel", text: "Xuất báo cáo" }],
                resizable: true,
                excel: {
                    allPages: true,
                    fileName: "Thống kê dữ liệu.xlsx"
                },
                selectable: true,
                pageable: true,
                columns: columns,
                dataSource: {
                    transport: {
                        read: function (e) {
                            e.success(kendoData);
                        },
                        error: function (e) {
                            alert("Status: " + e.status + "; Error message: " + e.errorThrown);
                        }
                    },
                    pageSize: 5,
                    batch: false,
                    schema: {
                        model: {
                            id: "OBJECTID",
                        }
                    }
                },
                change: e => {
                    let selectedRows = e.sender.select();
                    let id = e.sender.dataItem(selectedRows)['OBJECTID'];
                    let query = layer.createQuery();
                    query.where = 'OBJECTID = ' + id;
                    query.outSpatialReference = this.view.spatialReference;
                    query.returnGeometry = true;
                    layer.queryFeatures(query).then(results => {
                        this.view.popup.open({
                            features: results.features,
                            updateLocationEnabled: true
                        });
                    });
                },
                excelExport: (e) => {
                    if (e.data) {
                        for (const item of e.data) {
                        }
                    }
                }
            });
            this.report_content.kendoWindow({
                width: "90%",
                title: layer.title,
                visible: false,
                actions: [
                    "Pin",
                    "Minimize",
                    "Maximize",
                    "Close"
                ],
                position: {
                    top: 100, // or "100px"
                    left: 8
                },

            }).data("kendoWindow").open();
        }
        showReport(layer, features) {
            return __awaiter(this, void 0, void 0, function* () {
                var attributes = features.map(m => m.attributes);
                for (const field of layer.fields) {
                    if (field.domain) {
                        let codedValues = field.domain.codedValues;
                        attributes.forEach(attr => {
                            if (attr[field.name]) {
                                let codedValue = codedValues.find(f => f.code === attr[field.name]);
                                if (codedValue)
                                    attr[field.name] = codedValue.name;
                            }
                        });
                    }
                }
                for (let i = 0; i < features.length; i++) {
                    let element = features[i];
                    element.attributes["STT"] = i + 1;
                }
                if (layer.id === ConstName.TUYENCAPNGAM) {
                    let where = attributes.map(f => `OBJECTID = ${f.OBJECTID}`);
                    attributes.forEach((attr) => __awaiter(this, void 0, void 0, function* () {
                        let OBJECTID = attr.OBJECTID;
                        let results = yield layer.queryFeatures({
                            where: "OBJECTID = " + OBJECTID, returnGeometry: true, outFields: ["OBJECTID"]
                        });
                        let feature = results[0];
                        if (feature) {
                            let geometry = feature.geometry;
                            const diemDau = geometry.getPoint(0, geometry.paths[0].length - 1), diemCuoi = geometry.getPoint(geometry.paths.length - 1, geometry.paths[geometry.paths.length - 1].length - 1);
                            if (!diemDau || !diemCuoi) {
                                attr["XDiemDau"] = "Không xác định";
                                attr["YDiemDau"] = "Không xác định";
                                attr["XDiemCuoi"] = "Không xác định";
                                attr["YDiemCuoi"] = "Không xác định";
                                attr["XaPhuongDiemDau"] = "Không xác định";
                                attr["XaPhuongDiemCuoi"] = "Không xác định";
                                return;
                            }
                            attr["XDiemDau"] = diemDau.x.toFixed(5);
                            attr["YDiemDau"] = diemDau.y.toFixed(5);
                            attr["XDiemCuoi"] = diemCuoi.x.toFixed(5);
                            attr["YDiemCuoi"] = diemCuoi.y.toFixed(5);
                            attr["XaPhuongDiemDau"] = "Không xác định";
                            attr["XaPhuongDiemCuoi"] = "Không xác định";
                            let query = new Query();
                            query.geometry = diemDau;
                        }
                    }));
                }
                this.showTable(layer, attributes);
                return true;
            });
        }
    }
    return ReportObject;
});
