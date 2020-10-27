/************** LOCATION *************************************************************************/
/*************************************************************************************************/

/************** try and locate the user *********************************************/
function initGeolocation() {
    if (navigator.geolocation) {
        // Call getCurrentPosition with success and failure callbacks
        navigator.geolocation.getCurrentPosition(success, fail);
    } else {
        alert("Sorry, your browser does not support geolocation services.");
    }
}

/************** if navigation is available show current location *********************************************/
function success(position) {   
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    console.log(latitude + " / " + longitude);
    reverseFetchLocation(latitude, longitude);
    startWeatherFetch(latitude, longitude);
}

/************** if navigation is not available *********************************************/
function fail() {
    //You could default to your favorite city like Kernersville, NC the home of Coder Foundry!
    //alert("Sorry, your browser does not support geolocation services.");
    document.getElementById("alert").innerHTML = "Sorry, your browser does not support geolocation services."

    document.getElementById("geoLocPopUp").classList.replace("box_visible", "box_hidden");
    document.getElementById("EnterLocPopUp").classList.replace("box_hidden", "box_visible");

    let location_input = document.getElementById("city_input");
    let location_btn = document.getElementById("city_input_btn");

    location_btn.addEventListener('mouseover', () => {
        location_input.style.borderColor = "rgb(17, 72, 104)";
    });
    location_btn.addEventListener('mouseout', () => {
        location_input.style.borderColor = "rgba(223, 227, 228, .5)";
    });
    location_btn.addEventListener('click', () => {
        let location = location_input.value;
        console.log(location);
        addressFetchLocation(location);
    });
}

/************** fetch city and country from latitude and longitude *********************************************/
function reverseFetchLocation(latitude, longitude) {

    let mapQuestKey = "lxkru6A2pWqKGNbgTXbFNrTuPqta1Rm3";
    let mapQuestLink = `http://www.mapquestapi.com/geocoding/v1/reverse?key=${mapQuestKey}&location=${latitude},${longitude}&includecallback=reverseGeocodeResult&includethumbMaps=false&includeRoadMetadata=false&includeNearestIntersection=false`;

    fetch(mapQuestLink)
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data.results[0].locations[0].postalCode);
            let postCode = data.results[0].locations[0].postalCode;
            if (postCode.length > 4) {
                postCode = postCode.substr(0, 4);
            }
            let town = `${data.results[0].locations[0].adminArea5} ${postCode},`;
            let country = `${data.results[0].locations[0].adminArea3} ${data.results[0].locations[0].adminArea1}`;
            document.getElementById("popUpTitle").innerHTML = `${town} ${country}`;

            document.getElementById("city").innerHTML = town;
            document.getElementById("location").innerHTML = country;
        })
        .catch(err => {
            // Do something for an error here
            throw (`Sorry, An Error occured.  ${err}`);
        })
}

/************** fetch latitude and longitude from a city *********************************************/
function addressFetchLocation(address) {

    let mapQuestKey = "lxkru6A2pWqKGNbgTXbFNrTuPqta1Rm3";
    let mapQuestLink = `http://www.mapquestapi.com/geocoding/v1/address?key=${mapQuestKey}&location=${address}&includecallback=reverseGeocodeResult&includethumbMaps=false&includeRoadMetadata=false&includeNearestIntersection=false`;

    fetch(mapQuestLink)
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data);
            let latitude = `${data.results[0].locations[0].latLng.lat}`;
            let longitude = `${data.results[0].locations[0].latLng.lng}`;

            document.getElementById("EnterLocPopUp").classList.replace("box_visible", "box_hidden");
            document.getElementById("geoLocPopUp").classList.replace("box_hidden", "box_visible");

            console.log(latitude, longitude);
            reverseFetchLocation(latitude, longitude);
            startWeatherFetch(latitude, longitude);
        })
        .catch(err => {
            // Do something for an error here
            throw (`Sorry, An Error occured.  ${err}`);
        })
}

