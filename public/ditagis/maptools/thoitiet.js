define([
    "dojo/dom-construct",
], function (domConstruct) {

    return class ThoiTiet {
        constructor() {
            window.laydulieuthoitiet = function (data) {
                var results = data.query.results;
                if (results) {
                    var nhietdo = document.getElementById("nhietdo");
                    nhietdo.textContent = Math.round((results.channel.item.condition.temp - 32) * 5 / 9);
                    var doam = document.getElementById("doam");
                    doam.textContent = results.channel.atmosphere.humidity;
                    var tocdogio = document.getElementById("tocdogio");
                    tocdogio.textContent = Math.round((results.channel.wind.speed) * 0.44704);
                }



            };
            this.start();
        }

        start() {
            this.script;
            this.script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
            this.script.src = 'http://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=laydulieuthoitiet";
            document.head.appendChild(this.script);

        }
        laythongtinthoitiet(location) {
            if (this.script) {
                document.head.removeChild(this.script);
            }
            this.script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + location.latitude + "," + location.longitude + ")')";
            this.script.src = 'http://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=laydulieuthoitiet";
            document.head.appendChild(this.script);
        }

    }
});