export default async function handler(req, res) {
  const userAgent = req.headers["user-agent"] || "";
  const isBrowser = /\b(Mozilla|Chrome|Safari|Firefox|Edg)\b/i.test(userAgent);

  if (isBrowser) {
    return res.redirect(302, "https://api.mxservers.online/projectH/");
  }

  const pdfUrl =
    "https://github.com/Nico044037/mxapi/releases/download/releases/Project_H_Anmeldeformular.pdf";

  try {
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      return res.status(502).send("PDF download failed.");
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/pdf")) {
      return res.status(502).send("The URL did not return a PDF.");
    }

    const pdf = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Project_H_Anmeldeformular.pdf"'
    );

    return res.status(200).send(pdf);
  } catch {
    return res.status(502).send("PDF download failed.");
  }
}
