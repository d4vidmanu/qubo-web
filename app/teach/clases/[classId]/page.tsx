"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params?.classId as string | undefined;

  const [classDetail, setClassDetail] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
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

        // 1) Obtener lista de clases del profe
        const resClasses = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/teacher`,
          {
            method: "GET",
            headers: { Authorization: token },
          }
        );
        const dataClasses = await resClasses.json();
        if (!resClasses.ok)
          throw new Error(dataClasses.error || "Error fetching classes");

        // 2) Encontrar la clase actual por slug
        const classFound = dataClasses.find(
          (ci: any) =>
            ci.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/\s+/g, "-") === classId
        );
        if (!classFound) throw new Error("Clase no encontrada.");

        // 3) Obtener detalles de la clase (incluye students array)
        const resDetail = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${classFound.classroom_id}/students`,
          {
            method: "GET",
            headers: { Authorization: token },
          }
        );
        const dataDetail = await resDetail.json();
        if (!resDetail.ok)
          throw new Error(dataDetail.error || "Error fetching class details");

        setClassDetail(dataDetail); // { classroom_name, students: [...] }
        setStudents(dataDetail.students); // array de estudiantes
      } catch (err: any) {
        setError(err.message || "Error al cargar los detalles.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {students.map((student: any) => (
          <div
            key={student.user_id}
            className="border rounded-lg p-4 border-gray-300 hover:shadow-lg transition-shadow overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              {/* 1. Skin Image */}
              <div className="flex-shrink-0">
                <Image
                  src={`/img/skins/${student.skinSeleccionada}.png`}
                  alt={`${student.name} skin`}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              </div>

              {/* 2. Student Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap overflow-hidden">
                  {student.name} {student.lastName}
                </h3>
                <p className="text-sm text-gray-600 whitespace-nowrap overflow-hidden">
                  {student.email}
                </p>
                <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden">
                  {student.dni}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
