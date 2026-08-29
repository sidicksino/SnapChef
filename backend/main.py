from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# DB and Auth imports
from database import engine, Base
from routers import auth, users, recipes

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup (useful for local development)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="SnapChef API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recipes.router)

@app.get("/")
async def root():
    return {"message": "SnapChef API is running!"}
