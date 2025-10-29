import type { Location, Trip, WeatherUniqKey, HourlyWeather } from "@types";
import { actions } from "astro:actions";
import { isBusy, updateStore } from "./decorators";

class LocationService {
	location = $state<Partial<Location>>({
		carDifficulty: 0,
		walkDifficulty: 0,
		rating: 0,
	});
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

	set(newTrip: Trip | undefined) {
		this.trip = newTrip;
	}

	@isBusy()
	@updateStore("trip")
	async createTrip(trip: Trip & { location: Location }) {
		const { data, error } = await actions.trip.createTrip({
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

		if (data && data.success) {
			return data.trip;
		} else if (error) {
			console.error("Failed to load trip:", error);
		}
		return [];
	}
}

class WeatherService {
	hourlyWeather = $state<HourlyWeather[] | undefined>(undefined);
	hourlyWeatherByKey = $state<Record<WeatherUniqKey, HourlyWeather[] | undefined>>({});

	@isBusy()
	async getWeatherByDate(longitude: number, latitude: number, date: string): Promise<HourlyWeather[]> {
		const key = `${longitude}-${latitude}-${date}`;
		if (this.hourlyWeatherByKey[key]) {
			return this.hourlyWeatherByKey[key];
		}
		const { data, error } = await actions.weather.getByDate({
			longitude,
			latitude,
			date,
		});

		if (data && data.success) {
			this.hourlyWeatherByKey[key] = data.weather;
			return data.weather;
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
