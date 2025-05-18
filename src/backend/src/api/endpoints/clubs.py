# File: backend/src/api/endpoints/clubs.py
from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore_v1.async_client import AsyncClient  # For type hinting
from google.cloud import firestore  # For ArrayUnion, ArrayRemove, and Increment

# Assuming your deps.py is one level up in an 'api' directory,
# and this 'endpoints' directory is also in 'api'.
# If your structure is src/api/deps.py and src/api/endpoints/clubs.py
# then this relative import is correct.
from ..deps import get_firestore_db, get_current_user, AuthenticatedUser

router = APIRouter()


# --- Join Club Functionality ---
async def _join_club_transaction_callback(
    transaction,  # This will be an AsyncTransaction object
    user_doc_ref_arg,
    club_doc_ref_arg,
    club_id_to_add_arg: str
):
    """
    Atomically adds clubId to user's joinedClubs array and increments memberCount.
    """
    print(f"DEBUG: JOIN_TRANSACTION_CALLBACK_START for club_id: {club_id_to_add_arg}")
    # print(f"DEBUG: Transaction object type in callback: {type(transaction)}")
    # print(f"DEBUG: user_doc_ref_arg type in callback: {type(user_doc_ref_arg)}")
    # print(f"DEBUG: club_doc_ref_arg type in callback: {type(club_doc_ref_arg)}")

    # Perform updates using the passed transaction object
    transaction.update(user_doc_ref_arg, {
        "joinedClubs": firestore.ArrayUnion([club_id_to_add_arg])
    })
    transaction.update(club_doc_ref_arg, {
        "memberCount": firestore.Increment(1)
    })
    print(f"DEBUG: JOIN_TRANSACTION_CALLBACK_UPDATES_STAGED for club_id: {club_id_to_add_arg}")
    return "JOIN_CALLBACK_SUCCESS"


