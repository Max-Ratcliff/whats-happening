from typing import Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin.auth


# Scheme for Bearer token authentication
oauth2_scheme = HTTPBearer(auto_error=False)


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

    Raises:
        HTTPException: 401 if token is missing, invalid, or an error occurs.
                        500 for unexpected errors during token processing.
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
        # Log the detailed error server-side for debugging
        print(f"Firebase auth error during token verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer error=\"invalid_token\""},
        )
    except Exception as e:
        # Log unexpected errors server-side
        print(f"Unexpected error during token verification: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not process authentication credentials.",
        )
