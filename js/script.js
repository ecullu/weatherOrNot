var token = '7eaad08a23202300a5e89c7db0782705'
var forecastURL = 'https://api.forecast.io/forecast/'

var geocodingToken = 'AIzaSyDovPpSrjdsWZWpqKG8tWI6_ipxXkxro6k'
var geocodingURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='

// animated icons
var skycons = new Skycons({"color": "snow"});
  	skycons.play()

console.log(skycons.icon1)

var buttonNode = document.querySelector('#nav-bar')
var locationNode = document.querySelector('#location')
var forecastNode = document.querySelector('#forecast')
var forecastDailyNode = document.querySelector('#forecast-daily')
var forecastHourlyNode = document.querySelector('#forecast-hourly')
var summaryNode = document.querySelector('#summary')
var alertsNode = document.querySelector('#alerts')
var searchNode = document.querySelector('#search')
var iconNode = document.querySelector('#weather-icon')

var changeViewType = function(eventObj){
	console.log(eventObj.target.value)
	location.hash = hashToObject().lat + "/" + hashToObject().lng + "/" + eventObj.target.value 
	console.log(location.hash) 
}

var fetchData = function(lat,lng){
	var url = forecastURL + token + "/" + lat + "," + lng
	var forecastPromise = $.getJSON(url)
	return forecastPromise
}

var fetchLocationData = function(address){
	var locationURL = geocodingURL + address + '&' + geocodingToken
	var locationPromise = $.getJSON(locationURL)
	return locationPromise
}

var getSearchCoords = function(searchObj){
	if( searchObj.keyCode === 13){
		var cityName = searchObj.target.value
		var coordsPromise = fetchLocationData(cityName)
		console.log(coordsPromise)
		coordsPromise.then(showSearchedCity)
		searchObj.target.value = ''
	}
}

var searchedObj = {
	name: 'Houston'
}

var showSearchedCity = function(eventObj){
	console.log(eventObj.results[0].geometry.location)
	var inputLat = eventObj.results[0].geometry.location.lat
	var inputLng = eventObj.results[0].geometry.location.lng
	location.hash = inputLat + "/" + inputLng + '/current' 
	console.log('location hash >>>' + location.hash)
	hashToObject()
	console.log('updated hashobject', hashToObject())
	var formattedAddress = eventObj.results[0].formatted_address.split(",")
	inputLocationName = formattedAddress[0]
	searchedObj.name = inputLocationName
	console.log('searched location name >>>' + searchedObj.name)

}


var hashToObject = function(){
	var hashRoute = location.hash.substr(1)
	var splitHashRoute = hashRoute.split("/")
	var  forecastObj ={
		lat: splitHashRoute[0],
		lng: splitHashRoute[1],
		viewtype: splitHashRoute[2]
	}
	return forecastObj
}

var locationReader = function(geoPos){
	console.log(geoPos)
	var lat = geoPos.coords.latitude
	var long = geoPos.coords.longitude
	var current = lat + "," + long
	location.hash = lat + "/" + long + "/current"
	console.log('latitude >>>'+ lat)
	console.log('longitude >>>' + long)
}

navigator.geolocation.getCurrentPosition(locationReader)

var formatAMPM = function(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ' ' + ampm;
  return strTime;
}

// define viewtypes
var renderCurrentView = function(apiResponse){
	console.log(apiResponse)
	forecastDailyNode.innerHTML = ''
	forecastHourlyNode.innerHTML = ''

	var temp = apiResponse.currently.temperature
	var summary = apiResponse.currently.summary
	if(apiResponse.alerts !== undefined){
		var alertTitle = apiResponse.alerts[0].title
		var alertDesc = apiResponse.alerts[0].description
		alertsInnerHTML += '<div id="alert-title">' + alertTitle + '</div>'
		alertsInnerHTML += '<div id="alert-description">' + alertDesc + '</div>'
	}
	
	var tempInnerHTML = '',
		alertsInnerHTML = '',
		backgroundClass = ''
	if(apiResponse.currently.summary === "Partly Cloudy"){
		backgroundClass = 'partly-cloudy'
	}
	tempInnerHTML += '<div id="current-temp" class="' + backgroundClass +'">' + parseInt(temp) + '&deg<sup>F</sup></div>'
	tempInnerHTML += '<div id="summary">' + summary + '</div>'

	iconNode.innerHTML = '<canvas id="' + apiResponse.currently.icon + '" width="50" height="50"></canvas>'
	forecastNode.innerHTML = tempInnerHTML
	alertsNode.innerHTML = alertsInnerHTML
	locationNode.innerHTML = searchedObj.name
	createIcon()
}

