import { EmailService } from "./email.service";
import { WeatherService } from "./weather.service";

const GLOBAL_EMAIL_SERVICE_KEY = Symbol.for("astro-email-service");
const GLOBAL_WEATHER_SERVICE_KEY = Symbol.for("astro-weather-service");

export const getEmailService = (): EmailService => (globalThis[GLOBAL_EMAIL_SERVICE_KEY] ??= new EmailService());
export const getWeatherService = (): WeatherService =>
	(globalThis[GLOBAL_WEATHER_SERVICE_KEY] ??= new WeatherService());
