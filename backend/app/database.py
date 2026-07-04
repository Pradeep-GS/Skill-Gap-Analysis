from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ConfigurationError
from app.config import settings

_client = None
_db = None


def get_database():
    """
    Returns a MongoDB database instance.
    Lazily initializes the connection and raises a clear error if it fails.
    """
    global _client, _db

    if _db is not None:
        return _db

    if not settings.MONGO_URI:
        raise RuntimeError(
            "MONGO_URI is not set. Please configure it in your .env file."
        )

    try:
        _client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)
        # Trigger a connection check
        _client.admin.command("ping")
        _db = _client[settings.DATABASE_NAME]
        return _db
    except (ConnectionFailure, ConfigurationError) as exc:
        raise RuntimeError(f"Failed to connect to MongoDB: {exc}") from exc


def get_collection(collection_name: str):
    db = get_database()
    return db[collection_name]


def close_connection():
    global _client
    if _client is not None:
        _client.close()
        _client = None
