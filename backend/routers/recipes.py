from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import base64
import logging
import os
import uuid
from openai import AsyncOpenAI

from database import get_db
from models import User, Recipe, RecipeIngredient
from schemas import RecipeRequest, RecipeResponse, RecipeGenerateResponse, RecipeCreate, RecipeOut
from deps import get_current_user

router = APIRouter(prefix="/api/recipes", tags=["recipes"])
logger = logging.getLogger(__name__)

# Gemini, via Google's OpenAI-compatibility endpoint — keeps the same
# `openai` SDK and the exact same `.beta.chat.completions.parse(...)`
# structured-output call used below, just a different base_url/model/key.
# https://ai.google.dev/gemini-api/docs/openai
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
GEMINI_MODEL = "gemini-3.7-flash"
GEMINI_IMAGE_MODEL = "gemini-3-pro-image-preview"

api_key = os.getenv("GEMIMIAI_API_KEY")
client = AsyncOpenAI(api_key=api_key, base_url=GEMINI_BASE_URL) if api_key else None

RECIPE_IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "recipe_images")
os.makedirs(RECIPE_IMAGES_DIR, exist_ok=True)


async def generate_recipe_image(recipe: RecipeResponse) -> Optional[str]:
    """Generates a food-photography image for a recipe and saves it under
    static/recipe_images/, returning a URL path the frontend can resolve
    against the same host it already talks to for the API itself. Returns
    None (never raises) on failure — a missing image shouldn't break the
    whole recipe generation the user is waiting on."""
    try:
        response = await client.images.generate(
            model=GEMINI_IMAGE_MODEL,
            prompt=(
                f"Professional food photography of {recipe.title}: {recipe.description} "
                "Natural lighting, appetizing, on a clean plate or bowl, shallow depth of field."
            ),
            response_format="b64_json",
            n=1,
        )
        image_bytes = base64.b64decode(response.data[0].b64_json)
        filename = f"{uuid.uuid4().hex}.png"
        with open(os.path.join(RECIPE_IMAGES_DIR, filename), "wb") as f:
            f.write(image_bytes)
        return f"/static/recipe_images/{filename}"
    except Exception as e:
        logger.warning(f"Recipe image generation failed, continuing without an image: {e}")
        return None


@router.post("/generate", response_model=RecipeGenerateResponse)
async def generate_recipe(
    request: RecipeRequest,
    current_user: User = Depends(get_current_user)
):
    if not client:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")

    if not request.ingredients:
        raise HTTPException(status_code=400, detail="Ingredients list cannot be empty")

    prompt = f"Generate a recipe using some or all of these ingredients: {', '.join(request.ingredients)}.\\n"
    # Note: Now using the user's saved dietary preferences from their profile!
    if current_user.dietary_preferences:
        prompt += f"Strictly adhere to these dietary preferences: {', '.join(current_user.dietary_preferences)}.\\n"
    if request.cooking_time_minutes:
        prompt += f"The recipe should take roughly {request.cooking_time_minutes} minutes or less to cook.\\n"

    prompt += "Provide a delicious, practical recipe."

    try:
        completion = await client.beta.chat.completions.parse(
            model=GEMINI_MODEL,
            messages=[
                {"role": "system", "content": "You are an expert chef. Generate structured recipes based on the provided ingredients."},
                {"role": "user", "content": prompt}
            ],
            response_format=RecipeResponse,
        )

        recipe = completion.choices[0].message.parsed

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recipe: {str(e)}")

    image_url = await generate_recipe_image(recipe)
    return RecipeGenerateResponse(**recipe.model_dump(), image_url=image_url)


@router.post("", response_model=RecipeOut)
async def save_recipe(
    payload: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    new_recipe = Recipe(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        instructions=payload.instructions,
        prep_time_minutes=payload.prep_time_minutes,
        cook_time_minutes=payload.cook_time_minutes,
        image_url=payload.image_url
    )
    db.add(new_recipe)
    await db.flush() # To get the recipe ID

    for ing in payload.ingredients:
        db.add(RecipeIngredient(
            recipe_id=new_recipe.id,
            name=ing.name,
            amount=ing.amount
        ))
        
    await db.commit()
    await db.refresh(new_recipe)
    
    # We need to reload to get the ingredients relationship eagerly for the response
    result = await db.execute(
        select(Recipe).options(selectinload(Recipe.ingredients)).where(Recipe.id == new_recipe.id)
    )
    return result.scalars().first()

@router.get("", response_model=List[RecipeOut])
async def get_saved_recipes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Recipe)
        .options(selectinload(Recipe.ingredients))
        .where(Recipe.user_id == current_user.id)
        .order_by(Recipe.created_at.desc())
    )
    return result.scalars().all()
