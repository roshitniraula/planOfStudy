import fs from "fs";
import path from "path";
import type { StudentRecord } from "./types";

const DATA_DIR = path.resolve(process.cwd(), "../data");

export function getAllStudents(): StudentRecord[] {
  if (!fs.existsSync(DATA_DIR)) return SAMPLE_DATA;

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== ".gitkeep");
  if (files.length === 0) return SAMPLE_DATA;

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    const record = JSON.parse(raw) as Omit<StudentRecord, "slug">;
    const slug = file.replace(/\.json$/, "");
    return { ...record, slug };
  });
}

export function getStudentBySlug(slug: string): StudentRecord | undefined {
  return getAllStudents().find((s) => s.slug === slug);
}

// Sample data used when data/ is empty, so the UI renders correctly during dev/build
export const SAMPLE_DATA: StudentRecord[] = [
  {
    source_file: "sample-student.docx",
    parsed_at: "2026-04-20T00:00:00Z",
    parse_warnings: [],
    slug: "sample-student",
    student: {
      name: "Sample Student",
      year: "Junior",
      date: "April 2026",
      majors: "Biology",
      minors_certificates: "Pre-Health Certificate",
      expected_graduation: "Spring 2027",
      portfolio_link: null,
    },
    required_curriculum: [
      { course: "HONR 201: Introduction to Honors", credits: "1", semester_planned: null, semester_completed: "Fall 2024" },
      { course: "HONR 375: Honors Colloquium", credits: "1", semester_planned: "Spring 2026", semester_completed: null },
      { course: "HONR 475: Honors Thesis", credits: "1", semester_planned: "Fall 2026", semester_completed: null },
    ],
    optional_curriculum: [],
    competencies: {
      leadership: {
        experience_log: [
          { experience: "MavPass Mentor", type: "Development", progress: "Completed" },
          { experience: "Student Senate", type: "Leadership", progress: "In Progress" },
        ],
        highlighted: [
          {
            experience: "MavPass Mentor",
            type: "Development",
            progress_stages_completed: 2,
            progress_stages: [true, true, false, false],
            reflection_topics_checked: [true, false],
          },
        ],
        advisor_notes: "Great engagement with the leadership competency. Consider expanding your reflection.",
      },
      research: {
        experience_log: [
          { experience: "Biology Lab Research", type: "Research", progress: "In Progress" },
        ],
        highlighted: [
          {
            experience: "Biology Lab Research",
            type: "Research",
            progress_stages_completed: 1,
            progress_stages: [true, false, false, false],
            reflection_topics_checked: [],
          },
        ],
        advisor_notes: null,
      },
      intercultural: {
        experience_log: [
          { experience: "Study Abroad — Spain", type: "Global", progress: "Planned" },
        ],
        highlighted: [],
        advisor_notes: null,
      },
    },
  },
];
