"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ClipboardDocumentListIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import { CreateHomeworkModal } from "@/components/CreateHomeworkModal";
import { CreateStudentModal } from "@/components/CreateStudentModal";
import { AssignmentsModal } from "@/components/AssignmentsModal";
import { ClassroomStatsModal } from "@/components/ClassroomStatsModal";
import { StudentStatsModal } from "@/components/StudentStatsModal";

export default function ClassDetailPage() {
  const params = useParams();
  const classSlug = params?.classId;

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classroomId, setClassroomId] = useState("");

  const [isHwModalOpen, setIsHwModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [statsUser, setStatsUser] = useState<{ id: string; name: string }>({
    id: "",
    name: "",
  });

  const fetchStudents = async (cid: string) => {
    const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/${cid}/students`,
      { headers: { Authorization: token! } }
    );
    const data = await res.json();
    setStudents(data.students || []);
  };

  useEffect(() => {
    if (!classSlug) {
      setError("Clase no encontrada.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const token = document.cookie.match(/(^|;) *token=([^;]+)/)?.[2];
        const rc = await fetch(
          `${process.env.NEXT_PUBLIC_CLASSROOM_API_URL}/${process.env.NEXT_PUBLIC_USER_API_STAGE}/classrooms/teacher`,
          { headers: { Authorization: token! } }
        );
        const dc = await rc.json();
        const found = dc.find(
          (ci: any) =>
            ci.name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .replace(/\s+/g, "-") === classSlug
        );
        const cid = found.classroom_id;
        setClassroomId(cid);
        await fetchStudents(cid);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [classSlug]);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <>
      <CreateHomeworkModal
        isOpen={isHwModalOpen}
        onClose={() => setIsHwModalOpen(false)}
      />
      <CreateStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        classroomId={classroomId}
        onSuccess={() => fetchStudents(classroomId)}
      />
      <AssignmentsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
      />
      <ClassroomStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        classroomId={classroomId}
      />
      <StudentStatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        classroomId={classroomId}
        userId={statsUser.id}
        studentName={statsUser.name}
      />

      <div className="space-y-6 text-gray-900">
        <div className="flex items-center justify-between">
          <p>
            <strong>Estudiantes:</strong> {students.length}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              <UserPlusIcon className="w-5 h-5" />
              Añadir Alumno
            </button>
            <button
              onClick={() => setIsHwModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              Nueva tarea
            </button>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Ver tareas
            </button>
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-100"
            >
              <ChartPieIcon className="w-5 h-5" />
              Estadísticas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {students.map((s) => (
            <div
              key={s.user_id}
              onClick={() => {
                setStatsUser({ id: s.user_id, name: s.name });
                setIsStatsOpen(true);
              }}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={`/img/skins/${s.skinSeleccionada}.png`}
                  alt={`${s.name} skin`}
                  width={64}
                  height={64}
                  priority
                  className="rounded-full"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {s.name} {s.lastName}
                  </p>
                  <p className="text-xs truncate">{s.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
