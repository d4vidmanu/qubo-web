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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewAll, setViewAll] = useState(false);

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
          onClick={() => setViewAll((v) => !v)}
          className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm"
        >
          {viewAll ? "Ver preguntas uno a uno" : "Ver todas las preguntas"}
        </button>
      </div>

      {loading && <p>Cargando preguntas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          {viewAll ? (
            <>
              {/* Only in list view: show/hide all answers */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleShowAll}
                  className="px-3 py-1 border rounded-md text-sm hover:bg-gray-100"
                >
                  {showAll
                    ? "Ocultar todas las respuestas"
                    : "Mostrar todas las respuestas"}
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((q, idx) => {
                  const isRevealed = showAll || revealed.has(q.question_id);
                  return (
                    <div key={q.question_id} className="border p-4 rounded-md">
                      <p className="font-medium mb-2">
                        Pregunta {idx + 1}: {q.text}
                      </p>
                      <ul
                        className={`list-disc list-inside space-y-1 cursor-pointer ${
                          isRevealed ? "" : "filter blur-sm"
                        }`}
                        onClick={() => toggleReveal(q.question_id)}
                      >
                        {q.options.map((opt, i) => (
                          <li
                            key={i}
                            className={
                              i === q.correctIndex
                                ? "font-semibold text-green-600"
                                : ""
                            }
                          >
                            {opt} {i === q.correctIndex && "(Correcta)"}
                          </li>
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
                  <p className="font-medium mb-2">
                    Pregunta {currentIndex + 1}: {questions[currentIndex].text}
                  </p>
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
                      >
                        {opt}{" "}
                        {i === questions[currentIndex].correctIndex &&
                          "(Correcta)"}
                      </li>
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
