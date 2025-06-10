interface ClassDetailPageProps {
  params: {
    classId: string
  }
}

// Mock class data mapping
const classNames: Record<string, string> = {
  algebra: "Álgebra",
  geometria: "Geometría",
  trigonometria: "Trigonometría",
  calculo: "Cálculo",
  estadistica: "Estadística",
  probabilidad: "Probabilidad",
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  // Convert slug back to readable name
  const slugToName = (slug: string) => {
    if (classNames[slug]) {
      return classNames[slug]
    }
    // Fallback: convert slug back to readable format
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const className = slugToName(params.classId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Esta es la página de la clase: {className}</h1>
      </div>
    </div>
  )
}
