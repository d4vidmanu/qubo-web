"use client";

import { useEffect, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Line,
  Tooltip as ComboTooltip,
  Legend,
} from "recharts";

interface TopicError {
  topic: string;
  errorRate: number;
}
interface DayStat {
  date: string;
  total_time_spent: number;
  total_questions_answered: number;
  average_correct_rate: number;
}
interface ClassStats {
  total_questions_answered: number;
  average_time_spent_per_student: number;
  average_correct_rate: number;
  progress_by_day: DayStat[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
}

export function ClassroomStatsModal({ isOpen, onClose, classroomId }: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [topics, setTopics] = useState<TopicError[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.showModal();
    setLoading(true);
    setError("");

    const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2]!;
    const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
    const base = process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL;
    const classroom = process.env.NEXT_PUBLIC_CLASSROOM_API_URL;

    Promise.all([
      fetch(`${base}/${stage}/topics/errors/${classroomId}`, {
        headers: { Authorization: token },
      }).then((r) => r.json()) as Promise<TopicError[]>,
      fetch(`${classroom}/${stage}/classroom/stats/${classroomId}`, {
        headers: { Authorization: token },
      }).then((r) => r.json()) as Promise<ClassStats>,
    ])
      .then(([t, s]) => {
        setTopics(t);
        setStats(s);
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));

    return () => {
      dialogRef.current?.close();
      setTopics([]);
      setStats(null);
    };
  }, [isOpen, classroomId]);

  if (!isOpen) return null;

  // Colors for pie chart slices
  const COLORS = ["#EF4444", "#10B981", "#3B82F6", "#F59E0B"];

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto w-full max-w-3xl p-6 bg-white rounded-lg shadow-lg overflow-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-2xl font-semibold mb-4">Estadísticas del Aula</h2>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {stats && (
        <>
          {/* 1) Top‐level metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Total Preguntas</p>
              <p className="text-xl font-bold">
                {stats.total_questions_answered}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Tiempo Medio (s)</p>
              <p className="text-xl font-bold">
                {stats.average_time_spent_per_student}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Tasa Acierto (%)</p>
              <p className="text-xl font-bold">
                {Math.round(stats.average_correct_rate * 100)}%
              </p>
            </div>
          </div>

          {/* 2) Error Rate por Tema (Gráfico de torta por cada tema) */}
          {topics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topics.map((t) => {
                const data = [
                  { name: "Correcto", value: 1 - t.errorRate },
                  { name: "Error", value: t.errorRate },
                ];

                return (
                  <div
                    key={t.topic}
                    className="bg-gray-50 rounded p-4 flex flex-col items-center"
                  >
                    <h3 className="text-lg font-semibold mb-2 capitalize">
                      {t.topic}
                    </h3>
                    <PieChart width={250} height={220}>
                      <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                      >
                        <Cell key="correct" fill="#10B981" /> {/* Verde */}
                        <Cell key="error" fill="#EF4444" /> {/* Rojo */}
                      </Pie>
                      <PieTooltip
                        formatter={(v: number) => `${Math.round(v * 100)}%`}
                      />
                    </PieChart>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3) Progress by Day (ComposedChart) */}
          <h3 className="text-lg font-medium mt-6 mb-2">Progreso Diario</h3>
          <div className="overflow-auto">
            <ComposedChart
              width={600}
              height={300}
              data={stats.progress_by_day}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Preguntas",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1]}
                label={{
                  value: "% Acierto",
                  angle: 90,
                  position: "insideRight",
                }}
              />
              <Bar
                yAxisId="left"
                dataKey="total_questions_answered"
                name="Preguntas"
                fill="#3B82F6"
              />
              <Line
                yAxisId="right"
                dataKey="average_correct_rate"
                name="Tasa Acierto"
                stroke="#EF4444"
                strokeWidth={2}
              />
              <ComboTooltip
                formatter={(v: any, name: string) =>
                  name === "Tasa Acierto" ? `${Math.round(v * 100)}%` : v
                }
              />
              <Legend verticalAlign="top" />
            </ComposedChart>
          </div>
        </>
      )}
    </dialog>
  );
}