/************** WEATHER REPORT *******************************************************************/
/*************************************************************************************************/

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/************** inactivate startscreen aftter choice **********************************************/
const showWeatherPage = () => {
    document.getElementById("wpCurrent").classList.remove("fade");
    document.getElementById("wpConditions").classList.remove("fade");
    document.getElementById("wpForecast").classList.remove("fade");
    document.getElementById("wpFooter").classList.remove("fade");

    document.getElementById("startScreen").style.display = "none";
}

/************** launch weather functions **********************************************************/
function startWeatherFetch (lat, long) {
    let celciusBtn = document.getElementById("cel_btn");
    let kelvinBtn = document.getElementById("kel_btn");
    let fahrenheitBtn = document.getElementById("fahr_btn");

    celciusBtn.addEventListener("click", function() {
        showWeatherPage();
        fetchWeatherReport(lat, long, "metric", "C", "km/h" );
    });
    kelvinBtn.addEventListener('click', function() {
        showWeatherPage();
        fetchWeatherReport(lat, long, "standard", "K", "km/h" );
    });
    fahrenheitBtn.addEventListener('click', function(){
        showWeatherPage();
        fetchWeatherReport(lat, long, "imperial", "F", "ml/h" );
    });
}

/************** fetch weather from latitude and longitude **********************************************/
function fetchWeatherReport(latitude, longitude, units, degrees, speed) {
    //to avoid the cors issue you need to run through a proxy or make the call server side.
    let openWeatherKey = "5b19bcf47d77f928af2658214b6a10af";
    let proxyLink = `https://cors-anywhere.herokuapp.com/`;
    let openWeatherLink = `${proxyLink}https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=${units}&exclude=minutely&appid=${openWeatherKey}`;

    fetch(openWeatherLink)
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data);

            let date = new Date(data.current.dt * 1000);
            let forecastDate = `${days[date.getDay()]}, <span>${date.getDate()}</span> ${months[date.getMonth()]}`;
            let forecastTime = `${date.toLocaleTimeString('nl-BE')}`;
            document.getElementById("dayTime").innerHTML = `${forecastDate}, <span>${forecastTime}</span>`;

            let summary = data.current.weather[0].description;
            document.getElementById("summary").innerHTML = summary;

            let temp = (data.current.temp).toFixed(1);
            document.getElementById("currentTemp").innerHTML = `${temp}&deg;${degrees}`;

            let icon = data.current.weather[0].icon;
            let hour = date.getHours();
            document.getElementById("icon").src = getICON(icon, hour);

            let clouds = data.current.clouds;
            document.getElementById("clouds").innerHTML = `${clouds} %`;

            let humidity = data.current.humidity;
            document.getElementById("humidity").innerHTML = `${humidity} %`;

            let wind = data.current.wind_speed;
            if (speed == "km/h") {
                wind = (wind * 3.6).toFixed(2);
            }
            document.getElementById("wind").innerHTML = `${wind} ${speed}`;

            let sunrise = new Date(data.current.sunrise * 1000).toLocaleTimeString();
            document.getElementById("sunrise").innerHTML = sunrise;
            let sunset = new Date(data.current.sunset * 1000).toLocaleTimeString();
            document.getElementById("sunset").innerHTML = sunset;

            //render the forcasts tabs
            document.getElementById("dailyForecast").innerHTML = renderHourlyForecast(data.hourly, degrees);
            document.getElementById("weeklyForecast").innerHTML = renderWeeklyForecast(data.daily, degrees);

            /* ONLY WHEN BOOTSTRAP FAILS

            daily_btn = document.getElementById("dailyBtn");
            weekly_btn = document.getElementById("weeklyBtn");
            hourTable = document.getElementById("dailyForecast");
            weekTable = document.getElementById("weeklyForecast");

            daily_btn.addEventListener('click', () => {
                daily_btn.classList.add("active");
                weekly_btn.classList.remove("active");
                hourTable.classList.replace("box_hidden", "box_visible");
                weekTable.classList.replace("box_visible", "box_hidden");
            })
            weekly_btn.addEventListener('click', () => {
                weekly_btn.classList.add("active");
                daily_btn.classList.remove("active");
                weekTable.classList.replace("box_hidden", "box_visible");
                hourTable.classList.replace("box_visible", "box_hidden");
            })
            */
        })
        .catch(err => {
            // Do something for an error here
            throw (`Sorry, An Error occured.  ${err}`);
        })
}

