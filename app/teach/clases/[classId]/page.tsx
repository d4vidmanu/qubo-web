"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Import useParams

interface ClassDetailPageProps {
  params: {
    classId: string; // We no longer directly access params.classId, instead we use useParams
  };
}

export default function ClassDetailPage() {
  const params = useParams(); // Unwrap the classId parameter using useParams
  const classId = params?.classId as string | undefined; // Type assertion to safely extract classId
  const [classDetail, setClassDetail] = useState<any>(null); // Almacena los detalles de la clase
  const [students, setStudents] = useState<any[]>([]); // Almacena los estudiantes
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!classId) {
      setError("Clase no encontrada.");
      setLoading(false);
      return;
    }

    const fetchClassDetail = async () => {
      try {
        const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
        if (!token) throw new Error("No token found!");

        // Obtener las clases del profesor para hacer el match con el classroom_id
        const resClasses = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/teacher`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );
        const dataClasses = await resClasses.json();
        if (!resClasses.ok)
          throw new Error(dataClasses.error || "Error fetching classes");

        // Buscar el classroom_id que coincida con la clase clickeada
        const classFound = dataClasses.find(
          (classItem: any) =>
            classItem.name
              .toLowerCase()
              .replace(/á/g, "a")
              .replace(/é/g, "e")
              .replace(/í/g, "i")
              .replace(/ó/g, "o")
              .replace(/ú/g, "u")
              .replace(/ñ/g, "n")
              .replace(/\s+/g, "-") === classId // Use classId from params
        );

        if (!classFound) {
          throw new Error("Clase no encontrada.");
        }

        // Obtener detalles de la clase usando classroom_id
        const resClass = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${classFound.classroom_id}/students`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );

        const dataClass = await resClass.json();
        if (!resClass.ok)
          throw new Error(dataClass.error || "Error fetching class");

        // Obtener los estudiantes
        const resStudents = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${classFound.classroom_id}/students`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );
        const dataStudents = await resStudents.json();
        if (!resStudents.ok)
          throw new Error(dataStudents.error || "Error fetching students");

        setClassDetail(dataClass); // Guarda los detalles de la clase
        setStudents(dataStudents.students); // Guarda la lista de estudiantes
      } catch (err: any) {
        setError(err.message || "Error al cargar los detalles.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]); // Actualiza cuando el 'classId' cambie

  if (loading) return <p>Cargando...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6 text-gray-900">
      <div>
        <p>
          <strong>Estudiantes:</strong> {classDetail.students.length}
        </p>
      </div>

      {/* Mosaico de estudiantes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {students.map((student: any) => (
          <div key={student.user_id} className="border rounded-lg p-4 border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {student.name} {student.lastName}
            </h3>
            <p className="text-sm text-gray-600">{student.email}</p>
            <p className="text-xs text-gray-500">{student.dni}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
