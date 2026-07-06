export interface Team {
  team_id: string;
  name: string;
  ranking: number;
  group: string;
}

export interface MatchStatistics {
  home_score: number;
  away_score: number;
  home_possession: number;
  away_possession: number;
  home_shots: number;
  away_shots: number;
  attendance: number;
}

export type MatchStatus = 'scheduled' | 'live' | 'half_time' | 'completed' | 'postponed' | 'cancelled';
export type WeatherCondition = 'clear' | 'cloudy' | 'rainy' | 'stormy' | 'extreme_heat' | 'snow';

export interface Match {
  match_id: string;
  home_team: Team;
  away_team: Team;
  stadium_id: string;
  scheduled_time: string;
  status: MatchStatus;
  weather: WeatherCondition;
  broadcast_window: string;
  statistics: MatchStatistics;
}

export type ZoneType = 'general' | 'vip' | 'premium' | 'standing' | 'accessible';
export type GateStatus = 'open' | 'closed' | 'restricted' | 'emergency_only';

export interface StadiumZone {
  zone_id: string;
  name: string;
  zone_type: ZoneType;
  capacity: number;
  current_occupancy: number;
}

export interface Gate {
  gate_id: string;
  name: string;
  status: GateStatus;
  capacity_per_hour: number;
  current_throughput: number;
  is_emergency_exit: boolean;
  connected_zones: string[];
}

export interface Stadium {
  stadium_id: string;
  name: string;
  city: string;
  total_capacity: number;
  zones: StadiumZone[];
  gates: Gate[];
  total_occupancy?: number;
  overall_occupancy_percentage?: number;
}

export interface CrowdDensityReading {
  zone_id: string;
  timestamp: string;
  density: number; // 0-100 percentage
  entry_rate: number;
  exit_rate: number;
}

export interface GateFlowData {
  gate_id: string;
  timestamp: string;
  inflow: number;
  outflow: number;
  queue_length: number;
  wait_time_minutes: number;
}

export interface CrowdSnapshot {
  stadium_id: string;
  timestamp: string;
  total_occupancy: number;
  capacity: number;
  zone_densities: CrowdDensityReading[];
  gate_flows: GateFlowData[];
}

export type RiskLevel = 'green' | 'yellow' | 'red';

export interface SurgePrediction {
  gate_id: string;
  zone_id: string;
  predicted_peak_time: string;
  risk_level: RiskLevel;
  expected_inflow: number;
  confidence: number;
  recommended_action: string;
}

export interface SurgePredictionResponse {
  predictions: SurgePrediction[];
  overall_risk: RiskLevel;
  summary: string;
  source: 'gemini' | 'rules';
}

export type InsightCategory = 'crowd_management' | 'scheduling' | 'resource_optimization' | 'safety' | 'performance' | 'revenue';
export type InsightPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Insight {
  insight_id: string;
  category: InsightCategory;
  priority: InsightPriority;
  title: string;
  description: string;
  recommendation: string;
  generated_at: string;
  source: 'gemini' | 'rules';
  confidence: number;
}

export interface InsightResponse {
  insights: Insight[];
  source: 'gemini' | 'rules';
}

export interface StandingsEntry {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

export interface TournamentSummary {
  tournament_name: string;
  total_matches: number;
  total_attendance: number;
  average_attendance: number;
  revenue_summary: Record<string, number>;
  highlights: string[];
  ai_summary: string;
  source: 'gemini' | 'rules';
}

export interface AttendanceTrend {
  match_id: string;
  date: string;
  attendance: number;
  capacity: number;
  gate_revenue: number;
}

export interface NavigationResponse {
  path_steps: string[];
  estimated_time_minutes: number;
  gemini_instructions: string;
  accessibility_note: string;
}

export interface AssistResponse {
  response_text: string;
  detected_language: string;
  persona_type: string;
  source: string;
}

export interface MatchScheduleRequest {
  teams: Team[];
  stadium_ids: string[];
  start_date: string;
  end_date: string;
  broadcast_windows?: string[];
  weather_forecasts?: WeatherCondition[];
  rest_days_between_matches?: number;
}

export interface MatchScheduleResponse {
  schedule: Match[];
  conflicts: string[];
  optimization_notes: string;
  source: 'gemini' | 'rules';
}
