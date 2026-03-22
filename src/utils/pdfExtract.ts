import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export const getPdfPageCount = async (file: File): Promise<number> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return pdf.numPages;
};

// Groups text items by their y-coordinate to reconstruct actual lines.
// PDF items are individual glyphs/words with position data — joining with spaces
// loses the line structure needed for ALL-CAPS character name detection.
const extractPageLines = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNum: number
): Promise<string[]> => {
  const page = await pdf.getPage(pageNum);
  const content = await page.getTextContent();

  // transform[5] is the y-coordinate (PDF origin is bottom-left, y increases up)
  const lineMap = new Map<number, string[]>();
  for (const item of content.items) {
    if (!("str" in item) || !item.str.trim()) continue;
    const y = Math.round(item.transform[5]);
    if (!lineMap.has(y)) lineMap.set(y, []);
    lineMap.get(y)!.push(item.str);
  }

  // Sort descending by y → top of page first
  return Array.from(lineMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([, parts]) => parts.join("").trim())
    .filter(Boolean);
};

export const extractTextFromPdf = async (
  file: File,
  startPage = 1,
  endPage?: number
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const lastPage = Math.min(endPage ?? pdf.numPages, pdf.numPages);

  const allLines: string[] = [];
  for (let i = startPage; i <= lastPage; i++) {
    const lines = await extractPageLines(pdf, i);
    allLines.push(...lines);
  }

  return allLines.join("\n");
};