var renderDailyView = function(apiResponse){
	console.log(apiResponse)
	forecastNode.innerHTML = ''
	forecastHourlyNode.innerHTML = ''
	alertsNode.innerHTML = ''
	var dayArr = apiResponse.daily.data
	var tempInnerHTML = ''
	for (var i = 0; i < dayArr.length; i++){
		var day = dayArr[i]
		var tempMin = day.temperatureMin
		var tempMax = day.temperatureMax
		var summary = day.summary
		console.log(day.time)
		var d = new Date(day.time * 1000);
		var dayStr = d.toDateString().substr(0,3)

		 tempInnerHTML += '<div class="daily-temp">'
		 tempInnerHTML += 	'<div class="day">' + dayStr + '</div>'
 		 tempInnerHTML +=	'<div class="daily-summary">' + summary + '</div>'
		 tempInnerHTML += 	'<div class="min-max">' + parseInt(tempMin) + '&deg<sup>F</sup> / ' + parseInt(tempMax) + '&deg<sup>F</sup>' + '</div>'
		 tempInnerHTML += '</div>'
	}
	forecastDailyNode.innerHTML = tempInnerHTML
}

var renderHourlyView = function(apiResponse){
	console.log(apiResponse)
	forecastNode.innerHTML = ''
	forecastDailyNode.innerHTML = ''
	var tempInnerHTML = ''
		tempInnerHTML += '<div class="hourly-temp-title">'
		tempInnerHTML += 	'<div class="time">Time</div>'
		tempInnerHTML +=	'<div class="temp">Temp</div>'
		tempInnerHTML +=	'<div class="feels-like">Feels</div>'
		tempInnerHTML +=	'<div class="hourly-summary">Summary</div>' 
		tempInnerHTML +=	'<div class="hourly-precip">Precip</div>' 
		tempInnerHTML += '</div>'

	alertsNode.innerHTML = ''
	var hourArr = apiResponse.hourly.data
	for (var i = 0; i < hourArr.length; i++){
		var hour = hourArr[i]
		var d = new Date(hour.time * 1000)
		var hourStr = formatAMPM(d)
		var temp = hour.temperature
		var summary = hour.summary
		var feelsLike = hour.apparentTemperature
		var precip = hour.precipProbability * 100
		console.log(hour.icon)

		tempInnerHTML += '<div class="hourly-temp">'
		tempInnerHTML += 	'<div class="time">'+ hourStr + '</div>'
		tempInnerHTML +=	'<div class="temp">' + parseInt(temp) + '&deg<sup>F</sup></div>'
		tempInnerHTML +=	'<div class="feels-like">' + parseInt(feelsLike) + '&deg<sup>F</sup></div>'
		tempInnerHTML +=	'<div class="hourly-summary"><canvas id="' + hour.icon + '" width="50" height="50"></canvas>' + summary + '</div>' 
		tempInnerHTML +=	'<div class="hourly-precip"> <i class="fa fa-tint" aria-hidden="true"></i>' + " "+ parseInt(precip) + "%" + '</div>'
		tempInnerHTML += '</div>'
	}
	forecastHourlyNode.innerHTML = tempInnerHTML
	createIcon()
}
//define viewtypes ends



//backbone router
var ForecastRouter = Backbone.Router.extend({
	routes:{
		":lat/:lng/current": "showCurrentWeather",
		":lat/:lng/daily": "showDailyWeather",
		":lat/:lng/hourly": "showHourlyWeather"
	},

	showCurrentWeather: function(){
		var weatherPromise = fetchData(hashToObject().lat,hashToObject().lng)
		weatherPromise.then(renderCurrentView)
	},

	showDailyWeather: function(){
		var weatherPromise = fetchData(hashToObject().lat,hashToObject().lng)
		weatherPromise.then(renderDailyView)
	},

	showHourlyWeather: function(){
		var weatherPromise = fetchData(hashToObject().lat,hashToObject().lng)
		weatherPromise.then(renderHourlyView)
	}
})

var createIcon = function(){
var list  = [
            "clear-day", "clear-night", "partly-cloudy-day",
            "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind",
            "fog"
          ],
          i;
      for(i = list.length; i--; )
        skycons.set(list[i], list[i]);
}

var rtr = new ForecastRouter()
Backbone.history.start()

buttonNode.addEventListener('click', changeViewType)
searchNode.addEventListener('keydown', getSearchCoords)

