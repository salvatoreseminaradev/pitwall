"use client";

import { useState } from "react";
import type {
  ClassificationRow,
  LapTrace,
  SessionDriver,
} from "@/types";
import ResultsTab from "./ResultsTab";
import LapsTab from "./LapsTab";
import TelemetryTab from "./TelemetryTab";
import WeatherTab from "./WeatherTab";
import TeamRadioTab from "./TeamRadioTab";

const TABS = [
  { id: "results", label: "Results" },
  { id: "laps", label: "Laps" },
  { id: "telemetry", label: "Telemetry" },
  { id: "weather", label: "Weather" },
  { id: "radio", label: "Team Radio" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function RaceTabs({
  sessionKey,
  season,
  circuit,
  raceDate,
  isPro,
  classification,
  lapTraces,
  drivers,
}: {
  sessionKey: number;
  season: number;
  circuit: string;
  raceDate: string;
  isPro: boolean;
  classification: ClassificationRow[];
  lapTraces: LapTrace[];
  drivers: SessionDriver[];
}) {
  const [active, setActive] = useState<TabId>("results");
  // Mount a tab the first time it's opened, then keep it mounted (hidden) so
  // switching back doesn't refetch.
  const [opened, setOpened] = useState<Set<TabId>>(new Set(["results"]));

  function select(id: TabId) {
    setActive(id);
    setOpened((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  return (
    <div className="mt-8">
      {/* Tab bar — scrolls horizontally on mobile */}
      <div
        role="tablist"
        aria-label="Race data"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0"
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-f1 text-white"
                  : "border-transparent text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6">
        {opened.has("results") && (
          <div hidden={active !== "results"}>
            <ResultsTab
              classification={classification}
              lapTraces={lapTraces}
              isPro={isPro}
              season={season}
              circuit={circuit}
            />
          </div>
        )}
        {opened.has("laps") && (
          <div hidden={active !== "laps"}>
            <LapsTab sessionKey={sessionKey} drivers={drivers} />
          </div>
        )}
        {opened.has("telemetry") && (
          <div hidden={active !== "telemetry"}>
            <TelemetryTab sessionKey={sessionKey} drivers={drivers} />
          </div>
        )}
        {opened.has("weather") && (
          <div hidden={active !== "weather"}>
            <WeatherTab sessionKey={sessionKey} />
          </div>
        )}
        {opened.has("radio") && (
          <div hidden={active !== "radio"}>
            <TeamRadioTab
              sessionKey={sessionKey}
              raceDate={raceDate}
              drivers={drivers}
            />
          </div>
        )}
      </div>
    </div>
  );
}
