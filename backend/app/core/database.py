import json
import logging
import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger("careerlens.database")

class LocalCollection:
    """In-memory and file-backed collection replicating MongoDB asynchronous query interface."""
    def __init__(self, name: str, db_ref: "LocalDatabase"):
        self.name = name
        self.db = db_ref
        self.docs: List[Dict[str, Any]] = []

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, q) for q in v):
                    return False
                continue
            if isinstance(v, dict):
                # nested operators like $in
                if "$in" in v and doc.get(k) not in v["$in"]:
                    return False
                if "$gt" in v and not (doc.get(k) is not None and doc.get(k) > v["$gt"]):
                    return False
                if "$gte" in v and not (doc.get(k) is not None and doc.get(k) >= v["$gte"]):
                    return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        if "created_at" not in doc_copy:
            doc_copy["created_at"] = datetime.utcnow().isoformat()
        self.docs.append(doc_copy)
        self.db.persist()
        return type("InsertResult", (), {"inserted_id": doc_copy["_id"]})()

    async def find_one(self, query: Dict[str, Any], *args, **kwargs) -> Optional[Dict[str, Any]]:
        matches = [d for d in self.docs if self._matches(d, query)]
        sort_arg = kwargs.get("sort")
        if sort_arg and isinstance(sort_arg, list) and len(sort_arg) > 0:
            sort_key, direction = sort_arg[0]
            matches.sort(key=lambda x: str(x.get(sort_key, "")), reverse=(direction == -1))
            return dict(matches[0]) if matches else None
        if matches:
            return dict(matches[-1])
        return None

    def find(self, query: Optional[Dict[str, Any]] = None):
        q = query or {}
        matches = [dict(d) for d in self.docs if self._matches(d, q)]
        class Cursor:
            def __init__(self, items):
                self.items = items
            def sort(self, key, direction=1):
                self.items.sort(key=lambda x: x.get(key, ""), reverse=(direction == -1))
                return self
            def limit(self, count):
                self.items = self.items[:count]
                return self
            async def to_list(self, length=None):
                if length:
                    return self.items[:length]
                return self.items
            def __aiter__(self):
                self._iter = iter(self.items)
                return self
            async def __anext__(self):
                try:
                    return next(self._iter)
                except StopIteration:
                    raise StopAsyncIteration
        return Cursor(matches)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        set_vals = update.get("$set", update)
        for i, d in enumerate(self.docs):
            if self._matches(d, query):
                d.update(set_vals)
                d["updated_at"] = datetime.utcnow().isoformat()
                self.db.persist()
                return type("UpdateResult", (), {"matched_count": 1, "modified_count": 1})()
        if upsert:
            new_doc = dict(query)
            new_doc.update(set_vals)
            await self.insert_one(new_doc)
            return type("UpdateResult", (), {"matched_count": 0, "modified_count": 1, "upserted_id": new_doc.get("_id")})()
        return type("UpdateResult", (), {"matched_count": 0, "modified_count": 0})()

    async def delete_one(self, query: Dict[str, Any]):
        for i, d in enumerate(self.docs):
            if self._matches(d, query):
                del self.docs[i]
                self.db.persist()
                return type("DeleteResult", (), {"deleted_count": 1})()
        return type("DeleteResult", (), {"deleted_count": 0})()

    async def delete_many(self, query: Dict[str, Any]):
        initial_len = len(self.docs)
        self.docs = [d for d in self.docs if not self._matches(d, query)]
        deleted = initial_len - len(self.docs)
        if deleted > 0:
            self.db.persist()
        return type("DeleteResult", (), {"deleted_count": deleted})()

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        q = query or {}
        return sum(1 for d in self.docs if self._matches(d, q))


class LocalDatabase:
    """Lightweight document database for local execution & fallback."""
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.collections: Dict[str, LocalCollection] = {}
        self.load()

    def get_collection(self, name: str) -> LocalCollection:
        if name not in self.collections:
            self.collections[name] = LocalCollection(name, self)
        return self.collections[name]

    def __getitem__(self, name: str) -> LocalCollection:
        return self.get_collection(name)

    def load(self):
        if self.file_path.exists():
            try:
                with open(self.file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for col_name, docs in data.items():
                        col = self.get_collection(col_name)
                        col.docs = docs
                logger.info(f"Loaded local database from {self.file_path}")
            except Exception as e:
                logger.warning(f"Could not load local database: {e}")

    def persist(self):
        try:
            data = {col_name: col.docs for col_name, col in self.collections.items()}
            self.file_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error persisting local db: {e}")


class DatabaseManager:
    """Manages MongoDB connection with transparent local document store fallback."""
    def __init__(self):
        self.client = None
        self.db = None
        self.is_mongodb_connected = False
        self.local_db = LocalDatabase(settings.LOCAL_DB_PATH)

    async def connect(self):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            import asyncio

            client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=1500
            )
            # Test connection
            await asyncio.wait_for(client.admin.command('ping'), timeout=1.5)
            self.client = client
            self.db = client[settings.DATABASE_NAME]
            self.is_mongodb_connected = True
            logger.info(f"Connected to MongoDB Atlas / Server at {settings.MONGODB_URI}")
        except Exception as e:
            self.is_mongodb_connected = False
            self.db = self.local_db
            logger.warning(f"MongoDB not available ({e}). Using robust Local Embedded Store ({settings.LOCAL_DB_PATH}).")

    def get_collection(self, name: str):
        if self.is_mongodb_connected and self.db is not None:
            return self.db[name]
        return self.local_db.get_collection(name)

    async def close(self):
        if self.client:
            self.client.close()

db_manager = DatabaseManager()

def get_db():
    return db_manager
