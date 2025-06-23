"use client";

import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Question {
  text: string;
  options: [string, string, string];
  topic: string;
}

// Allow letters, numbers, + - * / ^, spaces, and brackets () [] {}
function sanitizeInput(input: string): string {
  return input.replace(/[^A-Za-z0-9+\-*/^()\[\]{}\s]/g, "");
}

// Only escape HTML and replace * → ×, / → ÷. Leave ^ untouched.
function formatMath(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

export function CreateHomeworkModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateHomeworkModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [gameType, setGameType] = useState<string>("");
  const [homeworkName, setHomeworkName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 8 }, () => ({
      text: "",
      options: ["", "", ""],
      topic: "",
    }))
  );
  const [topicsUsed, setTopicsUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setAssignmentId(localStorage.getItem("AssignmentID") || "");
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      // reset
      setStep(1);
      setGameType("");
      setHomeworkName("");
      setDescription("");
      setQuestions(
        Array.from({ length: 8 }, () => ({
          text: "",
          options: ["", "", ""],
          topic: "",
        }))
      );
      setTopicsUsed([]);
      setError("");
    }
  }, [isOpen]);

  const handleNext = () => {
    if (!assignmentId || !gameType) {
      setError("Debes seleccionar un juego.");
      return;
    }
    if (!homeworkName.trim() || !description.trim()) {
      setError("Nombre y descripción obligatorios.");
      return;
    }
    setError("");
    setStep(2);
  };

  const updateQuestion = (
    idx: number,
    field: "text" | "options" | "topic",
    value: string | [string, string, string]
  ) => {
    setQuestions((qs) => {
      const next = [...qs];
      if (field === "options")
        next[idx].options = value as [string, string, string];
      else if (field === "topic") next[idx].topic = value as string;
      else next[idx].text = value as string;
      return next;
    });
  };

  const handleTopicBlur = (raw: string) => {
    const t = raw.trim();
    if (t && !topicsUsed.includes(t)) setTopicsUsed((prev) => [...prev, t]);
  };

  const handleSubmit = async () => {
    // basic validation
    for (let i = 0; i < 8; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`La pregunta ${i + 1} está vacía.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`Las opciones de la pregunta ${i + 1} son obligatorias.`);
        return;
      }
      if (!q.topic.trim()) {
        setError(`El tema de la pregunta ${i + 1} es obligatorio.`);
        return;
      }
    }

    setLoading(true);
    setError("");
    try {
      const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
      if (!token) throw new Error("No token de autenticación.");

      const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
      const base = process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL;

      // 1) Create level
      const lvlRes = await fetch(`${base}/${stage}/custom-levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({
          assignment_id: assignmentId,
          game_type: gameType,
          name: homeworkName.trim(),
          description: description.trim(),
          questions_ids: [],
        }),
      });
      const lvlData = await lvlRes.json();
      if (!lvlRes.ok) throw new Error(lvlData.error || "Error creando nivel.");

      // 2) Create questions
      const payload = questions.map((q) => ({
        level_id: lvlData.level_id,
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        correctIndex: 0,
        topic: q.topic.trim(),
      }));
      const qRes = await fetch(`${base}/${stage}/custom-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(payload),
      });
      const qData = await qRes.json();
      if (!qRes.ok) throw new Error(qData.error || "Error creando preguntas.");

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {step === 1 ? "Nueva Tarea" : "Añade las Preguntas"}
      </h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignación
            </label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={loading}
            >
              <option value="">-- Selecciona un juego --</option>
              <option value="GameJump">Salto Clave</option>
              <option value="QJ_1-1">Rio Splash</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la tarea
            </label>
            <input
              type="text"
              value={homeworkName}
              onChange={(e) => setHomeworkName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          <datalist id="topics">
            {topicsUsed.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>

          {questions.map((q, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <h3 className="font-medium">Pregunta {idx + 1}</h3>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Texto
                </label>
                <input
                  type="text"
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(idx, "text", sanitizeInput(e.target.value))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                />
                <div
                  className="mt-1 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: formatMath(q.text) }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {q.options.map((opt, i) => (
                  <div key={i}>
                    <label className="block text-xs text-gray-600 mb-1">
                      Opción {i + 1}
                      {i === 0 && " (Correcta)"}
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const opts = [...q.options] as [string, string, string];
                        opts[i] = sanitizeInput(e.target.value);
                        updateQuestion(idx, "options", opts);
                      }}
                      className="w-full px-2 py-1 border rounded-md"
                      disabled={loading}
                    />
                    <div
                      className="mt-1 text-gray-600"
                      dangerouslySetInnerHTML={{ __html: formatMath(opt) }}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Tema</label>
                <input
                  type="text"
                  list="topics"
                  value={q.topic}
                  onChange={(e) => updateQuestion(idx, "topic", e.target.value)}
                  onBlur={(e) => handleTopicBlur(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                />
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 disabled:opacity-50"
            >
              Atrás
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creando..." : "Crear Tarea"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
