"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ClipboardDocumentListIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { CreateHomeworkModal } from "@/components/CreateHomeworkModal";
import { CreateStudentModal } from "@/components/CreateStudentModal";

export default function ClassDetailPage() {
  const params = useParams();
  const classSlug = params?.classId as string | undefined;

  const [classDetail, setClassDetail] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [classroomId, setClassroomId] = useState<string>("");

  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Reusable student fetcher
  const fetchStudents = async (cid: string) => {
    const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
    if (!token) throw new Error("No token found!");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${cid}/students`,
      { method: "GET", headers: { Authorization: token } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error fetching students");
    setStudents(data.students);
    // keep classDetail.students in sync
    setClassDetail((prev: any) =>
      prev ? { ...prev, students: data.students } : prev
    );
  };

  useEffect(() => {
    if (!classSlug) {
      setError("Clase no encontrada.");
      setLoading(false);
      return;
    }

    const init = async () => {
      try {
        const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
        if (!token) throw new Error("No token found!");

        // 1) Resolve slug → classroom_id
        const resClasses = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/teacher`,
          { method: "GET", headers: { Authorization: token } }
        );
        const dataClasses = await resClasses.json();
        if (!resClasses.ok)
          throw new Error(dataClasses.error || "Error fetching classes");

        const found = dataClasses.find((ci: any) =>
          ci.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "-") === classSlug
        );
        if (!found) throw new Error("Clase no encontrada.");

        const cid = found.classroom_id;
        setClassroomId(cid);

        // 2) Fetch full classDetail (with initial students array)
        const resDetail = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${cid}/students`,
          { method: "GET", headers: { Authorization: token } }
        );
        const dataDetail = await resDetail.json();
        if (!resDetail.ok)
          throw new Error(
            dataDetail.error || "Error fetching classroom students"
          );

        setClassDetail(dataDetail);
        setStudents(dataDetail.students);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [classSlug]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      <CreateHomeworkModal
        isOpen={isHwModalOpen}
        onClose={() => setIsHwModalOpen(false)}
        onSuccess={() => {
          /* e.g. refetch assignments */
        }}
      />

      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classroomId={classroomId}
        onSuccess={() => {
          // reload only the students list
          fetchStudents(classroomId);
        }}
      />

      <div className="space-y-6 text-gray-900">
        <div className="flex items-center justify-between">
          <p>
            <strong>Estudiantes:</strong> {students.length}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <UserPlusIcon className="w-5 h-5" />
              Añadir Alumno
            </button>
            <button
              onClick={() => setIsHwModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              Nueva tarea
            </button>
          </div>
        </div>

        {/* Mosaico de estudiantes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {students.map((student: any) => (
            <div
              key={student.user_id}
              className="border rounded-lg p-4 border-gray-300 hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                  <Image
                    src={`/img/skins/${student.skinSeleccionada}.png`}
                    alt={`${student.name} skin`}
                    width={64}
                    height={64}
                    priority
                    className="rounded-full"
                  />
                </div>
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
    </>
  );
}
