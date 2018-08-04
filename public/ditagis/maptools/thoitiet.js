define([
    "dojo/dom-construct",
    "ditagis/core/LinkAPI",
], function (domConstruct,LinkAPI) {

    return class ThoiTiet {
        constructor() {
            this.manhamay = null;
            var cacchiso = ["CO2", "CO", 'Dust', 'NO2', "O2", "SO2", "Temp"];
            window.laydulieuthoitiet = (data) => {
                var results = data.query.results;
                if (results) {
                    var nhietdo = document.getElementById("nhietdo");
                    nhietdo.textContent = Math.round((results.channel.item.condition.temp - 32) * 5 / 9);
                    var doam = document.getElementById("doam");
                    doam.textContent = results.channel.atmosphere.humidity;
                    var tocdogio = document.getElementById("tocdogio");
                    tocdogio.textContent = Math.round((results.channel.wind.speed) * 0.44704);
                }
                document.getElementById("thongtinmoitruong").innerHTML = "";
                // var resultHtml = "";
                if (this.manhamay)
                    for (const chiso of cacchiso) {
                        $.ajax({
                            url: `${LinkAPI.THOITIET_THONGTINMOITRUONG}${this.manhamay}?id=${chiso}`, 
                            success: function (result) {
                                document.getElementById("thongtinmoitruong").innerHTML += `
                                <div class="row-item">
                                    ${chiso}
                                    <div class="label pull-right">
                                        <strong>${result}</strong>
                                    </div>
                                </div>
                                `
                            },
                            error : function(jqXHR, textStatus, errorThrown) { 
                                if(jqXHR.status == 404 || errorThrown == 'Not Found') 
                                { 
                                    console.log('There was a 404 error.'); 
                                }
                            }
                        });
                    }

            };
            this.start();
        }

        start() {
            this.script;
            this.script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + view.center.latitude + "," + view.center.longitude + ")')";
            this.script.src = 'https://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=laydulieuthoitiet";
            document.head.appendChild(this.script);

        }
        laythongtinthoitiet(location, manhamay) {
            this.manhamay = manhamay;
            if (this.script) {
                document.head.removeChild(this.script);
            }
            this.script = document.createElement('script');
            var encodedQuery = "select atmosphere.humidity, wind.speed, item.condition.temp from weather.forecast where woeid in (select woeid from geo.places(1) where text='(" + location.latitude + "," + location.longitude + ")')";
            this.script.src = 'https://query.yahooapis.com/v1/public/yql?q='
                + encodedQuery + "&format=json&callback=laydulieuthoitiet";
            document.head.appendChild(this.script);
            $("div#weather-panel").removeClass("hidden");
        }
        close(){
            $("div#weather-panel").addClass("hidden");
        }

    }
});