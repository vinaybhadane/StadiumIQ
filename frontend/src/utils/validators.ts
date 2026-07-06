import { z } from 'zod';

export const teamSchema = z.object({
  team_id: z.string().min(1, 'Team ID is required'),
  name: z.string().min(1, 'Team name is required'),
  ranking: z.number().int().nonnegative('Ranking must be positive'),
  group: z.string().max(10).default(''),
});

export const matchScheduleRequestSchema = z.object({
  teams: z.array(teamSchema).min(2, 'At least 2 teams are required to schedule matches'),
  stadium_ids: z.array(z.string().min(1)).min(1, 'At least 1 stadium ID is required'),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format',
  }),
  broadcast_windows: z.array(z.string()).default([]),
  weather_forecasts: z.array(z.enum(['clear', 'cloudy', 'rainy', 'stormy', 'extreme_heat', 'snow'])).default([]),
  rest_days_between_matches: z.number().int().min(1).max(7).default(2),
});

export const stadiumCreateSchema = z.object({
  name: z.string().min(1, 'Stadium name is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  total_capacity: z.number().int().positive('Capacity must be greater than zero').max(500000),
});
