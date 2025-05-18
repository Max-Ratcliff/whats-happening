import asyncio  # Still needed for asyncio.gather
from typing import List, Optional, Dict, Any

# Import AsyncClient for asynchronous operations
from google.cloud.firestore_v1.async_client import AsyncClient

# Assuming 'models' is a top-level package relative to where Python executes
# or backend/src is in PYTHONPATH.
# If using relative imports from within 'src' package, it would be:
# from ..models.clubs import ClubResponse
from models.clubs import ClubResponse


async def get_user_firestore_document(
    db: AsyncClient, user_id: str  # Type hint db as AsyncClient
) -> Optional[Dict[str, Any]]:
    """Fetches a user document from Firestore by user ID using AsyncClient."""
    if not user_id:
        return None
    user_doc_ref = db.collection("users").document(user_id)
    # Directly await the .get() method from AsyncDocumentReference
    user_doc = await user_doc_ref.get()
    if user_doc.exists:
        return user_doc.to_dict()
    print(f"User document not found in Firestore for UID: {user_id}")
    return None


async def get_club_firestore_document(
    db: AsyncClient, club_id: str  # Type hint db as AsyncClient
) -> Optional[Dict[str, Any]]:
    """
    Fetches a single club document from Firestore by club ID using AsyncClient.
    The dictionary returned will be used to instantiate ClubResponse.
    It ensures 'clubId' (from the document ID) is part of the dict.
    """
    if not club_id:
        return None
    club_doc_ref = db.collection("clubs").document(club_id)
    # Directly await the .get() method from AsyncDocumentReference
    club_doc = await club_doc_ref.get()
    if club_doc.exists:
        club_data = club_doc.to_dict()
        if club_data:  # Ensure club_data is not None
            # Add the Firestore document ID as 'clubId' to the dictionary,
            # as ClubResponse expects this field.
            club_data["clubId"] = club_doc.id
        return club_data
    print(f"Club document not found in Firestore for club_id: {club_id}")
    return None


async def get_user_joined_club_details(
    db: AsyncClient, user_id: str  # Type hint db as AsyncClient
) -> List[ClubResponse]:
    """
    Retrieves the full details for all clubs a user has joined using AsyncClient.
    """
    user_data = await get_user_firestore_document(db, user_id)
    if not user_data:
        return []

    joined_club_ids: List[str] = user_data.get("joinedClubs", [])
    if not joined_club_ids:
        return []

    valid_club_ids = [cid for cid in joined_club_ids if cid and isinstance(cid, str)]
    if not valid_club_ids:
        return []

    # get_club_firestore_document now returns a coroutine, so asyncio.gather will work correctly.
    club_fetch_tasks = [
        get_club_firestore_document(db, club_id) for club_id in valid_club_ids
    ]
    fetched_club_data_list = await asyncio.gather(*club_fetch_tasks)

    my_clubs_list: List[ClubResponse] = []
    for club_data_from_firestore in fetched_club_data_list:
        if club_data_from_firestore:
            try:
                # Firestore data keys should match the ClubResponse attributes.
                my_clubs_list.append(ClubResponse(**club_data_from_firestore))
            except Exception as e:
                club_id_for_error = club_data_from_firestore.get('clubId', 'unknown_id')
                print(
                    f"Error parsing club data for clubId '{club_id_for_error}': {e}."
                    f" Data: {club_data_from_firestore}"
                )
    return my_clubs_list
