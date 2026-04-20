import { getAllStudents } from "@/lib/data";
import StatCard from "@/components/StatCard";
import { GradTermChart, CompetencyChart, StageDistChart } from "@/components/DashboardCharts";
import StudentTable from "@/components/StudentTable";

function countApproved(student: Awaited<ReturnType<typeof getAllStudents>>[number]) {
  const comp = student.competencies;
  return (
    comp.leadership.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length +
    comp.research.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length +
    comp.intercultural.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length
  );
}

export default function HomePage() {
  const students = getAllStudents();
  const total = students.length;

  const approvedCounts = students.map(countApproved);
  const avgApproved = total > 0 ? (approvedCounts.reduce((a, b) => a + b, 0) / total).toFixed(1) : "0";
  const zeroApproved = approvedCounts.filter((c) => c === 0).length;

  const currentYear = new Date().getFullYear();
  const onTrack = students.filter((s) => {
    const g = s.student.expected_graduation?.toLowerCase() ?? "";
    return g.includes(String(currentYear));
  }).length;

  // Grad term distribution
  const termCounts: Record<string, number> = {};
  for (const s of students) {
    const t = s.student.expected_graduation ?? "Unknown";
    termCounts[t] = (termCounts[t] ?? 0) + 1;
  }
  const gradData = Object.entries(termCounts)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => a.term.localeCompare(b.term));

  // Approved by competency
  const compData = [
    {
      name: "Leadership",
      approved: students.reduce((sum, s) =>
        sum + s.competencies.leadership.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length, 0),
    },
    {
      name: "Research",
      approved: students.reduce((sum, s) =>
        sum + s.competencies.research.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length, 0),
    },
    {
      name: "Intercultural",
      approved: students.reduce((sum, s) =>
        sum + s.competencies.intercultural.experience_log.filter((e) => e.progress?.toLowerCase() === "completed").length, 0),
    },
  ];

  // Stage distribution
  const stageBuckets = [0, 0, 0, 0, 0]; // 0 stages, 1 stage, 2 stages, 3 stages, 4 stages
  for (const s of students) {
    const all = [
      ...s.competencies.leadership.highlighted,
      ...s.competencies.research.highlighted,
      ...s.competencies.intercultural.highlighted,
    ];
    for (const h of all) {
      stageBuckets[h.progress_stages_completed]++;
    }
  }
  const stageData = [
    { label: "0 stages", count: stageBuckets[0] },
    { label: "Stage 1 only", count: stageBuckets[1] },
    { label: "Stages 1–2", count: stageBuckets[2] },
    { label: "Stages 1–3", count: stageBuckets[3] },
    { label: "All 4 stages", count: stageBuckets[4] },
  ];

  // Table data
  const tableRows = students.map((s) => ({
    slug: s.slug,
    name: s.student.name ?? "",
    year: s.student.year ?? "Unknown",
    graduation: s.student.expected_graduation ?? "Unknown",
    totalApproved: countApproved(s),
  }));

  const years = [...new Set(students.map((s) => s.student.year ?? "Unknown"))].sort();
  const terms = [...new Set(students.map((s) => s.student.expected_graduation ?? "Unknown"))].sort();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-serif font-bold text-mnsu-purple">Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          {total === 0
            ? "No student files have been parsed yet. Drop .docx files into 'Plan of Study/' and push."
            : `${total} student${total !== 1 ? "s" : ""} in the system.`}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={total} accent />
        <StatCard label="Avg Approved Experiences" value={avgApproved} />
        <StatCard label="On Track for Graduation" value={onTrack} sub={`in ${currentYear}`} />
        <StatCard label="Zero Approved Experiences" value={zeroApproved} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GradTermChart data={gradData} />
        <CompetencyChart data={compData} />
        <StageDistChart data={stageData} />
      </div>

      <div>
        <h2 className="text-lg font-serif font-semibold text-mnsu-purple mb-3">All Students</h2>
        <StudentTable rows={tableRows} years={years} terms={terms} />
      </div>
    </div>
  );
}
