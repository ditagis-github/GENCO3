define([
  "esri/Graphic",
  "esri/geometry/Polygon",
], function (Graphic, Polygon) {

  return class {
    constructor(view) {
      this.view = view;
    }
    start() {
      this.view.when((evt) => {
        var vertices = [[
          [12198024.45, 1966413.55],
          [12670099.54, 1976197.49],
          [12646862.68, 1716923.09],
          [12221261.31, 1682679.3],
          [12198024.45, 1966413.55],
        ],
        [[12474475.69, 1306741.65],
        [12976880.75, 1310182.34],
        [12960040.36, 921384.84],
        [12513769.94, 897300.04],
        [12474475.69, 1306741.65],]
        ];

        var fillSymbol = {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: [170, 211, 223],
          outline: { // autocasts as new SimpleLineSymbol()
            color: [170, 211, 223],
            // width: 1
          }
        };

        
        this.graphic = new Graphic({
          geometry: new Polygon({
            rings: vertices,
            spatialReference: this.view.spatialReference
          }),
          symbol: fillSymbol
        });

        // Add the graphics to the view's graphics layer
        this.view.graphics.add(this.graphic);

      });
    }
    toogleGraphics(){
      var items = this.view.graphics.items;
      if(items.length > 0){
        this.view.graphics.remove(this.graphic);
      }
      else{
        this.view.graphics.add(this.graphic);
      }
    }
  }
});