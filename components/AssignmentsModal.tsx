"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { QuestionsModal } from "./QuestionsModal";

interface AssignmentLevel {
  level_id: string;
  name: string;
  // other fields omitted
}

interface AssignmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AssignmentsModal({ isOpen, onClose }: AssignmentsModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [levels, setLevels] = useState<AssignmentLevel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [selectedLevelId, setSelectedLevelId] = useState<string>("");
  const [isQuestionsOpen, setIsQuestionsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
      fetchLevels();
    } else {
      dialogRef.current?.close();
      setLevels([]);
      setError("");
    }
  }, [isOpen]);

  const fetchLevels = async () => {
    setLoading(true);
    setError("");
    try {
      const assignmentId = localStorage.getItem("AssignmentID");
      if (!assignmentId) throw new Error("No AssignmentID in localStorage");

      const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
      if (!token) throw new Error("No token found!");

      const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
      const base = process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL;

      const res = await fetch(
        `${base}/${stage}/custom-levels/assignment/${assignmentId}`,
        {
          method: "GET",
          headers: { Authorization: token },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error fetching levels");
      setLevels(data.custom_levels || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <QuestionsModal
        isOpen={isQuestionsOpen}
        onClose={() => setIsQuestionsOpen(false)}
        levelId={selectedLevelId}
      />

      <dialog
        ref={dialogRef}
        className="w-full max-w-md rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
        onClose={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tareas</h2>

        {loading && <p>Cargando niveles...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-2">
            {levels.map((lvl) => (
              <li key={lvl.level_id}>
                <button
                  onClick={() => {
                    setSelectedLevelId(lvl.level_id);
                    setIsQuestionsOpen(true);
                    onClose(); // ✅ Cierra el modal principal
                  }}
                  className="w-full text-left px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-100"
                >
                  {lvl.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </dialog>
    </>
  );
}
