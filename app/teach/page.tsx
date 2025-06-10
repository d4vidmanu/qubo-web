"use client";

import { useState, useEffect } from "react";
import { ClassCard } from "@/components/class-card";

interface ClassItem {
  id: string; // Cambié 'classroom_id' por 'id' aquí
  name: string;
  students: number; // Número de estudiantes
}

export default function TeachDashboard() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError("");
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

        // Cambié classroom_id por id y calculé students como la longitud del array
        const classesWithStudents = data.map((classItem: any) => ({
          id: classItem.classroom_id, // Cambié 'classroom_id' por 'id'
          name: classItem.name,
          students: classItem.students.length, // Número de estudiantes
        }));

        setClasses(classesWithStudents);
      } catch (err: any) {
        setError(err.message || "Error al cargar las clases.");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Gestiona tus clases y estudiantes</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Cargando clases...</p>
        ) : (
          classes.map((classItem) => (
            <ClassCard key={classItem.id} classData={classItem} />
          ))
        )}
      </div>
    </div>
  );
}
