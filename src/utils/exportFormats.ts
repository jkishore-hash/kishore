import { ExamPackage } from '../types/exam';

export function formatAsMarkdown(exam: ExamPackage): string {
  const { metadata, questions } = exam;
  let md = `# ${metadata.title}\n\n`;
  md += `**Subject:** ${metadata.subject} | **Topic:** ${metadata.topic} | **Difficulty:** ${metadata.difficulty}\n`;
  md += `**Target Standard:** ${metadata.targetAudience || 'Standard'} | **Questions:** ${questions.length}\n\n`;
  md += `---\n\n`;

  // Questions section
  md += `## Exam Questions\n\n`;
  questions.forEach((q, idx) => {
    md += `### Question ${idx + 1}\n\n`;
    md += `${q.question}\n\n`;
    q.options.forEach((opt) => {
      md += `- **(${opt.label})** ${opt.text}\n`;
    });
    md += `\n`;
  });

  md += `---\n\n`;
  // Answer key section
  md += `## Answer Key & Explanations\n\n`;
  questions.forEach((q, idx) => {
    md += `### Question ${idx + 1}: Correct Answer (${q.correctAnswer})\n\n`;
    md += `**Concept:** ${q.conceptTag || 'General'}\n\n`;
    md += `**Explanation:** ${q.explanation}\n\n`;
    if (q.distractorExplanation) {
      md += `**Distractor Analysis:** ${q.distractorExplanation}\n\n`;
    }
    md += `\n`;
  });

  return md;
}

export function formatAsPlainText(exam: ExamPackage): string {
  const { metadata, questions } = exam;
  let text = `EXAM: ${metadata.title.toUpperCase()}\n`;
  text += `Subject: ${metadata.subject} | Topic: ${metadata.topic} | Difficulty: ${metadata.difficulty}\n`;
  text += `======================================================================\n\n`;

  questions.forEach((q, idx) => {
    text += `${idx + 1}. ${q.question}\n`;
    q.options.forEach((opt) => {
      text += `   [${opt.label}] ${opt.text}\n`;
    });
    text += `\n`;
  });

  text += `======================================================================\n`;
  text += `ANSWER KEY & RATIONALE\n`;
  text += `======================================================================\n\n`;

  questions.forEach((q, idx) => {
    text += `Question ${idx + 1}: Option [${q.correctAnswer}]\n`;
    text += `Concept: ${q.conceptTag || 'General'}\n`;
    text += `Rationale: ${q.explanation}\n`;
    if (q.distractorExplanation) {
      text += `Why distractors are incorrect: ${q.distractorExplanation}\n`;
    }
    text += `----------------------------------------------------------------------\n\n`;
  });

  return text;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
