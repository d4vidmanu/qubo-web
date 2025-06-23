// components/QuestionsModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface Question {
  question_id: string;
  level_id: string;
  text: string;
  options: string[];
  topic: string;
  correctIndex: number;
}

interface QuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelId: string;
}

// simple formatter for preview: × for *, ÷ for /
function formatMath(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*/g, "×")
    .replace(/\//g, "÷");
}

export function QuestionsModal({
  isOpen,
  onClose,
  levelId,
}: QuestionsModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [viewAll, setViewAll] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError("");
    fetch(
      `${process.env.NEXT_PUBLIC_ASSIGNMENTS_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/custom-levels/${levelId}/questions`,
      {
        method: "GET",
        headers: {
          Authorization: document.cookie.match(/(^|;) *token=([^;]+)/)?.[2]!,
        },
      }
    )
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok)
            throw new Error(data.error || "Error fetching questions");
          setQuestions(data.questions || []);
        })
      )
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, levelId]);

  const toggleReveal = (qid: string) => {
    setShowAll(false);
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(qid) ? next.delete(qid) : next.add(qid);
      return next;
    });
  };

  const handleShowAll = () => {
    if (showAll) {
      setRevealed(new Set());
      setShowAll(false);
    } else {
      setRevealed(new Set(questions.map((q) => q.question_id)));
      setShowAll(true);
    }
  };

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () =>
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  if (!isOpen) return null;

  return (
    <dialog
      open
      className="fixed inset-0 m-auto max-w-3xl w-full max-h-[90vh] p-6 bg-white rounded-md shadow-lg overflow-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Revisar Preguntas</h2>
        <button
          onClick={() => {
            setViewAll((v) => !v);
            setShowAll(false);
            setRevealed(new Set());
          }}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm"
        >
          {viewAll ? "Ver preguntas una a una" : "Ver todas las preguntas"}
        </button>
      </div>

      {loading && <p>Cargando preguntas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {viewAll ? (
            <>
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleShowAll}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                >
                  {showAll
                    ? "Ocultar todas respuestas"
                    : "Mostrar todas respuestas"}
                </button>
              </div>
              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const isRevealed = showAll || revealed.has(q.question_id);
                  return (
                    <div
                      key={q.question_id}
                      className="border p-4 rounded-md"
                      onClick={() => toggleReveal(q.question_id)}
                    >
                      <p
                        className="font-medium mb-2"
                        dangerouslySetInnerHTML={{
                          __html: `Pregunta ${idx + 1}: ${formatMath(q.text)}`,
                        }}
                      />
                      <ul
                        className={`list-disc list-inside space-y-1 cursor-pointer ${
                          isRevealed ? "" : "filter blur-sm"
                        }`}
                      >
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={
                              i === q.correctIndex
                                ? "font-semibold text-green-600"
                                : ""
                            }
                            dangerouslySetInnerHTML={{
                              __html:
                                formatMath(opt) +
                                (i === q.correctIndex ? " (Correcta)" : ""),
                            }}
                          />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="border p-6 rounded-md">
              {questions.length > 0 && (
                <>
                  <p
                    className="font-medium mb-2"
                    dangerouslySetInnerHTML={{
                      __html: `Pregunta ${currentIndex + 1}: ${formatMath(
                        questions[currentIndex].text
                      )}`,
                    }}
                  />
                  <ul
                    className={`list-disc list-inside space-y-1 cursor-pointer ${
                      showAll ||
                      revealed.has(questions[currentIndex].question_id)
                        ? ""
                        : "filter blur-sm"
                    }`}
                    onClick={() =>
                      toggleReveal(questions[currentIndex].question_id)
                    }
                  >
                    {questions[currentIndex].options.map((opt, i) => (
                      <li
                        key={i}
                        className={
                          i === questions[currentIndex].correctIndex
                            ? "font-semibold text-green-600"
                            : ""
                        }
                        dangerouslySetInnerHTML={{
                          __html:
                            formatMath(opt) +
                            (i === questions[currentIndex].correctIndex
                              ? " (Correcta)"
                              : ""),
                        }}
                      />
                    ))}
                  </ul>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={prev}
                      disabled={currentIndex === 0}
                      className="p-2 border rounded-md hover:bg-gray-100"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={next}
                      disabled={currentIndex === questions.length - 1}
                      className="p-2 border rounded-md hover:bg-gray-100"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
