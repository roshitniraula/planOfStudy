import { getAllStudents, getStudentBySlug } from "@/lib/data";
import ProgressBar from "@/components/ProgressBar";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CompetencySection } from "@/lib/types";

export function generateStaticParams() {
  return getAllStudents().map((s) => ({ slug: s.slug }));
}

function CompetencyBlock({ title, section }: { title: string; section: CompetencySection }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-mnsu-maroon text-white px-5 py-3">
        <h3 className="font-serif font-semibold">{title}</h3>
      </div>
      <div className="p-5 space-y-5">
        {/* Experience Log */}
        {section.experience_log.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Experience Log</h4>
            <table className="w-full text-sm border border-gray-100 rounded overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-1.5 text-left text-gray-600 font-medium">Experience</th>
                  <th className="px-3 py-1.5 text-left text-gray-600 font-medium">Type</th>
                  <th className="px-3 py-1.5 text-left text-gray-600 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {section.experience_log.map((e, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-3 py-2">{e.experience ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2 text-gray-500">{e.type ?? "—"}</td>
                    <td className="px-3 py-2">
                      {e.progress ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          e.progress.toLowerCase() === "completed"
                            ? "bg-green-100 text-green-700"
                            : e.progress.toLowerCase().includes("progress")
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {e.progress}
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Highlighted Experiences */}
        {section.highlighted.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Highlighted Experiences</h4>
            <div className="space-y-3">
              {section.highlighted.map((h, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{h.experience ?? "—"}</span>
                    {h.type && (
                      <span className="text-xs bg-mnsu-gold/20 text-mnsu-maroon px-2 py-0.5 rounded-full">{h.type}</span>
                    )}
                  </div>
                  <ProgressBar stages={h.progress_stages} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advisor Notes */}
        {section.advisor_notes && (
          <div className="bg-mnsu-gold/10 border-l-4 border-mnsu-gold rounded-r-lg p-4">
            <div className="text-xs font-semibold text-mnsu-maroon uppercase tracking-wide mb-1">Instructor / Advisor Notes</div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{section.advisor_notes}</p>
          </div>
        )}

        {section.experience_log.length === 0 && section.highlighted.length === 0 && !section.advisor_notes && (
          <p className="text-sm text-gray-400 italic">No data recorded for this competency.</p>
        )}
      </div>
    </section>
  );
}

export default function StudentPage({ params }: { params: { slug: string } }) {
  const student = getStudentBySlug(params.slug);
  if (!student) notFound();

  const s = student.student;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-mnsu-maroon hover:underline">← Overview</Link>
          <h1 className="text-2xl font-serif font-bold text-mnsu-maroon mt-1">
            {s.name ?? <span className="text-gray-400 italic">Unnamed Student</span>}
          </h1>
          <p className="text-gray-500 text-sm">{student.source_file}</p>
        </div>
        {s.portfolio_link && (
          <a
            href={s.portfolio_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm bg-mnsu-maroon text-white px-3 py-1.5 rounded hover:bg-mnsu-maroon-dark transition-colors"
          >
            Portfolio ↗
          </a>
        )}
      </div>

      {/* Parse warnings */}
      {student.parse_warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="font-semibold text-amber-800 text-sm mb-2">⚠ Parse Warnings</div>
          <ul className="list-disc list-inside space-y-1">
            {student.parse_warnings.map((w, i) => (
              <li key={i} className="text-sm text-amber-700">{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Student Info */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="font-serif font-semibold text-mnsu-maroon mb-3">Student Information</h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          {[
            ["Year", s.year],
            ["Major(s)", s.majors],
            ["Minor(s) / Certificate(s)", s.minors_certificates],
            ["Expected Graduation", s.expected_graduation],
            ["Date", s.date],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-gray-400 uppercase tracking-wide font-semibold">{label}</dt>
              <dd className="mt-0.5 text-gray-800">{value ?? <span className="text-gray-300 italic">—</span>}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Curriculum */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="font-serif font-semibold text-mnsu-maroon mb-3">Required Curriculum</h2>
        {student.required_curriculum.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No curriculum data.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {["Course", "Credits", "Planned", "Completed"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {student.required_curriculum.map((c, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-3 py-2 font-medium">{c.course ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{c.credits ?? "—"}</td>
                  <td className="px-3 py-2 text-gray-500">{c.semester_planned ?? "—"}</td>
                  <td className="px-3 py-2">
                    {c.semester_completed
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{c.semester_completed}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {student.optional_curriculum.length > 0 && (
          <>
            <h3 className="font-serif font-semibold text-mnsu-maroon mt-5 mb-3 text-sm">Honors with Distinction</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Course", "Credits", "Planned", "Completed"].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-gray-600 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {student.optional_curriculum.map((c, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-3 py-2">{c.course ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{c.credits ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{c.semester_planned ?? "—"}</td>
                    <td className="px-3 py-2 text-gray-500">{c.semester_completed ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Competencies */}
      <CompetencyBlock title="Leadership" section={student.competencies.leadership} />
      <CompetencyBlock title="Research, Scholarly, & Creative Activity" section={student.competencies.research} />
      <CompetencyBlock title="Intercultural Engagement" section={student.competencies.intercultural} />

      <p className="text-xs text-gray-400 text-right">Parsed {new Date(student.parsed_at).toLocaleString()}</p>
    </div>
  );
}
