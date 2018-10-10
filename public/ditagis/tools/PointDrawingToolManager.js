/**
 * Lớp này dùng để gọi các chức năng của các lớp khi vẽ Point (Vẽ tùy chọn, hướng, giao hội)
 * Tham số truyền vào (view, systemVariable)
 * systemVariable: Thông tin khách hàng đang hiển thị
 */
define([
  "ditagis/tools/SimpleDrawPoint",
  "ditagis/editing/PointEditing",
  "esri/Graphic",
  "ditagis/classes/EventListener", './DrawInput',
  "../core/ConstName"
], function (SimpleDrawPoint, PointEditing, Graphic,
  EventListener, DrawInput, constName) {
    'use strict';
    return class {
      constructor(view) {
        this.view = view;
        this._drawLayer = null;
        this.systemVariable = view.systemVariable;
        // Chức năng vẽ Khoảng cách- Hướng
        // Chức năng vẽ giao hội
        // Chức năng vẽ tùy chọn
        this.simpleDrawPoint = new SimpleDrawPoint(this.view);
        this.eventListener = new EventListener(this);
        this.pointEditing = new PointEditing(this.view);
        this.pointInput = new DrawInput(this.view);
        this.registerEvent();
      }
      addFeature(graphic) {
        this.pointEditing.draw(this.drawLayer, graphic);
      }
      registerEvent() {
        this.simpleDrawPoint.on('draw-finish', (geometry) => {
          this.eventListener.fire('draw-finish', {
            graphic: geometry,
            method: 'arcsegment'
          });
          this.addFeature(geometry);
        })
      }
      set drawLayer(val) {
        this._drawLayer = val;
      }
      get drawLayer() {
        return this._drawLayer;
      }
      // Vẽ Tùy chọn
      drawSimple() {
        this.simpleDrawPoint.clearEvents();
        this.simpleDrawPoint.draw(this.drawLayer);
      }
      drawByPointInput() {
        this.pointInput.getInputPoints().then(rs => {
          console.log(rs);
          if (rs.point) {
            var graphic = new Graphic({
              geometry: rs.point
            });
            this.addFeature(graphic);
          }

        })
      }
      clearEvents() {
        this.simpleDrawPoint.clearEvents();
      }
    }
  });