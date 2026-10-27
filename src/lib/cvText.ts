// Plain text from an uploaded CV. Parsers load on demand so they don't weigh on app start.
export async function extractCvText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  let text: string;
  if (name.endsWith(".pdf") || file.type === "application/pdf") {
    // Legacy build: includes polyfills for older WebKitGTK / WKWebView versions.
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = (await import("pdfjs-dist/legacy/build/pdf.worker.min.mjs?url")).default;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const content = await (await pdf.getPage(i)).getTextContent();
      // hasEOL marks line ends; without it items on one line run together.
      pages.push(content.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join(""));
    }
    text = pages.join("\n");
  } else if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    text = (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
  } else if (name.endsWith(".txt") || name.endsWith(".md") || file.type.startsWith("text/")) {
    text = await file.text();
  } else {
    throw new Error("Use a PDF, Word (.docx) or text file.");
  }
  text = text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 50) throw new Error("No readable text found. If this is a scanned PDF, export it with selectable text or paste it into a .txt file.");
  return text;
}
