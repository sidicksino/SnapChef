from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

app = FastAPI(title="Fridge Recipe Generator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client (make sure to add your API key to the .env file)
api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

class RecipeRequest(BaseModel):
    ingredients: List[str]
    dietary_preferences: Optional[List[str]] = None
    cooking_time_minutes: Optional[int] = None

class RecipeResponse(BaseModel):
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    estimated_time: int
    nutritional_info: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Fridge Recipe Generator API is running!"}

@app.post("/generate-recipe", response_model=RecipeResponse)
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
