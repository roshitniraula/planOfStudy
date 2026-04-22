"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  COMPETENCY_KEYS,
  COMPETENCY_TITLES,
  type CompetencyKey,
  type CompetencySection,
  type StudentRecord,
} from "@/lib/types";

// Program rules — update here if the honors requirement changes
const EXPERIENCE_GOAL = 8;       // total approved experiences needed
const GOAL_PER_COMPETENCY = 2;   // minimum approved per competency area

type StatusFilter = "all" | "has" | "goal" | "needs";
type SortOrder = "name" | "most" | "least";

// ── Helpers ───────────────────────────────────────────────────────────────────

function sectionApproved(section: CompetencySection): number {
  return section.experience_log.filter(
    (e) => e.progress?.toLowerCase() === "completed"
  ).length;
}

function studentTotalApproved(student: StudentRecord): number {
  return COMPETENCY_KEYS.reduce(
    (sum, key) => sum + sectionApproved(student.competencies[key]),
    0
  );
}

// Pull unique experience types for a competency across all students (for the type dropdown)
function getExpTypes(students: StudentRecord[], key: CompetencyKey): string[] {
  const types = new Set<string>();
  for (const s of students) {
    for (const e of s.competencies[key].experience_log) {
      if (e.type) types.add(e.type);
    }
  }
  return [...types].sort();
}

// ── Student match card ────────────────────────────────────────────────────────

