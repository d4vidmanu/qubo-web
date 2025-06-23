// components/CreateHomeworkModal.tsx
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

// only allow letters, digits, + - * / ^ = . whitespace and grouping symbols
function sanitizeInput(input: string): string {
  return input.replace(/[^A-Za-z0-9+\-*/^=.\s()[\]{}]/g, "");
}

// simple preview formatter: × for *, ÷ for /
function formatMath(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

function MathKeyboard({
  onKey,
  onClose,
}: {
  onKey: (char: string) => void;
  onClose: () => void;
}) {
  const keys = [
    "(",
    ")",
    "[",
    "]",
    "{",
    "}",
    "×",
    "÷",
    "7",
    "8",
    "9",
    "^",
    "-",
    "+",
    "4",
    "5",
    "6",
    "x",
    "=",
    ".",
    "1",
    "2",
    "3",
    "0",
  ];
  return (
    <div className="absolute bottom-0 left-0 w-full bg-gray-100 p-2 shadow-inner z-50">
      <div className="flex justify-end mb-1">
        <button
          onClick={onClose}
          className="px-2 py-1 text-gray-600 hover:text-gray-800"
        >
          Cerrar
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => onKey(k === "×" ? "*" : k === "÷" ? "/" : k)}
            className="p-2 bg-white rounded border hover:bg-gray-200"
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

export function CreateHomeworkModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateHomeworkModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [assignmentId, setAssignmentId] = useState("");
  const [gameType, setGameType] = useState("");
  const [homeworkName, setHomeworkName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 8 }, () => ({
      text: "",
      options: ["", "", ""],
      topic: "",
    }))
  );
  const [topicsUsed, setTopicsUsed] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // keyboard
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [focusedQ, setFocusedQ] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAssignmentId(localStorage.getItem("AssignmentID") || "");
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
      // reset all
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
      setKeyboardVisible(false);
      setFocusedQ(null);
    }
  }, [isOpen]);

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

  const handleTopicBlur = (raw: string) => {
    const t = raw.trim();
    if (t && !topicsUsed.includes(t)) setTopicsUsed((p) => [...p, t]);
  };

  const handleKey = (char: string) => {
    if (focusedQ !== null) {
      const cur = questions[focusedQ].text;
      updateQuestion(focusedQ, "text", sanitizeInput(cur + char));
    }
  };

  const handleSubmit = async () => {
    // simple validation
    for (let i = 0; i < 8; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Pregunta ${i + 1} vacía.`);
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        setError(`Opciones faltantes en P${i + 1}.`);
        return;
      }
      if (!q.topic.trim()) {
        setError(`Tema faltante en P${i + 1}.`);
        return;
      }
    }
    setLoading(true);
    setError("");
    try {
      const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
      if (!token) throw new Error("No token");
      const stage = process.env.NEXT_PUBLIC_USER_API_STAGE;
      const base = process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL;

      // create level
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

      // create questions
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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="relative w-full max-w-2xl rounded-lg p-6 bg-white shadow-lg absolute left-1/2 -translate-x-1/2 top-20"
      onClose={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <h2 className="text-xl font-semibold mb-4">
        {step === 1 ? "Nueva Tarea" : "Añade las Preguntas"}
      </h2>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {step === 1 ? (
        <div className="space-y-4">
          {/* Asignación selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asignación
            </label>
            <select
              value={gameType}
              onChange={(e) => setGameType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="">-- Selecciona un juego --</option>
              <option value="GameJump">Salto Clave</option>
              <option value="QJ_1-1">Rio Splash</option>
            </select>
          </div>

          {/* Nombre de la tarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la tarea
            </label>
            <input
              type="text"
              value={homeworkName}
              onChange={(e) => setHomeworkName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              disabled={loading}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
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
            <div key={idx} className="border rounded p-4 space-y-3">
              <h3 className="font-medium">Pregunta {idx + 1}</h3>

              {/* Texto */}
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
                  onDoubleClick={() => {
                    setFocusedQ(idx);
                    setKeyboardVisible(true);
                  }}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                />
                <div
                  className="mt-1 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: formatMath(q.text) }}
                />
              </div>

              {/* Opciones */}
              <div className="grid grid-cols-3 gap-2">
                {q.options.map((opt, i) => (
                  <div key={i}>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Opción {i + 1}
                      {i === 0 && " (Correcta)"}
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const o = [...q.options] as [string, string, string];
                        o[i] = sanitizeInput(e.target.value);
                        updateQuestion(idx, "options", o);
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

              {/* Tema */}
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
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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

      {keyboardVisible && (
        <MathKeyboard
          onKey={handleKey}
          onClose={() => setKeyboardVisible(false)}
        />
      )}
    </dialog>
  );
}
