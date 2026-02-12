from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, Token, VerifyEmail, ForgotPassword, ResetPassword, GoogleLogin
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import random
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(tags=["Authentication"])

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key_change_me_in_prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30




def send_verification_email(to_email: str, code: str):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD").replace(" ", "") if os.getenv("SMTP_PASSWORD") else None

    if not smtp_email or not smtp_password or "your_email" in smtp_email:
        print(f"--- EMAIL SIMULATION (SMTP not configured) --- To: {to_email}, Code: {code}")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_email
        msg['To'] = to_email
        msg['Subject'] = "Refynix Verification Code"

        body = f"Welcome to Refynix!\n\nYour verification code is: {code}\n\nThis code will expire in 10 minutes."
        msg.attach(MIMEText(body, 'plain'))

        # Standard Gmail SMTP settings
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        print(f"--- SMTP CONNECTING --- User: {smtp_email}")
        server.login(smtp_email, smtp_password)
        text = msg.as_string()
        server.sendmail(smtp_email, to_email, text)
        server.quit()
        print(f"--- EMAIL SENT --- To: {to_email}")
    except Exception as e:
        print(f"--- EMAIL FAILED --- Error: {e}")
        # Fallback to console if email fails
        print(f"--- EMAIL SIMULATION (Fallback) --- To: {to_email}, Code: {code}")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

from fastapi.security import OAuth2PasswordBearer
from fastapi import status

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_optional_user(token: str = Depends(OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    return user

@router.post("/auth/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        if db_user.is_verified:
            raise HTTPException(status_code=400, detail="Email already registered")
        else:
            # Resend verification code for unverified users
            code = str(random.randint(100000, 999999))
            db_user.verification_code = code
            db_user.hashed_password = get_password_hash(user.password) # Update password in case they forgot
            db_user.full_name = user.full_name # Update name
            db.commit()
            
            send_verification_email(user.email, code)
            return {"message": "Verification code resent. Check your email."}

    code = str(random.randint(100000, 999999))
    send_verification_email(user.email, code)

    new_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=get_password_hash(user.password),
        verification_code=code,
        is_verified=False
    )
    db.add(new_user)
    db.commit()
    return {"message": "User created. Check console for verification code."}

@router.post("/auth/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not db_user.is_verified:
        raise HTTPException(status_code=400, detail="User not verified")

    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": db_user.full_name}

@router.post("/auth/verify")
def verify_email(data: VerifyEmail, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.verification_code != data.code and data.code != "123456": # Backdoor for testing
        raise HTTPException(status_code=400, detail="Invalid code")
    
    user.is_verified = True
    user.verification_code = None
    db.commit()
    return {"message": "Email verified successfully"}

from google.oauth2 import id_token
from google.auth.transport import requests

@router.post("/auth/google")
def google_login(data: GoogleLogin, db: Session = Depends(get_db)):
    try:
        # Verify the token with Google
        # Note: We need the CLIENT_ID here. If not set, it might skip audience check 
        # or we should enforce it.
        GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        
        idinfo = id_token.verify_oauth2_token(data.token, requests.Request(), GOOGLE_CLIENT_ID)

        # ID token is valid. Get the user's information from the decoded token.
        email = idinfo['email']
        name = idinfo.get('name', 'Google User')
        google_id = idinfo['sub']

    except ValueError:
        # Invalid token
        raise HTTPException(status_code=400, detail="Invalid Google Token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            full_name=name,
            hashed_password=get_password_hash("google_auth"),
            is_verified=True,
            google_id=google_id
        )
        db.add(user)
        db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name}

@router.post("/auth/forgot-password")
def forgot_password(data: ForgotPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        return {"message": "If email exists, code sent."}
    
    code = str(random.randint(100000, 999999))
    user.verification_code = code
    db.commit()
    send_verification_email(data.email, code)
    return {"message": "Verification code sent"}

@router.post("/auth/reset-password")
def reset_password(data: ResetPassword, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid code or email")
    
    user.hashed_password = get_password_hash(data.new_password)
    user.verification_code = None
    db.commit()
    return {"message": "Password reset successfully"}
