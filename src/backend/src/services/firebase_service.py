# File: backend/src/services/firebase_service.py
import os
# Import the AsyncClient from google.cloud.firestore_v1
from google.cloud.firestore_v1.async_client import AsyncClient

# db will now be an instance of AsyncClient or None
db: AsyncClient | None = None

try:
    project_id = os.getenv("FIREBASE_PROJECT_ID", os.getenv("GCLOUD_PROJECT"))
    # Optional: print the detected project_id for debugging if needed
    # print(f"INFO: firebase_service.py - Attempting to initialize with Project ID: {project_id if project_id else 'Default (inferred)'}")

    if project_id:
        db = AsyncClient(project=project_id)  # Use AsyncClient
    else:
        db = AsyncClient()  # Use AsyncClient to attempt to infer project ID

    if db:
        # The .project attribute might not be immediately available or could be a coroutine itself
        # for AsyncClient in some contexts, or it might be deferred.
        # A simple way to check initialization is just to see if db is not None.
        # If you need to confirm the project ID with AsyncClient, you might need an async call
        # or check how the client is typically inspected.
        # For now, a successful instantiation is the main goal.
        print(
            f"INFO: Firestore AsyncClient initialized. Project: {db.project if hasattr(db, 'project') and db.project else 'Default/Inferred'}"
        )
        # You can also print the type to be absolutely sure during startup
        # print(f"INFO: Initialized db object type: {type(db)}")
    else:
        # This case should ideally not be hit if AsyncClient() constructor doesn't raise an error and returns None,
        # which is not typical. The try/except block handles constructor errors.
        print("ERROR: Firestore AsyncClient initialization failed to assign 'db' instance.")

except Exception as e:
    print(f"FATAL: Failed to initialize Firestore AsyncClient: {e}")
    db = None  # Ensure db is None on failure
