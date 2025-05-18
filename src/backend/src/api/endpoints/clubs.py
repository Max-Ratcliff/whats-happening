# File: backend/src/api/endpoints/clubs.py
from fastapi import APIRouter, Depends, HTTPException, status
from google.cloud.firestore_v1.async_client import AsyncClient  # For type hinting
from google.cloud import firestore  # For ArrayUnion and Increment

from ..deps import get_firestore_db, get_current_user, AuthenticatedUser

router = APIRouter()


# Your async callback function remains largely the same.
# It now receives the transaction object created by 'async with'.
async def _join_club_transaction_callback(
    transaction,  # This will be an AsyncTransaction object
    user_doc_ref_arg,
    club_doc_ref_arg,
    club_id_to_add_arg: str
):
    print(f"DEBUG: TRANSACTION_CALLBACK_START for club_id: {club_id_to_add_arg}")
    print(f"DEBUG: Transaction object type in callback: {type(transaction)}")
    print(f"DEBUG: user_doc_ref_arg type in callback: {type(user_doc_ref_arg)}")
    print(f"DEBUG: club_doc_ref_arg type in callback: {type(club_doc_ref_arg)}")

    # Perform updates using the passed transaction object
    transaction.update(user_doc_ref_arg, {
        "joinedClubs": firestore.ArrayUnion([club_id_to_add_arg])
    })
    transaction.update(club_doc_ref_arg, {
        "memberCount": firestore.Increment(1)
    })
    print(f"DEBUG: TRANSACTION_CALLBACK_UPDATES_STAGED for club_id: {club_id_to_add_arg}")
    return "CALLBACK_SUCCESS"  # You can return a status or result if needed


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
    # ... (other debug prints for db, current_user types) ...

    user_uid = current_user.uid
    user_doc_ref = db.collection("users").document(user_uid)
    club_doc_ref = db.collection("clubs").document(club_id)

    # ... (debug prints for doc_ref types) ...

    try:
        # 1. Check if club exists (outside the transaction for read-only check)
        print("DEBUG: Attempting to get club_snapshot...")
        club_snapshot = await club_doc_ref.get()
        print(f"DEBUG: club_snapshot object type: {type(club_snapshot)}, exists: {club_snapshot.exists}")
        if not club_snapshot.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Club with ID '{club_id}' not found.")

        # 2. Check if user exists (optional, but good practice)
        print("DEBUG: Attempting to get user_snapshot...")
        user_snapshot = await user_doc_ref.get()
        print(f"DEBUG: user_snapshot object type: {type(user_snapshot)}, exists: {user_snapshot.exists}")
        if not user_snapshot.exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with ID '{user_uid}' not found.")

        # 3. Run the join operations in a transaction using 'async with'
        print("DEBUG: Attempting to start 'async with db.transaction()'...")
        async with db.transaction() as transaction_obj:  # Correct way to use AsyncTransaction
            print(f"DEBUG: Inside 'async with' block. Transaction object type: {type(transaction_obj)}")

            # Call your callback function, passing the transaction object from 'async with'
            callback_result = await _join_club_transaction_callback(
                transaction_obj,  # Pass the actual transaction object
                user_doc_ref,
                club_doc_ref,
                club_id
            )
            print(f"DEBUG: Transaction callback result: {callback_result}")

        print(f"DEBUG: Transaction completed successfully (after 'async with') for club_id: {club_id}")

        club_name = club_snapshot.get("name") or club_id
        return {"message": f"Successfully joined club: {club_name}"}

    except HTTPException:
        print(f"DEBUG: HTTPException caught in join_club_endpoint for club_id: {club_id}")
        raise
    except Exception as e:
        import traceback
        print(f"DEBUG: UNEXPECTED EXCEPTION in join_club_endpoint for club_id: {club_id}")
        print(f"DEBUG: Exception type: {type(e)}")
        print(f"DEBUG: Exception message: {str(e)}")
        traceback.print_exc()

        # This line was in your logs, it's good for the Uvicorn summary
        print(f"Error encountered while user {user_uid} attempted to join club {club_id}: {e}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while trying to join the club. Please try again."
        )
