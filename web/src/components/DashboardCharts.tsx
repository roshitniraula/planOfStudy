"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// Shared wrapper that gives every chart the same card chrome
function ChartWrapper({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-5 ${className ?? ""}`}>
      <h3 className="font-semibold text-mnsu-purple mb-4">{title}</h3>
      {children}
    </div>
  );
}

const CHART_MARGINS = { top: 4, right: 16, left: 0, bottom: 8 };
const BRAND_COLORS = ["#49306e", "#febd11", "#5a7f9e"];

interface GradChartProps {
  data: { term: string; count: number }[];
}

export function GradTermChart({ data }: GradChartProps) {
  return (
    <ChartWrapper title="Students by Expected Graduation">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ ...CHART_MARGINS, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="term" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" name="Students" fill={BRAND_COLORS[0]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface CompetencyChartProps {
  data: { name: string; approved: number }[];
}

export function CompetencyChart({ data }: CompetencyChartProps) {
  return (
    <ChartWrapper title="Approved Experiences by Competency">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={CHART_MARGINS}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="approved" name="Approved" radius={[3, 3, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BRAND_COLORS[i % BRAND_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface StageDistProps {
  data: { label: string; count: number }[];
}

export function StageDistChart({ data }: StageDistProps) {
  return (
    <ChartWrapper title="Progress Stage Distribution (Highlighted Experiences)" className="col-span-2">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={CHART_MARGINS}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="count" name="Experiences" fill={BRAND_COLORS[1]} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
