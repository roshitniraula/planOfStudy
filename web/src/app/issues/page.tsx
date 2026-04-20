import { getAllStudents } from "@/lib/data";
import Link from "next/link";

export default function IssuesPage() {
  const students = getAllStudents();
  const withWarnings = students.filter((s) => s.parse_warnings.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-mnsu-maroon">Parse Issues</h1>
        <p className="text-gray-500 text-sm mt-1">
          {withWarnings.length === 0
            ? "All files parsed cleanly — no issues to report."
            : `${withWarnings.length} file${withWarnings.length !== 1 ? "s" : ""} need manual review.`}
        </p>
      </div>

      {withWarnings.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">✓</div>
          <p className="font-semibold text-green-800">All clean!</p>
          <p className="text-sm text-green-600 mt-1">No parse warnings found across all student files.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withWarnings.map((s) => (
            <div key={s.slug} className="bg-white rounded-lg border border-amber-200 shadow-sm overflow-hidden">
              <div className="bg-amber-50 px-5 py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-900">{s.student.name ?? "Unnamed student"}</span>
                  <span className="text-amber-600 text-xs ml-2 font-mono">{s.source_file}</span>
                </div>
                <Link
                  href={`/students/${s.slug}`}
                  className="text-xs text-mnsu-maroon hover:underline font-medium"
                >
                  View student →
                </Link>
              </div>
              <ul className="px-5 py-3 space-y-1">
                {s.parse_warnings.map((w, i) => (
                  <li key={i} className="text-sm text-amber-800 flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
