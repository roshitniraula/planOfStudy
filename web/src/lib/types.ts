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

export interface StudentRecord {
  source_file: string;
  parsed_at: string;
  parse_warnings: string[];
  student: StudentInfo;
  required_curriculum: CurriculumEntry[];
  optional_curriculum: CurriculumEntry[];
  competencies: {
    leadership: CompetencySection;
    research: CompetencySection;
    intercultural: CompetencySection;
  };
  slug: string;
}
