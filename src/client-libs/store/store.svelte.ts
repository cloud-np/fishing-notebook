import type { Location, Trip, Weather, HourlyWeather } from "@types";
import { actions } from "astro:actions";
import { isBusy, updateStore } from "./decorators";

class LocationService {
	location = $state<Partial<Location>>({
		carDifficulty: 0,
		walkDifficulty: 0,
		rating: 0,
	});
	isBusy = $state(false);
	isSet = $derived(!!this.location?.latitude && !!this.location.longitude);

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
}

class TripService {
	trip = $state<Trip | undefined>(undefined);
	isBusy = $state(false);

	set(newTrip: Trip | undefined) {
		this.trip = newTrip;
	}

	@isBusy
	@updateStore("trip")
	async createTrip(trip: Trip & { location: Location }) {
		return await actions.trip.createTrip({
			location: {
				name: trip.location.name,
				latitude: trip.location.latitude,
				longitude: trip.location.longitude,
				walkDifficulty: trip.location.walkDifficulty,
				carDifficulty: trip.location.carDifficulty,
				rating: trip.location.rating,
			},
			tripDate: trip.tripDate,
			rating: trip.rating,
			notes: trip.notes,
			title: trip.title,
			startTime: trip.startTime,
			endTime: trip.endTime,
			successRating: trip.rating,
		});
	}
}

class WeatherService {
	weather = $state<Weather | undefined>(undefined);
	hourlyWeather = $state<HourlyWeather[] | undefined>(undefined);
	isBusy = $state(false);

	set(newWeather: Weather | undefined) {
		this.weather = newWeather;
	}

	@isBusy
	@updateStore("hourlyWeather")
	async getWeatherByDate(longitude: number, latitude: number, date: string): Promise<HourlyWeather[]> {
		const { data, error } = await actions.weather.getByDate({
			longitude,
			latitude,
			date,
		});

		if (data && data.success) {
			return data.data;
		} else if (error) {
			console.error("Failed to load weather:", error);
		}
		return [];
	}

	setHourlyWeather(newHourlyWeather: HourlyWeather[] | undefined) {
		this.hourlyWeather = newHourlyWeather;
	}
}

export const locationService = new LocationService();
export const tripService = new TripService();
export const weatherService = new WeatherService();
