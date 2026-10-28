// api/projectH.js

export default async function handler(req, res) {
  const userAgent = req.headers["user-agent"] || "";
  const isBrowser = /\b(Mozilla|Chrome|Safari|Firefox|Edg)\b/i.test(userAgent);

  // Browser: redirect to the animated download page
  if (isBrowser) {
    return res.redirect(
      302,
      "https://api.mxservers.online/projectH/download.html"
    );
  }

  // curl: retrieve the PDF from GitHub
  const pdfUrl =
    "https://github.com/Nico044037/mxapi/releases/download/releases/Project_H_Anmeldeformular.pdf";

  try {
    const response = await fetch(pdfUrl, {
      redirect: "follow",
    });

    if (!response.ok) {
      return res
        .status(502)
        .send(`Failed to retrieve PDF. GitHub returned HTTP ${response.status}.`);
    }

    const pdf = Buffer.from(await response.arrayBuffer());

    // Verify the actual file contents instead of trusting Content-Type.
    if (pdf.length < 5 || pdf.subarray(0, 5).toString() !== "%PDF-") {
      return res
        .status(502)
        .send("GitHub did not return a PDF. Check the release asset URL.");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Project_H_Anmeldeformular.pdf"'
    );
    res.setHeader("Content-Length", pdf.length);
    res.setHeader("Cache-Control", "no-store");

    return res.status(200).send(pdf);
  } catch (error) {
    console.error("Project H PDF download failed:", error);

    return res.status(502).send("Failed to retrieve the PDF.");
  }
}
