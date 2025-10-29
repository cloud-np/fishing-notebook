import type { Location } from "./Location.model";

export interface TripWithLocation extends Trip {
	location: Location;
}

export interface Trip {
	tripDate: string;
	startTime?: string;
	endTime?: string;
	title?: string;
	notes?: string;
	rating?: number;
	createdAt: Date;
	updatedAt: Date;
	location?: Location;
}

export type TripsByDate = Record<string, Trip>;