function StudentMatchCard({
  student,
  activeCompetency,
  activeExpType,
}: {
  student: StudentRecord;
  activeCompetency: CompetencyKey | "all";
  activeExpType: string;
}) {
  const s = student.student;
  const total = studentTotalApproved(student);
  const meetsFullGoal = total >= EXPERIENCE_GOAL;

  // Move the active competency to the top so it's the first thing advisors see
  const orderedKeys =
    activeCompetency !== "all"
      ? [activeCompetency, ...COMPETENCY_KEYS.filter((k) => k !== activeCompetency)]
      : COMPETENCY_KEYS;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">

      {/* ── Card header ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/students/${student.slug}`}
            className="font-semibold text-mnsu-purple hover:underline"
          >
            {s.name ?? "Unnamed Student"}
          </Link>
          <div className="text-sm text-gray-500 mt-0.5 truncate">
            {[s.year, s.majors, s.expected_graduation ? `Expected ${s.expected_graduation}` : null]
              .filter(Boolean)
              .join(" · ")}
          </div>

          {/* Three dots — one per competency, filled green if that area meets the 2-experience minimum */}
          <div className="flex gap-1 mt-1.5">
            {COMPETENCY_KEYS.map((k) => {
              const met = sectionApproved(student.competencies[k]) >= GOAL_PER_COMPETENCY;
              return (
                <span
                  key={k}
                  title={`${COMPETENCY_TITLES[k]}: ${met ? "goal met (2+)" : "needs more"}`}
                  className={`w-2 h-2 rounded-full ${met ? "bg-green-400" : "bg-gray-200"}`}
                />
              );
            })}
          </div>
        </div>

        {/* X / 8 goal counter — turns green when the student has met the full goal */}
        <div className="text-right shrink-0">
          <div className="text-xl font-bold leading-none">
            <span className={meetsFullGoal ? "text-green-600" : "text-mnsu-purple"}>
              {total}
            </span>
            <span className="text-gray-300 font-normal text-base">/{EXPERIENCE_GOAL}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">approved</div>
        </div>
      </div>

      {/* ── Competency sections ── */}
      <div className="space-y-2">
        {orderedKeys.map((key) => {
          const section = student.competencies[key];
          const approved = sectionApproved(section);
          const meetsCompGoal = approved >= GOAL_PER_COMPETENCY;
          const isActive = activeCompetency === key;

          return (
            <div
              key={key}
              className={`rounded-md p-3 ${
                isActive
                  ? "bg-mnsu-purple/5 border border-mnsu-purple/20"
                  : "bg-gray-50"
              }`}
            >
              {/* Section header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    isActive ? "text-mnsu-purple" : "text-gray-500"
                  }`}
                >
                  {COMPETENCY_TITLES[key]}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    meetsCompGoal
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {approved}/{GOAL_PER_COMPETENCY}
                </span>
              </div>

              {/* Experience entries — always show all; dim non-matching when a type filter is active */}
              {section.experience_log.length > 0 ? (
                <ul className="space-y-1">
                  {section.experience_log.map((e, i) => {
                    const isTypeMatch =
                      isActive && activeExpType !== "all" && e.type === activeExpType;
                    const isDimmed =
                      isActive && activeExpType !== "all" && !isTypeMatch;
                    const isCompleted = e.progress?.toLowerCase() === "completed";
                    const isInProgress = e.progress?.toLowerCase().includes("progress");

                    return (
                      <li
                        key={i}
                        className={`flex items-center gap-2 text-sm transition-opacity ${
                          isDimmed ? "opacity-30" : ""
                        }`}
                      >
                        {/* Status dot */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isCompleted
                              ? "bg-green-500"
                              : isInProgress
                              ? "bg-blue-400"
                              : "bg-gray-300"
                          }`}
                        />
                        {/* Experience name */}
                        <span
                          className={`${
                            isCompleted ? "text-gray-800" : "text-gray-500"
                          } ${isTypeMatch ? "font-semibold" : ""}`}
                        >
                          {e.experience ?? "—"}
                        </span>
                        {/* Type tag — highlighted purple when it matches the active filter */}
                        {e.type && (
                          <span
                            className={`text-xs ml-auto shrink-0 ${
                              isTypeMatch
                                ? "text-mnsu-purple font-semibold"
                                : "text-gray-400"
                            }`}
                          >
                            {e.type}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No entries recorded</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Filter options ────────────────────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: StatusFilter;
  label: string;
  // Tooltip shown to advisors explaining what this filter does
  hint: string;
}[] = [
  { value: "all", label: "All students", hint: "Show everyone" },
  {
    value: "has",
    label: "Has experiences",
    hint: "At least 1 approved experience in the selected area",
  },
  {
    value: "goal",
    label: "Meets goal",
    hint: "2+ approved in the selected area, or 8+ total across all areas",
  },
  {
    value: "needs",
    label: "Needs experiences",
    hint: "Below halfway: fewer than 4 approved total (or fewer than 1 in selected area)",
  },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "most", label: "Most approved" },
  { value: "least", label: "Fewest approved" },
];

// ── Main client component ─────────────────────────────────────────────────────

interface Props {
  students: StudentRecord[];
  majors: string[];
}

export default function FinderClient({ students, majors }: Props) {
  const [major, setMajor] = useState("all");
  const [competencyKey, setCompetencyKey] = useState<CompetencyKey | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expType, setExpType] = useState("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("name");

  // Reset the type dropdown whenever the area changes to avoid stale selections
  function handleCompetencyChange(key: CompetencyKey | "all") {
    setCompetencyKey(key);
    setExpType("all");
  }

  function clearFilters() {
    setMajor("all");
    setCompetencyKey("all");
    setStatusFilter("all");
    setExpType("all");
    setSortOrder("name");
  }

  const hasActiveFilters =
    major !== "all" ||
    competencyKey !== "all" ||
    statusFilter !== "all" ||
    expType !== "all";

  // Types are derived from real data so the dropdown always reflects what actually exists
  const expTypes = useMemo(
    () => (competencyKey !== "all" ? getExpTypes(students, competencyKey) : []),
    [students, competencyKey]
  );

  const filteredStudents = useMemo(() => {
    let result = students.filter((student) => {
      // ── Major ──
      if (major !== "all" && student.student.majors !== major) return false;

      // ── Status ──
      // Scoped to the selected competency when one is chosen; global total otherwise
      if (statusFilter !== "all") {
        const count =
          competencyKey !== "all"
            ? sectionApproved(student.competencies[competencyKey])
            : studentTotalApproved(student);

        // "Meets goal" threshold shifts depending on whether we're looking at one area or all
        const goalThreshold =
          competencyKey !== "all" ? GOAL_PER_COMPETENCY : EXPERIENCE_GOAL;

        // "Needs experiences" = below the halfway mark, not just zero
        const needsThreshold = goalThreshold / 2;

        if (statusFilter === "needs" && count >= needsThreshold) return false;
        if (statusFilter === "has" && count === 0) return false;
        if (statusFilter === "goal" && count < goalThreshold) return false;
      }

      // ── Experience type ──
      // Only active when a specific area is selected; keeps at least one matching entry visible
      if (competencyKey !== "all" && expType !== "all") {
        const hasType = student.competencies[competencyKey].experience_log.some(
          (e) => e.type === expType
        );
        if (!hasType) return false;
      }

      return true;
    });

    // ── Sort ──
    result = [...result].sort((a, b) => {
      if (sortOrder === "name") {
        return (a.student.name ?? "").localeCompare(b.student.name ?? "");
      }
      const diff = studentTotalApproved(a) - studentTotalApproved(b);
      return sortOrder === "most" ? -diff : diff;
    });

    return result;
  }, [students, major, competencyKey, statusFilter, expType, sortOrder]);

  // One-line summary of every active filter — helps advisors keep track of what they set
  const filterSummary = [
    major !== "all" ? major : null,
    competencyKey !== "all" ? COMPETENCY_TITLES[competencyKey] : null,
    expType !== "all" ? expType : null,
    statusFilter !== "all"
      ? STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-mnsu-purple">Find Students</h1>
        <p className="text-gray-500 text-sm mt-1">
          Filter by major and experience area to identify students for employer connections or advisor outreach.
          Students need <span className="font-medium text-gray-700">{EXPERIENCE_GOAL} approved experiences</span> total
          ({GOAL_PER_COMPETENCY}+ per area).
        </p>
      </div>

      {/* ── Filter panel ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">

        {/* Row 1: dropdowns */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Major
            </label>
            <select
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="block text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-mnsu-purple"
            >
              <option value="all">All majors</option>
              {majors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Experience Area
            </label>
            <select
              value={competencyKey}
              onChange={(e) =>
                handleCompetencyChange(e.target.value as CompetencyKey | "all")
              }
              className="block text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-mnsu-purple"
            >
              <option value="all">All areas</option>
              {COMPETENCY_KEYS.map((k) => (
                <option key={k} value={k}>{COMPETENCY_TITLES[k]}</option>
              ))}
            </select>
          </div>

          {/* Experience type — only revealed when an area is chosen (progressive disclosure) */}
          {competencyKey !== "all" && expTypes.length > 0 && (
            <div className="space-y-1">
              <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">
                Experience Type
              </label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value)}
                className="block text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-mnsu-purple"
              >
                <option value="all">All types</option>
                {expTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1 ml-auto">
            <label className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">
              Sort by
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="block text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-mnsu-purple"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: status quick-picks */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide mr-1">
            Status
          </span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              title={opt.hint}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? "bg-mnsu-purple text-white border-mnsu-purple"
                  : "bg-white text-gray-600 border-gray-200 hover:border-mnsu-purple hover:text-mnsu-purple"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-700 ml-1 underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active filter summary */}
        {filterSummary && (
          <p className="text-xs text-mnsu-purple bg-mnsu-purple/5 rounded px-3 py-1.5">
            Showing: <span className="font-semibold">{filterSummary}</span>
          </p>
        )}
      </div>

      {/* ── Results ── */}
      <div>
        <p className="text-sm text-gray-500 mb-3">
          {filteredStudents.length === 0
            ? "No students match the selected filters — try broadening your search."
            : `${filteredStudents.length} student${filteredStudents.length !== 1 ? "s" : ""} match${filteredStudents.length === 1 ? "es" : ""}`}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => (
            <StudentMatchCard
              key={student.slug}
              student={student}
              activeCompetency={competencyKey}
              activeExpType={expType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
