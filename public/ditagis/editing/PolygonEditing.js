define([
    "ditagis/support/Editing",
    "ditagis/toolview/InfosManager"
], function (EditingSupport, InfosManager) {
    'use strict';
    return class {
        constructor(view) {
            this.view = view;
            this.systemVariable = view.systemVariable;
            this.editingSupport = new EditingSupport(view);
            this.systemVariable = this.view.systemVariable;
        }
        get layer() {
            return this._layer;
        }
        set layer(value) {
            this._layer = value;
        }

        draw(drawLayer = this.layer, geometry) {
            return new Promise((resolve, reject) => {
                let attributes = {};
                for (var i in drawLayer.drawingAttributes) {
                    attributes[i] = drawLayer.drawingAttributes[i];
                }
                this.editingSupport.getMaNhaMay({
                    geometry: geometry,
                    layerID: drawLayer.id
                }).then(nhaMayInfo => {
                    var field = drawLayer.getFields().find(function (element) {
                        return element.name == fieldName_NhaMay.MANHAMAY;
                    });
                    if (nhaMayInfo || !field || drawLayer.id == defineName.NHAMAYDIEN) {
                        for (let i in nhaMayInfo) {
                            attributes[i] = nhaMayInfo[i];
                        }
                        let edits = {
                            addFeatures: [{
                                geometry: geometry,
                                attributes: attributes
                            }]
                        };
                        drawLayer.applyEdits(edits).then((result) => {
                            if (result.addFeatureResults.length > 0) {
                                let objectId = result.addFeatureResults[0].objectId
                                if (objectId) {
                                    drawLayer.queryFeatures({
                                        returnGeometry: true,
                                        outSpatialReference: this.view.spatialReference,
                                        where: 'OBJECTID = ' + objectId,
                                        outFields: ['*']
                                    }).then(res => {
                                        if (res.features[0]) {
                                            var ft = res.features[0];
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
                        })
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
            });
        }

    }

});