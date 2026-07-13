"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RacePoints } from "@/types";

export default function DriverPointsChart({
  data,
  color = "#e10600",
}: {
  data: RacePoints[];
  color?: string;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
          <XAxis
            dataKey="round"
            stroke="#525252"
            tick={{ fill: "#a3a3a3", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#262626" }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#525252"
            tick={{ fill: "#a3a3a3", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#262626" }}
          />
          <Tooltip
            contentStyle={{
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: "0.5rem",
              color: "#fff",
            }}
            labelStyle={{ color: "#a3a3a3" }}
            cursor={{ stroke: color, strokeWidth: 1 }}
          />
          <Line
            type="monotone"
            dataKey="points"
            name="Points"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
