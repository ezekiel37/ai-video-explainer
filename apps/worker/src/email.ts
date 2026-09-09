const apiKey = process.env.BREVO_API_KEY;
const sender = process.env.BREVO_SENDER_EMAIL;

/**
 * Email the user that their render is ready, via Brevo's transactional API.
 * No-op when Brevo isn't configured (dev/scaffolding).
 */
export async function sendRenderCompleteEmail(to: string, outputUrl: string): Promise<void> {
  if (!apiKey || !sender) return;

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
      accept: "application/json"
    },
    body: JSON.stringify({
      sender: { email: sender, name: "ExplainMotion" },
      to: [{ email: to }],
      subject: "Your explainer video is ready",
      htmlContent: `<p>Your explainer video has finished rendering.</p><p><a href="${outputUrl}">View or download it</a>.</p>`
    })
  });

  if (!response.ok) {
    console.error("Brevo email failed:", response.status, await response.text());
  }
}
