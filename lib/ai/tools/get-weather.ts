/**
 * ** GET WEATHER TOOL **
 * 
 * This module implements the AI tool for retrieving weather data.
 * 
 * Key functionalities:
 * - Provides interface for AI to access weather information
 * - Handles parameter validation through Zod schema
 * - Fetches real-time weather data from Open-Meteo API
 * - Returns comprehensive weather forecast information
 * - Includes current conditions, hourly forecasts, and daily data
 * - Supports global coverage through latitude/longitude coordinates
 * - Integrates with the Weather component for visualization
 * 
 * This AI tool enhances conversations by enabling the assistant
 * to provide accurate, real-time weather information when relevant
 * to user queries or discussion topics.
 */

import { tool } from 'ai';
import { z } from 'zod';

export const getWeather = tool({
  description: 'Get the current weather at a location',
  parameters: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ latitude, longitude }) => {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
    );

    const weatherData = await response.json();
    return weatherData;
  },
});
