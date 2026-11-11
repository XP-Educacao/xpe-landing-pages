import rawCourse from './course.json';
import { type CourseParseResult, parseCourse } from './course.schema.ts';

/**
 * The course is bundled with the app (static hosting), so it is parsed once at startup.
 * The build already rejects invalid content; this runtime check protects local development
 * and any future content source (e.g. a CMS) with the same friendly error screen.
 */
export function loadCourse(): CourseParseResult {
  return parseCourse(rawCourse);
}
