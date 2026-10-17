import hashlib
import hmac
import base64
import json
import re
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings

def hash_password(password: str) -> str:
    salt = settings.SECRET_KEY[:16]
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hmac.compare_digest(hash_password(plain_password), hashed_password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire.timestamp()})
    
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(to_encode, default=str).encode()).decode().rstrip("=")
    
    signature_base = f"{header_b64}.{payload_b64}"
    signature = hmac.new(
        settings.SECRET_KEY.encode(),
        signature_base.encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        # Verify signature
        signature_base = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode(),
            signature_base.encode(),
            hashlib.sha256
        ).digest()
        
        # Add padding back if necessary
        sig_padded = sig_b64 + "=" * (-len(sig_b64) % 4)
        if not hmac.compare_digest(base64.urlsafe_b64decode(sig_padded), expected_sig):
            return None
        
        payload_padded = payload_b64 + "=" * (-len(payload_b64) % 4)
        payload = json.loads(base64.urlsafe_b64decode(payload_padded).decode())
        
        if "exp" in payload and datetime.utcnow().timestamp() > payload["exp"]:
            return None
        return payload
    except Exception:
        return None

# Prompt Injection Defense Filter for untrusted resume & repository text
SUSPICIOUS_PROMPT_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"system\s*:\s*you\s+are",
    r"output\s+only\s+(the\s+following|json|100)",
    r"rate\s+this\s+candidate\s+(100%|as\s+expert)",
    r"override\s+(all\s+)?evaluation\s+rules",
    r"<script.*?>.*?</script>",
    r"eval\s*\(",
    r"exec\s*\("
]

def sanitize_untrusted_text(text: str) -> str:
    """Sanitizes text extracted from resumes, READMEs, or repositories to prevent prompt injection."""
    if not text:
        return ""
    sanitized = text
    for pattern in SUSPICIOUS_PROMPT_PATTERNS:
        sanitized = re.sub(pattern, "[SANITIZED_PROMPT_INJECTION_ATTEMPT]", sanitized, flags=re.IGNORECASE)
    # Strip dangerous HTML and limit excessive repetitions
    sanitized = re.sub(r'<[^>]*>', ' ', sanitized)
    return sanitized.strip()
