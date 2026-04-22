export interface StudentInfo {
  name: string | null;
  year: string | null;
  date: string | null;
  majors: string | null;
  minors_certificates: string | null;
  expected_graduation: string | null;
  portfolio_link: string | null;
}

export interface CurriculumEntry {
  course: string | null;
  credits: string | null;
  semester_planned: string | null;
  semester_completed: string | null;
}

export interface ExperienceLogEntry {
  experience: string | null;
  type: string | null;
  progress: string | null;
}

export interface HighlightedEntry {
  experience: string | null;
  type: string | null;
  progress_stages_completed: number;
  progress_stages: [boolean, boolean, boolean, boolean];
  reflection_topics_checked: boolean[];
}

export interface CompetencySection {
  experience_log: ExperienceLogEntry[];
  highlighted: HighlightedEntry[];
  advisor_notes: string | null;
}

// Ordered tuple of all three competency keys — iterate this instead of repeating each key manually
export type CompetencyKey = "leadership" | "research" | "intercultural";
export const COMPETENCY_KEYS: CompetencyKey[] = ["leadership", "research", "intercultural"];

// Full display titles used in section headings and the detail page
export const COMPETENCY_TITLES: Record<CompetencyKey, string> = {
  leadership: "Leadership",
  research: "Research, Scholarly, & Creative Activity",
  intercultural: "Intercultural Engagement",
};

export interface StudentRecord {
  source_file: string;
  parsed_at: string;
  parse_warnings: string[];
  student: StudentInfo;
  required_curriculum: CurriculumEntry[];
  optional_curriculum: CurriculumEntry[];
  competencies: Record<CompetencyKey, CompetencySection>;
  slug: string;
}
