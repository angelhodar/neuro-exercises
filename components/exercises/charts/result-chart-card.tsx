"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const correctIncorrectChartConfig = {
  tiempo: { label: "Tiempo (s)" },
  correcto: { label: "Correcto", color: "var(--chart-2)" },
  incorrecto: { label: "Incorrecto", color: "var(--chart-1)" },
} satisfies ChartConfig;

interface StatItem {
  label: string;
  value: string;
}

export function StatRow({ items }: { items: StatItem[] }) {
  return (
    <div
      className="grid divide-x rounded-lg border text-center"
      style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
    >
      {items.map((item) => (
        <div className="p-4" key={item.label}>
          <p className="text-muted-foreground text-sm">{item.label}</p>
          <p className="font-semibold text-2xl tracking-tight">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function buildPieData(correct: number, incorrect: number) {
  return [
    { name: "correcto", value: correct, fill: "var(--color-correcto)" },
    { name: "incorrecto", value: incorrect, fill: "var(--color-incorrecto)" },
  ];
}

export function AccuracyDonutChart({
  correct,
  incorrect,
  accuracy,
}: {
  correct: number;
  incorrect: number;
  accuracy: number;
}) {
  const pieData = buildPieData(correct, incorrect);

  return (
    <ChartContainer
      className="mx-auto aspect-square max-h-[200px] w-full"
      config={correctIncorrectChartConfig}
    >
      <PieChart accessibilityLayer>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={pieData}
          dataKey="value"
          innerRadius={60}
          nameKey="name"
          outerRadius={80}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x={viewBox.cx}
                    y={viewBox.cy}
                  >
                    <tspan
                      className="fill-foreground font-bold text-3xl"
                      x={viewBox.cx}
                      y={viewBox.cy}
                    >
                      {accuracy.toFixed(0)}%
                    </tspan>
                    <tspan
                      className="fill-muted-foreground"
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                    >
                      Precisión
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

interface BarChartEntry {
  question: string;
  tiempo: number;
  fill: string;
}

export function ResultBarChart({
  data,
  config,
}: {
  data: BarChartEntry[];
  config: ChartConfig;
}) {
  const chartData = data.map((entry) => ({
    ...entry,
    tiempo: Number((entry.tiempo / 1000).toFixed(2)),
  }));

  return (
    <ChartContainer className="aspect-auto h-[350px] w-full" config={config}>
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ bottom: 36, left: 16 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          axisLine={false}
          dataKey="question"
          tickLine={false}
          tickMargin={8}
        >
          <Label
            offset={0}
            position="bottom"
            style={{ fontSize: 14, fontWeight: 500 }}
            value="Pregunta"
          />
        </XAxis>
        <YAxis axisLine={false} tickLine={false} tickMargin={8}>
          <Label
            angle={-90}
            offset={-4}
            position="insideLeft"
            style={{ textAnchor: "middle", fontSize: 14, fontWeight: 500 }}
            value={String(config.tiempo?.label ?? "Tiempo (s)")}
          />
        </YAxis>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="tiempo" radius={4}>
          {chartData.map((entry) => (
            <Cell fill={entry.fill} key={entry.question} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
