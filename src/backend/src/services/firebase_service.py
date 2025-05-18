import os
from google.cloud import firestore


db = None
try:
    project_id = os.getenv("FIREBASE_PROJECT_ID", os.getenv("GCLOUD_PROJECT"))
    if project_id:
        db = firestore.Client(project=project_id)
    else:
        db = firestore.Client()  # Attempt to infer project ID
    print(
        "Firestore client initialized successfully. Project: "
        f"{db.project if db else 'N/A'}"
    )
except Exception as e:
    print(f"FATAL: Failed to initialize Firestore client: {e}")
    # db remains None; dependent parts of the app might fail.
