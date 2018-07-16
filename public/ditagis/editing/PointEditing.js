define([
    "../core/ConstName",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "ditagis/support/Editing",
    "esri/layers/FeatureLayer"
], function (constName, QueryTask, Query, EditingSupport, FeatureLayer) {
    'use strict';
    return class PointEditing {
        constructor(view) {
            this.view = view;
            this.editingSupport = new EditingSupport(view);
            this.systemVariable = view.systemVariable;

        }
        get layer() {
            return this._layer;
        }
        set layer(value) {
            this._layer = value;
        }
        draw(point) {
            this.draw(this.layer, point);
        }

        async draw(layer, graphic) {
            try {
                let attributes = {};

                /**
                 * ví dụ sử dụng domain thì cần phải gán domain vào attributes thì khi thêm đối tượng
                 * vào cơ sở dữ liệu thì mới hiển thị lên được bản đồ
                 */
                if (graphic.attributes) {
                    for (let i in graphic.attributes) {
                        attributes[i] = graphic.attributes[i];
                    }
                }
                if (layer.drawingAttributes) {
                    for (let i in layer.drawingAttributes) {
                        attributes[i] = layer.drawingAttributes[i];
                    }
                }
                //lấy thông tin cập nhật gồm người tạo và thời gian tạo
                // if(notify)
                // notify.update({ 'type': 'info', 'message': 'Đang lấy định danh...', 'progress': 20 });
                const createdInfo = await this.editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    attributes[i] = createdInfo[i];
                }
                let edits = {
                    addFeatures: [{
                        geometry: graphic.geometry,
                        attributes: attributes
                    }]
                };
                layer.applyEdits(edits).then((result) => {
                    if (result.addFeatureResults.length > 0) {
                        let objectId = result.addFeatureResults[0].objectId;
                        if (objectId) {
                            layer.queryFeatures({
                                returnGeometry: true,
                                outSpatialReference: this.view.spatialReference,
                                where: 'OBJECTID = ' + objectId,
                                outFields: ['*']
                            }).then(res => {
                                //neu tim duoc
                                if (res.features[0]) {
                                    let ft = res.features[0];
                                    this.editingSupport.getMaNhaMay({
                                        geometry: ft.geometry
                                    }).then(nhaMayInfo => {
                                        for (let i in nhaMayInfo) {
                                            ft.attributes[i] = nhaMayInfo[i];
                                        }
                                        layer.applyEdits({
                                            updateFeatures: [{
                                                attributes: ft.attributes
                                            }]
                                        }).then((result) => {
                                            console.log(result);
                                        });
                                    })
                                    this.view.popup.open({
                                        features: [ft],
                                        updateLocationEnabled: true
                                    });
                                }
                            });
                        }
                        //khi applyEdits, nếu phát hiện lỗi
                        // if (!res.updateFeatureResults[0].error)
                        // if(notify) notify.update({ 'type': 'danger', 'message': 'Có lỗi xảy ra trong quá trình thực hiện', 'progress': 100 });
                    }
                })
            } catch (err) {
                console.log(err);
            }
        }

    }

});