from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

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

# Deliberately NOT adding image_url onto RecipeResponse itself — that model
# is also passed as `response_format` to the LLM's structured-output call,
# so any field on it is something the LLM is asked to fill in. The image is
# generated separately, after the text, so it gets its own response model
# that extends RecipeResponse rather than mutating the shared one.
class RecipeGenerateResponse(RecipeResponse):
    image_url: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)

class UserProfileUpdate(BaseModel):
    dietary_preferences: Optional[List[str]] = None

class RecipeIngredientSchema(BaseModel):
    name: str
    amount: str

class RecipeCreate(BaseModel):
    title: str
    description: str
    instructions: List[str]
    prep_time_minutes: int
    cook_time_minutes: int
    ingredients: List[RecipeIngredientSchema]
    image_url: Optional[str] = None

class RecipeOut(RecipeCreate):
    id: int
    created_at: datetime
    
    model_config = {"from_attributes": True}
