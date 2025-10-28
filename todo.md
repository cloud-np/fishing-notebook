# FE
* Open a Map with all locations and their names on top.
	when the user clicks on location close the map and select the location.
* When in dashboard/calendar we should show the trip details if any since we have a picked
    date already.
* Make the data in trip details scrollable since later on we will have marine data as well.
* Make the weather data responsive they are overflowing the card.
* When showing the weather specific hours should be shown first.
* Add proper responses codes for constrains: Failed to validate: [ { "code": "too_big", "maximum": 200, "type": "string", "inclusive": true, "exact": false, "message": "String must contain at most 200 character(s)", "path": [ "location", "name" ] } ]
* FE "rate limiter", implement isLoading per action/comp.
* BUG: When a user clicks a trip and then changes to another we do not update the weather data.

# BE
* Use the marine forecast API to get data regarding the weather for each trip.
	https://open-meteo.com/en/docs/marine-weather-api
* Check why the weather data response takes a long time.

# Project wide
* Lets re-arrange especially the FE components into better folders.
