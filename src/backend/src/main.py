import os
import json  # For parsing JSON string from env var
from dotenv import load_dotenv  # For loading .env file
from firebase_admin import credentials, initialize_app, get_app
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.endpoints import users as users_router
from api.endpoints import clubs as clubs_router
from api.endpoints import posts as posts_router
from api.endpoints import events as events_router
from api.endpoints import auth as auth_router

# --- Load Environment Variables ---
# Call load_dotenv() at the very beginning of your script.
# It looks for a .env file in the current working directory or parent directories.
# If you run `uvicorn src.main:app --reload` from the `backend/` directory
# (where your .env file should be), this will load it.
load_dotenv()
print("INFO: Attempted to load .env file.")

# --- Firebase Admin SDK Initialization ---
# This should happen once when the application starts.
try:
    get_app()  # Check if "[DEFAULT]" app already exists
    print("INFO: Firebase Admin SDK already initialized.")
except ValueError:  # Indicates no app named "[DEFAULT]" has been created yet
    print("INFO: Initializing Firebase Admin SDK...")
    cred_object = None
    firebase_credentials_json_str = os.getenv("FIREBASE_CREDENTIALS_JSON")
    google_app_creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")

    if firebase_credentials_json_str:
        try:
            cred_dict = json.loads(firebase_credentials_json_str)
            cred_object = credentials.Certificate(cred_dict)
            print("INFO: Using FIREBASE_CREDENTIALS_JSON for Firebase Admin SDK.")
        except json.JSONDecodeError as e:
            print(f"ERROR: Could not parse FIREBASE_CREDENTIALS_JSON: {e}")
        except Exception as e:
            print(f"ERROR: Could not initialize Firebase Admin with JSON string: {e}")
    elif google_app_creds_path:
        try:
            # Ensure the path is treated as a file path
            if os.path.exists(google_app_creds_path):
                cred_object = credentials.Certificate(google_app_creds_path)
                print("INFO: Using GOOGLE_APPLICATION_CREDENTIALS path for Firebase Admin SDK.")
            else:
                print(f"WARNING: GOOGLE_APPLICATION_CREDENTIALS path not found: {google_app_creds_path}")
                # Let it fall through to default initialization which might find ADC
        except Exception as e:
            print(
                f"ERROR: Could not initialize Firebase Admin with "
                f"GOOGLE_APPLICATION_CREDENTIALS path {google_app_creds_path}: {e}"
            )
            cred_object = None  # Fallback to default initialization attempt

    # Initialize app
    try:
        if cred_object:
            initialize_app(cred_object)
        else:
            # This will use GOOGLE_APPLICATION_CREDENTIALS if it's set by the environment
            # to a valid file path AND cred_object wasn't successfully created,
            # OR it will use Application Default Credentials (ADC) if available.
            initialize_app()
            print(
                "INFO: Firebase Admin SDK initialized (using ADC or GOOGLE_APPLICATION_CREDENTIALS file "
                "if not explicitly parsed from FIREBASE_CREDENTIALS_JSON)."
            )
        print("INFO: Firebase Admin SDK initialization attempt complete.")
    except Exception as e:
        print(f"CRITICAL: Firebase Admin SDK initialization failed: {e}")
        # Depending on your application's needs, you might want to exit or
        # raise the exception to prevent the app from starting in a broken state.

# --- FastAPI Application Instance ---
app = FastAPI(
    title="SlugScene API",
    description="Backend API for the SlugScene platform.",
    version="0.1.0",
    # You can customize docs URLs if needed, e.g., if you add a global /api prefix
    # docs_url="/api/docs",
    # redoc_url="/api/redoc",
)

# --- Middleware Configuration ---
# CORS (Cross-Origin Resource Sharing)
# Ensure these origins match your frontend development and production URLs
origins = [
    "http://localhost",      # General localhost
    "http://localhost:3000",  # Common React CRA dev port
    "http://localhost:5173",  # Common Vite dev port (your frontend uses Vite)
    "http://localhost:8080",  # From your previous main.py (keep if needed)
    # TODO: Add your deployed frontend URL here for production
    # "https://your-slugscene-app-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # Allows cookies to be included in cross-origin requests
    allow_methods=["*"],     # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],     # Allows all headers
)

# --- API Routers Inclusion ---
# All API routes will be prefixed with /api
API_PREFIX = "/api"

app.include_router(
    auth_router.router, prefix=f"{API_PREFIX}/auth", tags=["Authentication"]
)
app.include_router(
    users_router.router, prefix=f"{API_PREFIX}/users", tags=["Users"]
)
app.include_router(
    clubs_router.router, prefix=f"{API_PREFIX}/clubs", tags=["Clubs"]
)
app.include_router(
    posts_router.router, prefix=f"{API_PREFIX}/posts", tags=["Posts"]
)
app.include_router(
    events_router.router, prefix=f"{API_PREFIX}/events", tags=["Events"]
)


# --- Root Endpoint & Health Check ---
@app.get("/", tags=["Root"])
async def read_root():
    """
    Root endpoint for the API. Provides a welcome message.
    """
    return {"message": "Welcome to the SlugScene API!"}


@app.get(f"{API_PREFIX}/health", tags=["Health Check"])
async def health_check():
    """
    Health check endpoint to verify API status.
    """
    return {"status": "ok"}
