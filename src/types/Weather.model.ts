export interface HourlyWeather {
	time: string;
	// Temperature
	temperature: number | undefined;
	feelsLike: number | undefined;
	temperature80m: number | undefined;
	temperature120m: number | undefined;
	temperature180m: number | undefined;
	// Weather condition
	weatherCode: number | undefined;
	// Pressure
	pressure: number | undefined;
	surfacePressure: number | undefined;
	// Cloud cover
	cloudCover: number | undefined;
	cloudCoverLow: number | undefined;
	cloudCoverMid: number | undefined;
	cloudCoverHigh: number | undefined;
	// Visibility
	visibility: number | undefined;
	// Evapotranspiration
	evapotranspiration: number | undefined;
	et0FaoEvapotranspiration: number | undefined;
	// Humidity and dew point
	humidity: number | undefined;
	dewPoint: number | undefined;
	vapourPressureDeficit: number | undefined;
	// Precipitation
	precipitationProbability: number | undefined;
	precipitation: number | undefined;
	rain: number | undefined;
	showers: number | undefined;
	snowfall: number | undefined;
	snowDepth: number | undefined;
	// Wind
	windSpeed: number | undefined;
	windSpeed80m: number | undefined;
	windSpeed120m: number | undefined;
	windSpeed180m: number | undefined;
	windDirection: number | undefined;
	windDirection80m: number | undefined;
	windDirection120m: number | undefined;
	windDirection180m: number | undefined;
	windGusts: number | undefined;
	// Soil temperature
	soilTemp0cm: number | undefined;
	soilTemp6cm: number | undefined;
	soilTemp18cm: number | undefined;
	soilTemp54cm: number | undefined;
	// Soil moisture
	soilMoisture0To1cm: number | undefined;
	soilMoisture1To3cm: number | undefined;
	soilMoisture3To9cm: number | undefined;
	soilMoisture9To27cm: number | undefined;
	soilMoisture27To81cm: number | undefined;
}

// Legacy interface - consider deprecating if no longer used
export interface Weather {
	temperature: number;
	windSpeed: number;
	description: string;
}
