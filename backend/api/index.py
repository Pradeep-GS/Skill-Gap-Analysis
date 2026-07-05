import sys
import os

# Ensure the backend root (parent of this file) is on the Python path
# so that `app` package can be found when running as a Vercel serverless function
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app  # noqa: E402
