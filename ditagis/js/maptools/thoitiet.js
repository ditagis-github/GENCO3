define([
    "dojo/dom-construct",
], function (domConstruct) {

    return class ThoiTiet {
        constructor() {
            window.laydulieuthoitiet = function (data) {
                var results = data.query.results;
                if(results){
                    var nhietdo = document.getElementById("nhietdo");
                nhietdo.textContent = "Nhiệt độ: " + Math.round((results.channel.item.condition.temp -32) * 5 / 9);
                var doam = document.getElementById("doam");
                doam.textContent = "Độ ẩm: " + results.channel.wind.speed;
                var tocdogio = document.getElementById("tocdogio");
                tocdogio.textContent = "Tốc độ gió: " + results.channel.atmosphere.humidity;
                }
                
                
                
            };
        }
        start(){
            var script;
     
            script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
            script.src = 'http://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=laydulieuthoitiet";
            document.head.appendChild(script);

            var weather_Element = domConstruct.create("div", {
                id: "weather",
                class: 'weather'
            });
            var doam = domConstruct.create("div", {
                id: "doam",
            });
            weather_Element.appendChild(doam);
            var nhietdo = domConstruct.create("div", {
                id: "nhietdo",
            });
            weather_Element.appendChild(nhietdo);
            var tocdogio = domConstruct.create("div", {
                id: "tocdogio",
            });
            weather_Element.appendChild(tocdogio);
            var refresh_weather = domConstruct.create("button", {
                id: "refresh_weather",
                innerHTML: "Làm mới"
            });
            refresh_weather.onclick = function () {
                if (script) {
                    document.head.removeChild(script);
                }
                script = document.createElement('script');
                var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
                script.src = 'http://query.yahooapis.com/v1/public/yql?q='
                    + encodedQuery + "&format=json&callback=laydulieuthoitiet";
                document.head.appendChild(script);
            }
            weather_Element.appendChild(refresh_weather);
            view.ui.add(weather_Element, 'top-right');
        }  

    }
});