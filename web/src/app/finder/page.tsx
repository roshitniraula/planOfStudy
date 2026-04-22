import { getAllStudents } from "@/lib/data";
import FinderClient from "./FinderClient";

export default function FinderPage() {
  const students = getAllStudents();

  // Collect unique major strings as-is; assumes consistent formatting in the source forms
  const majors = [...new Set(
    students.flatMap((s) => (s.student.majors ? [s.student.majors] : []))
  )].sort();

  return <FinderClient students={students} majors={majors} />;
}
