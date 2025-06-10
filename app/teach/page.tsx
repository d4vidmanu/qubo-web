import { ClassCard } from "@/components/class-card"

const mockClasses = [
  { id: 1, name: "Álgebra", students: 24, assignments: 8 },
  { id: 2, name: "Geometría", students: 19, assignments: 5 },
  { id: 3, name: "Trigonometría", students: 22, assignments: 12 },
  { id: 4, name: "Cálculo", students: 18, assignments: 6 },
  { id: 5, name: "Estadística", students: 26, assignments: 9 },
  { id: 6, name: "Probabilidad", students: 21, assignments: 7 },
]

export default function TeachDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
        <p className="text-gray-600 mt-1">Gestiona tus clases y estudiantes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockClasses.map((classItem) => (
          <ClassCard key={classItem.id} classData={classItem} />
        ))}
      </div>
    </div>
  )
}
