from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

# DB and Auth imports
from database import engine, Base
from routers import auth
from schemas import RecipeRequest, RecipeResponse

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

# Mount the Authentication Router
app.include_router(auth.router)

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

@app.get("/")
async def root():
    return {"message": "SnapChef API is running!"}

@app.post("/api/recipes/generate", response_model=RecipeResponse)
async def generate_recipe(request: RecipeRequest):
    if not client:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    
    if not request.ingredients:
        raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")

    prompt = f"Generate a recipe using some or all of these ingredients: {', '.join(request.ingredients)}.\n"
    if request.dietary_preferences:
        prompt += f"Strictly adhere to these dietary preferences: {', '.join(request.dietary_preferences)}.\n"
    if request.cooking_time_minutes:
        prompt += f"The recipe should take roughly {request.cooking_time_minutes} minutes or less to cook.\n"
        
    prompt += "Provide a delicious, practical recipe."

    try:
        completion = await client.beta.chat.completions.parse(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are an expert chef. Generate structured recipes based on the provided ingredients."},
                {"role": "user", "content": prompt}
            ],
            response_format=RecipeResponse,
        )
        
        recipe = completion.choices[0].message.parsed
        return recipe
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recipe: {str(e)}")
