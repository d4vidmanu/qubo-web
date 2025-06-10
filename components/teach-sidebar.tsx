"use client";

import { useState, useEffect } from "react";
import { PlusIcon, HomeIcon } from "@heroicons/react/24/outline";
import { CreateClassModal } from "./create-class-modal";

export function TeachSidebar() {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
        if (!token) throw new Error("No token found!");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/teacher`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error fetching classes");

        const formattedClasses = data.map((classItem: any) => ({
          id: classItem.classroom_id,
          name: classItem.name,
        }));

        setClasses(formattedClasses);
      } catch (err: any) {
        console.error(err.message || "Error al cargar las clases.");
      }
    };

    fetchClasses();
  }, []);

  const handleCreateClass = (newClassName: string) => {
    setClasses((prev) => [
      ...prev,
      { id: Math.random().toString(), name: newClassName }, // Simula el ID para clases creadas
    ]);
  };

  const createClassSlug = (className: string) => {
    return className
      .toLowerCase()
      .replace(/á/g, "a")
      .replace(/é/g, "e")
      .replace(/í/g, "i")
      .replace(/ó/g, "o")
      .replace(/ú/g, "u")
      .replace(/ñ/g, "n")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tus clases</h2>

          <div className="space-y-2 mb-6">
            <button
              onClick={() => (window.location.href = "/teach")}
              className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <HomeIcon className="w-5 h-5" />
              Todas las clases
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <PlusIcon className="w-5 h-5" />
              Nueva clase
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Clases activas</h3>
            {classes.map((classItem) => (
              <button
                key={classItem.id}
                className="w-full text-left text-sm px-4 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                onClick={() =>
                  (window.location.href = `/teach/clases/${createClassSlug(classItem.name)}`)
                }
              >
                {classItem.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CreateClassModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateClass={handleCreateClass}
      />
    </>
  );
}