@router.post(
    "/{club_id}/join",
    summary="Allow authenticated user to join a club",
    status_code=status.HTTP_200_OK,
)
async def join_club_endpoint(
    club_id: str,
    db: AsyncClient = Depends(get_firestore_db),  # db is AsyncClient
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    print(f"DEBUG: JOIN_CLUB_ENDPOINT_START for club_id: {club_id}, user_uid: {current_user.uid}")
    user_uid = current_user.uid
    user_doc_ref = db.collection("users").document(user_uid)
    club_doc_ref = db.collection("clubs").document(club_id)

    try:
        # 1. Check if club exists
        print("DEBUG: JOIN_CLUB - Attempting to get club_snapshot...")
        club_snapshot = await club_doc_ref.get()
        # print(f"DEBUG: club_snapshot object type: {type(club_snapshot)}, exists: {club_snapshot.exists}")
        if not club_snapshot.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with ID '{club_id}' not found.")

        # 2. Check if user exists
        print("DEBUG: JOIN_CLUB - Attempting to get user_snapshot...")
        user_snapshot = await user_doc_ref.get()
        # print(f"DEBUG: user_snapshot object type: {type(user_snapshot)}, exists: {user_snapshot.exists}")
        if not user_snapshot.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID '{user_uid}' not found.")

        # 3. Run the join operations in a transaction
        print("DEBUG: JOIN_CLUB - Attempting to start 'async with db.transaction()'...")
        async with db.transaction() as transaction_obj:
            # print(f"DEBUG: Inside 'async with' block for JOIN. Transaction object type: {type(transaction_obj)}")
            await _join_club_transaction_callback(
                transaction_obj,
                user_doc_ref,
                club_doc_ref,
                club_id
            )
            # print(f"DEBUG: JOIN_CLUB - Transaction callback result: {callback_result}")

        print(f"DEBUG: JOIN_CLUB - Transaction completed successfully for club_id: {club_id}")
        club_name = club_snapshot.get("name") or club_id
        return {"message": f"Successfully joined club: {club_name}"}

    except HTTPException:
        # print(f"DEBUG: HTTPException caught in join_club_endpoint for club_id: {club_id}")
        raise
    except Exception as e:
        import traceback
        print(f"DEBUG: UNEXPECTED EXCEPTION in join_club_endpoint for club_id: {club_id}")
        traceback.print_exc()
        print(f"Error encountered while user {user_uid} attempted to join club {club_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while trying to join the club."
        )


# --- Leave Club Functionality ---
async def _leave_club_transaction_callback(
    transaction,  # AsyncTransaction object
    user_doc_ref_arg,
    club_doc_ref_arg,
    club_id_to_remove_arg: str
):
    """
    Atomically removes club from user's list and decrements memberCount.
    """
    print(f"DEBUG: LEAVE_TRANSACTION_CALLBACK_START for club_id: {club_id_to_remove_arg}")

    # 1. Remove clubId from user's joinedClubs array
    transaction.update(user_doc_ref_arg, {
        "joinedClubs": firestore.ArrayRemove([club_id_to_remove_arg])
    })

    # 2. Decrement memberCount for the club
    # Note: This assumes the club document exists. If it might not, a check could be added
    # or ensure this operation is safe if club_doc_ref_arg points to a non-existent doc.
    # Firestore's Increment is generally safe but won't create the doc/field.
    transaction.update(club_doc_ref_arg, {
        "memberCount": firestore.Increment(-1)
    })
    print(f"DEBUG: LEAVE_TRANSACTION_CALLBACK_UPDATES_STAGED for club_id: {club_id_to_remove_arg}")
    return "LEAVE_CALLBACK_SUCCESS"


@router.post(
    "/{club_id}/leave",
    summary="Allow authenticated user to leave a club",
    status_code=status.HTTP_200_OK,
)
async def leave_club_endpoint(
    club_id: str,
    db: AsyncClient = Depends(get_firestore_db),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    user_uid = current_user.uid
    user_doc_ref = db.collection("users").document(user_uid)
    club_doc_ref = db.collection("clubs").document(club_id)

    print(f"DEBUG: LEAVE_CLUB_ENDPOINT_START for club_id: {club_id}, user_uid: {user_uid}")

    try:
        # 1. Check if club exists (primarily for getting club name for response)
        #    The main logic will attempt to remove/decrement regardless.
        print("DEBUG: LEAVE_CLUB - Attempting to get club_snapshot...")
        club_snapshot = await club_doc_ref.get()
        # Not raising an error if club doesn't exist, as user might want to ensure
        # they are unlinked even if club data is faulty.

        # 2. Check if user exists
        print("DEBUG: LEAVE_CLUB - Attempting to get user_snapshot...")
        user_snapshot = await user_doc_ref.get()
        if not user_snapshot.exists:
            # If user doesn't exist, they can't leave a club.
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID '{user_uid}' not found.")

        # 3. Run the leave operations in a transaction
        print(f"DEBUG: LEAVE_CLUB - Attempting to start 'async with db.transaction()' for club {club_id}...")
        async with db.transaction() as transaction_obj:
            # print(f"DEBUG: Inside 'async with' block for LEAVE. Transaction object type: {type(transaction_obj)}")
            await _leave_club_transaction_callback(
                transaction_obj,
                user_doc_ref,
                club_doc_ref,  # Pass even if it might not exist; transaction.update is somewhat idempotent
                club_id
            )
            # print(f"DEBUG: LEAVE_CLUB - Transaction callback result: {callback_result}")

            print(f"DEBUG: LEAVE_CLUB - Transaction completed successfully for club_id: {club_id}")

        club_name_for_message = club_snapshot.get("name") if club_snapshot.exists else club_id
        return {"message": f"Successfully left club: {club_name_for_message}"}

    except HTTPException:
        # print(f"DEBUG: HTTPException caught in leave_club_endpoint for club_id: {club_id}")
        raise
    except Exception as e:
        import traceback
        print(f"DEBUG: UNEXPECTED EXCEPTION in leave_club_endpoint for club_id: {club_id}")
        traceback.print_exc()
        print(f"Error encountered while user {user_uid} attempted to leave club {club_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while trying to leave the club."
        )
