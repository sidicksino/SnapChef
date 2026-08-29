from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    dietary_preferences: List[str]
    created_at: datetime
    
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: str
    password: str

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