/************** 8 HRS forcast *******************************************************************/

function renderHourlyForecast(hourFcData, degrees) {

    let resultsHTML = '<thead><tr><th class="dayTime_title">Time</th><th class="textcol">Conditions</th><th class="tempcol">Temp</th><th class="tempcol">Humidity</th></tr></thead>';

    let rowcount = hourFcData.length;   
    if (rowcount > 9) {
        rowcount = 9;
    }

    for (let i = 1; i < rowcount; i++) {

        let time = new Date(hourFcData[i].dt * 1000);

        let timeValue = `${time.getHours() < 10 ? '0' : ''}${time.getHours()} <span>h</span>`;

        let summary = hourFcData[i].weather[0].description;

        let temp = `${(hourFcData[i].temp).toFixed(1)} ${degrees}`;

        let humidity = `${(hourFcData[i].humidity).toFixed(1)} %`;

        resultsHTML += `<tbody>${renderRow(timeValue, summary, temp, humidity)}</tbody>`;
    }
    return resultsHTML;
}

/************** 8 DAYS forcast *******************************************************************/

function renderWeeklyForecast(weekFcData, degrees) {

    let resultsHTML = '<thead><tr><th class="dayTime_title">Time</th><th class="textcol">Conditions</th><th class="tempcol">High</th><th class="tempcol">Low</th></tr></thead>';

    let rowcount = weekFcData.length;
    if (rowcount > 8) {
        rowcount = 8;
    }

    for (let i = 0; i < rowcount; i++) {

        let time = new Date(weekFcData[i].dt * 1000);

        let dayTime = days[time.getDay()];

        let summary =  weekFcData[i].weather[0].description;

        let tempHigh = `${(weekFcData[i].temp.max).toFixed(1)}&deg;${degrees}`;

        let tempLow = `${(weekFcData[i].temp.min).toFixed(1)}&deg;${degrees}`;

        resultsHTML += `<tbody>${renderRow(dayTime, summary, tempHigh, tempLow)}</tbody>`;
    }
    return resultsHTML;
}

/************** TABLES forcast *******************************************************************/

//template function to render grid colums
function renderRow(dayTime, summary, temperature, humidity) {
    return `<tr><th class="next_hourDay">${dayTime}</th><td class="textcol">${summary}</td><td class="tempcol">${temperature}</td><td class="tempcol">${humidity}</td></tr>`
}

/************** ICONS ****************************************************************************/

function getICON(icon, time) {
    
    if (icon == "01d") { return "assets/icons/SunnyDay.png" }
    else if (icon == "01n") { return "assets/icons/ClearMoon.png" }
    else if (icon == "02d" || icon == "04d") { return "assets/icons/MostlySunny.png" }
    else if (icon == "02n" || icon == "04n") { return "assets/icons/CloudyMoon.png" }
    else if (icon == "03d" || icon == "03n") { return "assets/icons/Overcast.png" }
    else if (icon == "09d" || icon == "09n") { return "assets/icons/Sleet.png" }
    else if (icon == "10d" || icon == "10n") { return "assets/icons/Rain.png" }
    else if (icon == "11d" || icon == "11n") { return "assets/icons/Storm.png" }
    else if (icon == "13d" || icon == "13n") { return "assets/icons/Snow.png" }
    else if (icon == "50d" || icon == "50n") { return "assets/icons/Fog.png" }
    else if (time > 7 && time < 21) { return "assets/img/clouds.jpg" }
    else { return "assets/img/night_sky.jpg" }
}

initGeolocation();