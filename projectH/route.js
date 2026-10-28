export async function GET() {
  const pdfUrl =
    "https://github.com/Nico044037/mxapi/releases/download/releases/Project_H_Anmeldeformular.pdf";

  const response = await fetch(pdfUrl);

  if (!response.ok) {
    return new Response("Failed to retrieve PDF", { status: 502 });
  }

  const pdf = await response.arrayBuffer();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        'attachment; filename="Project_H_Anmeldeformular.pdf"',
      "Cache-Control": "no-store",
    },
  });
}
