from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from google.cloud.firestore_v1.client import Client  # Added for type hinting

# Corrected relative imports
from api.deps import (  # Grouped for clarity
    AuthenticatedUser,
    get_current_user,
    get_firestore_db
)
from models.clubs import ClubResponse
from CRUD.users import get_user_joined_club_details  # Added import for CRUD function

# Create an APIRouter instance for these user-specific endpoints
router = APIRouter()


# This is the existing /me endpoint for basic user info
@router.get(
    "/me",
    response_model=Dict[str, str],
    summary="Get Current Authenticated User (Basic Info)",
    description="Example endpoint to demonstrate an authenticated route. "
                "Returns basic info about the currently authenticated user."
)
async def read_users_me(  # Renamed for clarity if this is in users.py
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    An example protected route that uses the get_current_user dependency.
    """
    if not current_user or not current_user.uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return {
        "message": "Authenticated successfully via /users/me!",
        "uid": current_user.uid,
        "email": current_user.email or "N/A",
    }


# This is the new endpoint to get joined clubs
@router.get(
    "/me/joined-clubs",
    response_model=List[ClubResponse],  # Uses your ClubResponse model
    summary="Get Clubs Joined by Current User",
    description="Retrieves a list of clubs that the currently authenticated user has joined."
)
async def get_my_joined_clubs(
    current_user: AuthenticatedUser = Depends(get_current_user),
    db_client: Client = Depends(get_firestore_db)  # Depends on get_firestore_db from deps.py
):
    """
    Endpoint to fetch all clubs joined by the authenticated user.
    """
    if not current_user or not current_user.uid:
        # This check is a safeguard; get_current_user should ideally handle unauthorized access.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. User UID not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        # Calls the CRUD function to get the list of joined club details
        joined_clubs_list = await get_user_joined_club_details(
            db=db_client, user_id=current_user.uid
        )
        return joined_clubs_list
    except HTTPException:
        # Re-raise HTTPExceptions if they were raised by dependencies or CRUD operations
        raise
    except Exception as e:
        # Log the detailed error for server-side debugging
        print(f"ERROR: Could not retrieve joined clubs for user {current_user.uid}: {e}")
        # Return a generic error to the client
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching your joined clubs. Please try again later.",
        )
