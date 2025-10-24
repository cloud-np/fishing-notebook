import { getEmailService } from "@libs/services";
import { contact } from "./contact/contact";
import { calendar } from "./calendar/calendar";
import { maps } from "./maps/maps";
import { trip } from "./trip/trip";
import { location } from "./location/location";
import { weather } from "./weather/weather";
import { getRateLimiter, getDuplicateDetector } from "src/actions/contact/middlewares";

// TODO: We need a better pattern for this
// Start the Global instances of rate limiter and duplicate detector
// Middlewares
getRateLimiter();
getDuplicateDetector();

// Services
getEmailService();

export const server = {
	contact,
	calendar,
	maps,
	trip,
	location,
	weather,
};
