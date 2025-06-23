"use client";

import { UsersIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface ClassCardProps {
  classData: {
    id: string;
    name: string;
    students: number;
  };
}

export function ClassCard({ classData }: ClassCardProps) {
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

  const handleViewDetails = () => {
    window.location.href = `/teach/clases/${createClassSlug(classData.name)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {classData.name}
        </h3>
        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <UsersIcon className="h-4 w-4 mr-2" />
          <span>{classData.students} estudiantes</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={handleViewDetails}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Ver detalles →
        </button>
      </div>
    </div>
  );
}
