/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ cung, đường thẳng)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
    "esri/geometry/Polygon",
    "ditagis/tools/SimpleDrawPolygon",
    "ditagis/classes/EventListener",
    "ditagis/editing/PolygonEditing",
    './Polygon/InputCoordinates'
], function (Polygon,
    SimpleDrawPolygon,
    EventListener, PolygonEditing,
    DrawInput
) {
        'use strict';
        return class {
            constructor(view, layers) {
                this.view = view;
                this.systemVariable = view.systemVariable;
                this._drawLayer = null;
                this.simpleDrawPolygon = new SimpleDrawPolygon(view);
                this.polygonEditing = new PolygonEditing(this.view)
                this.eventListener = new EventListener(this);
                this.registerEvent();
                this.drawInput = new DrawInput(this.view);
            }
            set drawLayer(val) {
                this._drawLayer = val;
            }
            get drawLayer() {
                return this._drawLayer;
            }
            drawFinish(geometry, method) {
                //kich hoat su kien
                this.eventListener.fire('draw-finish', {
                    geometry: geometry,
                    method: method
                });
                //applyEdit
                if (geometry && geometry.rings.length > 0)
                    this.addFeature(geometry);
            }
            addFeature(geometry) {
                this.polygonEditing.draw(this.drawLayer, geometry, this.view).then((res) => {
                }).catch(err => {
                })
            }
            registerEvent() {
                this.simpleDrawPolygon.on('draw-finish', (geometry) => {
                    this.drawFinish(geometry, 'simple')
                })
            }
            drawSimple() {
                this.cancel();
                this.simpleDrawPolygon.draw(this._drawLayer);
            }
            drawByPointInput() {
                this.drawInput.getInputPolygon().then(rs => {
                    if (rs.vertices) {
                        var geometry = new Polygon({
                            rings: rs.vertices,
                            spatialReference: this.view.spatialReference
                        })
                        this.addFeature(geometry);
                    }

                });

            }
            cancel() {
                this.simpleDrawPolygon.cancel();
            }

        }
    });