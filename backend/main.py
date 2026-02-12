from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime

from models import CodeRequest, ReviewResult, User, ReviewHistory
from schemas import ReviewHistoryResponse
from service import GroqService
from database import engine, Base, get_db
from auth import router as auth_router, get_current_user, get_optional_user
import os
import logging

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Refynix API", version="1.0.0")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response Status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request Failed: {e}")
        raise e

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

service = None

@app.on_event("startup")
async def startup_event():
    global service
    try:
        service = GroqService()
        print("Groq Service Initialized.")
    except Exception as e:
        print(f"Failed to initialize Groq Service: {e}")

@app.post("/analyze", response_model=ReviewResult)
async def analyze_code(request: CodeRequest, user: Optional[User] = Depends(get_optional_user), db: Session = Depends(get_db)):
    if not service:
         raise HTTPException(status_code=503, detail="Analysis service not available. Check server logs.")
    
    try:
        result = await service.analyze_code(request.code, request.language, request.instruction)
        
        # Save history if user is logged in
        if user:
            history_item = ReviewHistory(
                user_id=user.id,
                code=request.code,
                language=request.language,
                result=json.dumps(result.dict()),
                timestamp=datetime.utcnow().isoformat()
            )
            db.add(history_item)
            db.commit()
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history", response_model=List[ReviewHistoryResponse])
def get_history(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(ReviewHistory).filter(ReviewHistory.user_id == user.id).order_by(ReviewHistory.id.desc()).all()
    
    response = []
    for item in history:
        try:
            result_obj = json.loads(item.result)
            response.append(ReviewHistoryResponse(
                id=item.id,
                code=item.code,
                language=item.language,
                result=result_obj,
                timestamp=item.timestamp
            ))
        except:
            continue
            
    return response

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Refynix Backend", "model": "Llama 3.3"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
