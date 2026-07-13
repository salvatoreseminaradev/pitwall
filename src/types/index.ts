// ---------------------------------------------------------------------------
// Raw OpenF1 shapes (https://api.openf1.org) — only the fields we consume.
// ---------------------------------------------------------------------------

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  country_name: string;
  country_code: string;
  country_flag: string;
  circuit_short_name: string;
  date_start: string;
  year: number;
}

export interface Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  country_name: string;
  country_code: string;
  circuit_short_name: string;
  year: number;
  is_cancelled: boolean;
}

export interface ApiDriver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  headshot_url: string;
  country_code: string;
  first_name: string;
  last_name: string;
}

export interface SessionResult {
  position: number | null;
  driver_number: number;
  points: number | null;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  gap_to_leader: number | string | null;
  number_of_laps: number | null;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  date_start: string | null;
}

export interface CarData {
  date: string;
  driver_number: number;
  speed: number;
  throttle: number;
  brake: number;
  n_gear: number;
  rpm: number;
  drs: number;
}

export interface WeatherRow {
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: number;
  rainfall: number;
  pressure: number;
}

export interface TeamRadioRow {
  date: string;
  driver_number: number;
  recording_url: string;
}

// ---------------------------------------------------------------------------
// Derived / app-facing shapes.
// ---------------------------------------------------------------------------

export interface RacePoints {
  round: string;
  points: number;
}

export interface DriverStanding {
  driverNumber: number;
  fullName: string;
  acronym: string;
  team: string;
  teamColour: string; // hex without leading '#'
  headshot: string;
  country: string;
  firstName: string;
  lastName: string;
  points: number;
  wins: number;
  podiums: number;
  bestFinish: number;
  pointsByRace: RacePoints[];
}

export interface Race {
  sessionKey: number;
  meetingKey: number;
  round: number;
  name: string;
  circuit: string;
  country: string;
  countryCode: string;
  countryFlag: string; // URL
  date: string; // ISO
  winner: string | null;
  winnerTeam: string | null;
}

export interface SeasonData {
  year: number;
  races: Race[];
  standings: DriverStanding[];
}

export interface ClassificationRow {
  position: number | null;
  driverNumber: number;
  name: string;
  acronym: string;
  team: string;
  teamColour: string;
  points: number;
  gap: number | string | null;
  dnf: boolean;
}

export interface LapTrace {
  driverNumber: number;
  acronym: string;
  teamColour: string;
  laps: { lap: number; duration: number }[];
}

/** Per-session driver metadata used by the interactive race tabs. */
export interface SessionDriver {
  driverNumber: number;
  acronym: string;
  fullName: string;
  teamColour: string;
  headshot: string;
}

export interface RaceDetail {
  race: Race;
  classification: ClassificationRow[];
  lapTraces: LapTrace[];
  drivers: SessionDriver[];
}
