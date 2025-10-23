import type { Location, Trip, Weather } from "@types";

class LocationState {
	location = $state<Partial<Location>>({
		carDifficulty: 0,
		walkDifficulty: 0,
		rating: 0,
	});

	reset() {
		this.location = {
			carDifficulty: 0,
			walkDifficulty: 0,
			rating: 0,
		};
	}

	set(newLocation: Partial<Location>) {
		this.location = { ...newLocation };
	}

	isSet() {
		return !!this.location?.latitude && !!this.location.longitude;
	}
}

class TripState {
	trip = $state<Trip | undefined>(undefined);

	set(newTrip: Trip | undefined) {
		this.trip = newTrip;
	}
}

class WeatherState {
	weather = $state<Weather | undefined>(undefined);

	set(newWeather: Weather | undefined) {
		this.weather = newWeather;
	}
}

export const locationState = new LocationState();
export const tripState = new TripState();
export const weatherState = new WeatherState();
