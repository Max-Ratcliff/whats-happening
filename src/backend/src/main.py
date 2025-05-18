# slugscene-backend/backend/src/main.py

from fastapi import FastAPI  # , HTTPException
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
# import firebase_admin
from firebase_admin import initialize_app  # , credentials, get_app
# import os

# --- Import your API routers ---
# Adjusted paths to match your structure: src/api/endpoints/
from api.endpoints import users as users_router
from api.endpoints import clubs as clubs_router
from api.endpoints import posts as posts_router
from api.endpoints import events as events_router
from api.endpoints import auth as auth_router  # Assuming you have auth.py for auth routes

# --- Firebase Admin SDK Initialization ---
try:
    firebase_admin.get_app()
    print("Firebase Admin SDK already initialized.")
except ValueError:
    print("Initializing Firebase Admin SDK...")
    # Recommended: Set GOOGLE_APPLICATION_CREDENTIALS environment variable
    # to the path of your service account key JSON file.
    # Example: export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
    #
    # If not set, you can try to load it manually (less secure for key management):
    # service_account_key_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
    # if service_account_key_path:
    #     cred = credentials.Certificate(service_account_key_path)
    #     initialize_app(cred)
    # else:
    #     initialize_app() # Attempts default initialization
    initialize_app()
    print("Firebase Admin SDK initialized.")
except Exception as e:
    print(f"An critical error occurred during Firebase Admin SDK initialization: {e}")
    # Consider how to handle this; app might not function correctly without it.


# --- FastAPI Application Instance ---
app = FastAPI(
    title="SlugScene API",
    description="Backend API for the SlugScene platform.",
    version="0.1.0",
)

# --- Middleware Configuration ---
# CORS (Cross-Origin Resource Sharing)
origins = [
    "http://localhost",
    "http://localhost:8080",    # Common React dev port
    # Add your deployed frontend URL here for production
    # e.g., "https://slugscene.yourdomain.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers Inclusion ---
# Note: No "/v1" prefix in the router paths based on your structure,
# unless you add it within the router files themselves or here.
# For simplicity, I'm assuming direct paths now.
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users_router.router, prefix="/api/users", tags=["Users"])
app.include_router(clubs_router.router, prefix="/api/clubs", tags=["Clubs"])
app.include_router(posts_router.router, prefix="/api/posts", tags=["Posts"])
app.include_router(events_router.router, prefix="/api/events", tags=["Events"])


# --- Root Endpoint & Health Check ---
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the SlugScene API!"}


@app.get("/api/health", tags=["Health Check"])  # Simpler health check path
async def health_check():
    return {"status": "ok"}
