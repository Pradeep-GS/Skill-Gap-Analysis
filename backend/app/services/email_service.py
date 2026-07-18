import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USERNAME)
HIGH_MATCH_THRESHOLD = float(os.getenv("HIGH_MATCH_THRESHOLD", "90"))



def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Sends a single email. Returns True on success, False on failure (never raises)."""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"[email_service] SMTP not configured — skipping email to {to_email}.")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        return True
    except Exception as exc:
        print(f"[email_service] Failed to send email to {to_email}: {exc}")
        return False


def notify_high_match(job: dict, candidate: dict, analysis: dict) -> None:
    """
    Sends a notification email to both the HR who posted the job and the
    candidate, when the match score exceeds HIGH_MATCH_THRESHOLD.
    Failures are logged but never raised, so they don't break the analysis flow.
    """
    score = analysis.get("match_score", 0)
    if score < HIGH_MATCH_THRESHOLD:
        return

    role_name = job.get("role_name", "the role")
    company_name = job.get("company_name", "")
    candidate_name = candidate.get("name", "Candidate")
    candidate_email = candidate.get("email")
    hr_email = job.get("hr_email")
    matched = ", ".join(analysis.get("matched_skills", [])[:10]) or "N/A"

    subject = f"🎯 Strong Match Found: {candidate_name} for {role_name} ({score}%)"

    if hr_email:
        hr_body = f"""
        <div style="font-family: Arial, sans-serif; color: #2C3947;">
          <h2 style="color:#00C68D;">Strong Candidate Match — {score}%</h2>
          <p><strong>{candidate_name}</strong> ({candidate_email}) scored <strong>{score}%</strong>
          against your job posting for <strong>{role_name}</strong>{f' at {company_name}' if company_name else ''}.</p>
          <p><strong>Matched Skills:</strong> {matched}</p>
          <p>Log in to the Skill Gap Analysis Agent dashboard to view the full report.</p>
        </div>
        """
        _send_email(hr_email, subject, hr_body)

    if candidate_email:
        candidate_body = f"""
        <div style="font-family: Arial, sans-serif; color: #2C3947;">
          <h2 style="color:#00C68D;">Great news, {candidate_name}!</h2>
          <p>You scored <strong>{score}%</strong> on the skill match for
          <strong>{role_name}</strong>{f' at {company_name}' if company_name else ''}.</p>
          <p><strong>Matched Skills:</strong> {matched}</p>
          <p>This is a strong match — the recruiter has also been notified. Good luck!</p>
        </div>
        """
        _send_email(candidate_email, subject, candidate_body)
