import type { Location, Trip, Weather, HourlyWeather } from "@types";
import { actions } from "astro:actions";

type Actions = typeof actions;

// Method decorator to manage isBusy state
function isBusy(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
	const originalMethod = descriptor.value;

	descriptor.value = function (this: { isBusy: boolean }, ...args: any[]) {
		this.isBusy = true;
		try {
			const result = originalMethod.apply(this, args);
			// Handle promises
			if (result instanceof Promise) {
				return result.finally(() => {
					this.isBusy = false;
				});
			}
			// Handle synchronous functions
			this.isBusy = false;
			return result;
		} catch (error) {
			this.isBusy = false;
			throw error;
		}
	};

	return descriptor;
}

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

class TripService<T extends keyof Actions> {
	trip = $state<Trip | undefined>(undefined);
	isBusy = $state(false);

	set(newTrip: Trip | undefined) {
		this.trip = newTrip;
	}

	@isBusy
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

	set(newWeather: Weather | undefined) {
		this.weather = newWeather;
	}

	@isBusy
	async getWeatherByDate(location: Location, date: string) {
		return await actions.weather.getByDate({
			longitude: location.longitude,
			latitude: location.latitude,
			date,
		});
	}

	setHourlyWeather(newHourlyWeather: HourlyWeather[] | undefined) {
		this.hourlyWeather = newHourlyWeather;
	}
}

export const locationService = new LocationService();
export const tripService = new TripService();
export const weatherService = new WeatherService();
