"use client";

import { useEffect, useState } from "react";

interface ClassDetailPageProps {
  params: {
    classId: string; // Recibe el ID de la clase
  };
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const [classDetail, setClassDetail] = useState<any>(null); // Almacena los detalles de la clase
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchClassDetail = async () => {
      try {
        const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
        if (!token) throw new Error("No token found!");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${params.classId}`,
          {
            method: "GET",
            headers: {
              Authorization: token,
            },
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error fetching class");

        setClassDetail(data); // Guarda los detalles de la clase
      } catch (err: any) {
        setError(err.message || "Error al cargar los detalles de la clase.");
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [params.classId]);

  if (loading) return <p>Cargando...</p>;

  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Detalles de la clase
        </h1>
        <p className="text-gray-600 mt-1">Clase: {classDetail.name}</p>
      </div>

      <div>
        <p>
          <strong>ID de la clase:</strong> {classDetail.classroom_id}
        </p>
        <p>
          <strong>Nombre de la clase:</strong> {classDetail.name}
        </p>
        <p>
          <strong>Estudiantes:</strong> {classDetail.students.length}
        </p>
      </div>
    </div>
  );
}
