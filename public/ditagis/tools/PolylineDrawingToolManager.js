/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ cung, đường thẳng)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
    "esri/Graphic", "esri/geometry/Polyline",
    "esri/symbols/SimpleLineSymbol",
    "esri/geometry/SpatialReference",
    "ditagis/tools/SimpleDrawPolyline",
    "ditagis/classes/EventListener",
    "ditagis/editing/PolylineEditing",
    './Polyline/InputCoordinates'
], function (Graphic, Polyline, SimpleLineSymbol, SpatialReference,
    SimpleDrawPolyline,
    EventListener, PolylineEditing,
    DrawInput
) {
    'use strict';
    return class {
        constructor(view, layers) {
            this.view = view;
            this.systemVariable = view.systemVariable;
            this._drawLayer = null;
            this.simpleDrawPolyline = new SimpleDrawPolyline(view);
            this.polylineEditing = new PolylineEditing(this.view)
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
            if (geometry && geometry.paths.length > 0)
                this.addFeature(geometry);
        }
        addFeature(geometry) {
            this.polylineEditing.draw(this.drawLayer, geometry, this.view).then((res) => {}).catch(err => {})
        }
        registerEvent() {
            this.simpleDrawPolyline.on('draw-finish', (geometry) => {
                this.drawFinish(geometry, 'simple')
            })
        }
        drawSimple() {
            this.cancel();
            this.simpleDrawPolyline.draw(this._drawLayer);
        }
        drawByPointInput() {
            // if (!this.inputCoordinate) {
            //     this.inputCoordinate = new InputCoordinates();
            // }
            // this.inputCoordinate.open();
            this.drawInput.getInputPolyline().then(rs => {
                if (rs.graphic) {
                    this.addFeature(rs.graphic.geometry);
                }

            });

        }
        cancel() {
            this.simpleDrawPolyline.cancel();
        }

    }
});