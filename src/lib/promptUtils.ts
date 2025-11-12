/**
 * Generates a dashboard title from a user prompt
 */
export function generateDashboardTitle(prompt: string): string {
  // Extract subjects mentioned
  const subjects: string[] = [];
  if (prompt.match(/\bmath\b/i)) subjects.push("Math");
  if (prompt.match(/\benglish\b/i)) subjects.push("English");
  if (prompt.match(/\bscience\b/i)) subjects.push("Science");
  if (prompt.match(/\bhistory\b/i)) subjects.push("History");

  // Format subjects list
  let subjectText = "";
  if (subjects.length === 0) {
    subjectText = "Students";
  } else if (subjects.length === 1) {
    subjectText = subjects[0];
  } else if (subjects.length === 2) {
    subjectText = subjects.join(" and ");
  } else {
    subjectText = subjects.slice(0, -1).join(", ") + ", and " + subjects[subjects.length - 1];
  }

  // Extract the main topic/action from the prompt
  let topic = "";
  
  if (prompt.match(/below\s+(\d+)%/i)) {
    const match = prompt.match(/below\s+(\d+)%/i);
    topic = `Students Below ${match![1]}%`;
  } else if (prompt.match(/breakdown.*by\s+homeroom/i)) {
    topic = "Breakdown by Homeroom";
  } else if (prompt.match(/average\s+score/i)) {
    topic = "Average Score Comparison";
  } else if (prompt.match(/lowest\s+mastery/i)) {
    topic = "Lowest Mastery Rates";
  } else if (prompt.match(/standards.*review/i)) {
    topic = "Standards Needing Review";
  } else if (prompt.match(/participation\s+trends/i)) {
    topic = "Participation Trends";
  } else if (prompt.match(/engagement\s+support/i)) {
    topic = "Students Needing Engagement Support";
  } else {
    // Default fallback - try to extract key words
    topic = "Analysis";
  }

  // Combine subject and topic
  if (topic.startsWith("Students Below")) {
    return subjects.length > 0 ? `${topic} in ${subjectText}` : topic;
  } else if (topic === "Breakdown by Homeroom") {
    return subjects.length > 0 ? `${subjectText} Scores ${topic}` : `Scores ${topic}`;
  } else if (topic === "Average Score Comparison") {
    return subjects.length > 0 ? `${subjectText} ${topic}` : topic;
  } else {
    return subjects.length > 0 ? `${subjectText} ${topic}` : topic;
  }
}
