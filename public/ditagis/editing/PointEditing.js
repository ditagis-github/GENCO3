define([
    "../core/ConstName",
    "esri/tasks/QueryTask",
    "esri/tasks/support/Query",
    "ditagis/support/Editing",
    "esri/layers/FeatureLayer",
    "ditagis/toolview/InfosManager"
], function (constName, QueryTask, Query, EditingSupport, FeatureLayer, InfosManager) {
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
                const createdInfo = await this.editingSupport.getCreatedInfo(this.view);
                for (let i in createdInfo) {
                    attributes[i] = createdInfo[i];
                }
                this.editingSupport.getMaNhaMay({
                    geometry: graphic.geometry,
                    layerID: layer.id
                }).then(nhaMayInfo => {
                    if (nhaMayInfo) {
                        for (let i in nhaMayInfo) {
                            attributes[i] = nhaMayInfo[i];
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
                                            this.view.popup.open({
                                                features: [ft],
                                                updateLocationEnabled: true
                                            });
                                        }
                                    });
                                }
                                var infos = ["Thêm đối tượng thành công"
                                ];
                                InfosManager.instance(view).show(infos, "alert-success");
                            }
                        });
                    }
                    else {
                        var infos = ["Thêm đối tượng không thành công"
                        ];
                        InfosManager.instance(view).show(infos, "alert-error");
                    }
                }, (reason) => {
                    var infos = ["Thêm đối tượng không thành công"
                    ];
                    InfosManager.instance(view).show(infos, "alert-error");
                });
            } catch (err) {
                var infos = ["Thêm đối tượng không thành công"
                ];
                InfosManager.instance(view).show(infos, "alert-error");
            }
        }

    }

});