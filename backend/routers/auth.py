from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import jwt
from datetime import datetime, timedelta, timezone

from database import get_db
from deps import get_current_user
from models import User
from schemas import UserCreate, UserOut, Token, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest
from security import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == payload.email))
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = hash_password(payload.password)
    new_user = User(email=payload.email, password_hash=hashed_pwd)
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    token = create_access_token(new_user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(payload: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # OAuth2 specifies 'username' instead of 'email' in the form
    result = await db.execute(select(User).where(User.email == payload.username))
    user = result.scalars().first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    token = create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalars().first()
    
    if user:
        # Generate a short-lived reset token (15 mins)
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode = {"exp": expire, "sub": str(user.id), "type": "reset"}
        reset_token = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        
        # MOCK EMAIL SENDER
        print(f"\\n{'='*50}\\nPASSWORD RESET LINK FOR {user.email}:\\nhttp://localhost:8000/reset-password?token={reset_token}\\n{'='*50}\\n")
        
    # Always return 200 to prevent email enumeration
    return {"message": "If an account with that email exists, a password reset link has been sent."}

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        token_data = jwt.decode(payload.token, SECRET_KEY, algorithms=[ALGORITHM])
        if token_data.get("type") != "reset":
            raise ValueError()
        user_id = int(token_data.get("sub"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.password_hash = hash_password(payload.new_password)
    await db.commit()
    return {"message": "Password successfully reset"}

@router.post("/change-password")
async def change_password(
    payload: ChangePasswordRequest, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    current_user.password_hash = hash_password(payload.new_password)
    await db.commit()
    return {"message": "Password successfully changed"}
