import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "skill_gap_agent")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def validate(self):
        missing = []
        if not self.MONGO_URI:
            missing.append("MONGO_URI")
        if not self.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if missing:
            print(
                f"[WARNING] Missing environment variables: {', '.join(missing)}. "
                "Set them in your .env file before running in production."
            )


settings = Settings()
settings.validate()
