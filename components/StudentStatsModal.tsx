"use client";

import { useEffect, useState, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface StudentStat {
  user_id: string;
  name: string;
  total_time_played: number;
  questions_answered: number;
  last_time_active: string | null;
}

interface StudentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  userId: string;
  studentName: string;
}

export function StudentStatsModal({
  isOpen,
  onClose,
  classroomId,
  userId,
  studentName,
}: StudentStatsModalProps) {
  const dialogRef = useRef<HTMLDialogElement|null>(null);
  const [stat, setStat] = useState<StudentStat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.showModal();
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/stats/${classroomId}`,
      { headers: { Authorization: document.cookie.match(/(^|;) *token=([^;]+)/)?.[2]! } }
    )
      .then(res => res.json())
      .then(data => {
        if (!data.students_stats) throw new Error("Malformed stats");
        const s = data.students_stats.find((s: StudentStat) => s.user_id === userId);
        if (!s) throw new Error("No stats for user");
        setStat(s);
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));

    return () => {
      dialogRef.current?.close();
      setStat(null);
      setError("");
    };
  }, [isOpen, classroomId, userId]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto max-w-md w-full p-6 bg-white rounded-lg shadow-lg overflow-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h2 className="text-xl font-semibold mb-4">Estadísticas de {studentName}</h2>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {stat && (
        <div className="space-y-3">
          <div>
            <strong>Tiempo total jugado:</strong> {stat.total_time_played} s
          </div>
          <div>
            <strong>Preguntas respondidas:</strong> {stat.questions_answered}
          </div>
          <div>
            <strong>Última actividad:</strong>{" "}
            {stat.last_time_active
              ? new Date(stat.last_time_active).toLocaleString()
              : "Nunca"}
          </div>
        </div>
      )}
    </dialog>
  );
}
