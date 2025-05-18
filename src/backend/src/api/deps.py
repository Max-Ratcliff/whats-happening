# File: backend/src/api/deps.py
from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin.auth
from google.cloud.firestore_v1.async_client import AsyncClient  # Ensure this is imported

# Using "global" style import as per your preference for project structure
# This imports 'db' from backend/src/services/firebase_service.py
from services import firebase_service  # Ensure this path is correct for your setup

# Scheme for Bearer token authentication
oauth2_scheme = HTTPBearer(auto_error=False)  # auto_error=False allows the route to run if no token is provided, useful for optional auth


class AuthenticatedUser:
    """Represents an authenticated user's data from ID token."""
    def __init__(
        self,
        uid: str,
        email: Optional[str] = None,
        name: Optional[str] = None,
        claims: Optional[Dict[str, Any]] = None
    ):
        self.uid = uid
        self.email = email
        self.name = name
        self.claims = claims if claims is not None else {}


async def get_current_user(
    token_cred: Optional[HTTPAuthorizationCredentials] = Depends(oauth2_scheme)
) -> AuthenticatedUser:
    """
    Dependency to verify Firebase ID token and return authenticated user data.
    """
    if token_cred is None or token_cred.scheme != "Bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated or Bearer token missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        id_token = token_cred.credentials
        decoded_token = firebase_admin.auth.verify_id_token(id_token)
        return AuthenticatedUser(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email"),
            name=decoded_token.get("name"),
            claims=decoded_token
        )
    except firebase_admin.auth.FirebaseAuthError as e:
        print(f"Firebase auth error during token verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
        )
    except Exception as e:
        print(f"Unexpected error during token verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process authentication credentials.",
        )


async def get_firestore_db() -> AsyncClient:  # <<< This is the missing function
    """
    Dependency to provide the Firestore client.
    Checks if the client was initialized.
    """
    # 'db' should be an initialized Firestore client in firebase_service.py
    db_client = firebase_service.db
    if db_client is None:
        print("CRITICAL: Firestore client (firebase_service.db) is None. Firestore might not have initialized correctly.")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Firestore service is not available. Check backend server logs for initialization errors.",
        )
    return db_client
