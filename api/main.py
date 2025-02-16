from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, func
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel, field_validator
import os
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Database URL
DATABASE_URL = f"mysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

# FastAPI app
app = FastAPI(title="Election Poll API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for public access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Updated SQLAlchemy Base class
class Base(DeclarativeBase):
    pass

# Load candidates data
with open('candidates.json', 'r') as f:
    CANDIDATES_DATA = json.load(f)

# Database Models
class Vote(Base):
    __tablename__ = "votes"
    id = Column(Integer, primary_key=True, index=True)
    voter_name = Column(String(100), index=True)
    votes = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class VoteCreate(BaseModel):
    voter_name: str
    votes: Dict

    @field_validator('votes')
    @classmethod
    def validate_votes(cls, votes):
        formatted_votes = {}
        
        # Check each position's votes
        for position, data in CANDIDATES_DATA.items():
            position_votes = votes.get(position, [])
            max_votes = 8 if position == "MEMBER, SANGGUNIANG PANLUNGSOD" else 1
            
            # Validate votes for this position
            if position_votes:
                # Check if votes are valid candidates
                valid_candidates = set(data["candidates"])
                valid_votes = [vote for vote in position_votes if vote in valid_candidates]
                
                # Check if number of votes is within limit
                if len(valid_votes) > max_votes:
                    raise ValueError(f"Too many votes for {position}. Maximum is {max_votes}")
                
                # Only include position in formatted votes if there are valid votes
                if valid_votes:
                    formatted_votes[position] = valid_votes
            else:
                # If no votes for this position, include empty list
                formatted_votes[position] = []
        
        return formatted_votes

class VoteSummary(BaseModel):
    total_votes: int
    position_summaries: Dict
    last_updated: datetime

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Routes
@app.get("/")
async def root():
    return {
        "message": "Election Poll API",
        "endpoints": {
            "submit_vote": "/api/submit-vote",
            "get_candidates": "/api/candidates",
            "get_live_results": "/api/results/live",
            "get_position_results": "/api/results/{position}"
        }
    }

@app.get("/api/candidates")
async def get_candidates():
    """Get list of all candidates per position"""
    return CANDIDATES_DATA

@app.post("/api/submit-vote")
async def submit_vote(vote: VoteCreate, db: Session = Depends(get_db)):
    try:
        # The votes are already validated and formatted by the Pydantic model
        vote_summary = {
            position: {
                "selected": len(candidates),
                "maximum": 8 if position == "MEMBER, SANGGUNIANG PANLUNGSOD" else 1,
                "votes": candidates
            }
            for position, candidates in vote.votes.items()
        }
        
        db_vote = Vote(voter_name=vote.voter_name, votes=vote.votes)
        db.add(db_vote)
        db.commit()
        db.refresh(db_vote)
        
        return {
            "message": "Vote submitted successfully",
            "summary": vote_summary
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while submitting the vote")

@app.get("/api/results/live")
async def get_live_results(db: Session = Depends(get_db)):
    """Get live voting results for all positions"""
    votes = db.query(Vote).all()
    total_votes = len(votes)
    results = {}
    barangay_stats = {}  # Track barangay counts
    
    # Count votes by barangay
    for vote in votes:
        if vote.barangay:  # Only count if barangay exists
            barangay_stats[vote.barangay] = barangay_stats.get(vote.barangay, 0) + 1
    
    # Process results for each position
    for position in CANDIDATES_DATA.keys():
        position_results = {}
        
        for vote in votes:
            if position in vote.votes:
                for candidate in vote.votes[position]:
                    if candidate not in position_results:
                        position_results[candidate] = {
                            "votes": 0,
                            "votes_by_barangay": {}
                        }
                    
                    position_results[candidate]["votes"] += 1
                    
                    # Track barangay-specific votes
                    if vote.barangay:  # Only track if barangay exists
                        brgy = vote.barangay
                        if brgy not in position_results[candidate]["votes_by_barangay"]:
                            position_results[candidate]["votes_by_barangay"][brgy] = 0
                        position_results[candidate]["votes_by_barangay"][brgy] += 1
        
        # Calculate overall percentages
        if position_results:
            total_position_votes = sum(c["votes"] for c in position_results.values())
            for candidate in position_results:
                position_results[candidate]["percentage"] = round(
                    (position_results[candidate]["votes"] / total_position_votes * 100), 2
                )
                
                # Calculate barangay-specific percentages
                for brgy, brgy_votes in position_results[candidate]["votes_by_barangay"].items():
                    total_brgy_votes = sum(
                        c["votes_by_barangay"].get(brgy, 0) 
                        for c in position_results.values()
                    )
                    if total_brgy_votes > 0:
                        if "percentage_by_barangay" not in position_results[candidate]:
                            position_results[candidate]["percentage_by_barangay"] = {}
                        position_results[candidate]["percentage_by_barangay"][brgy] = round(
                            (brgy_votes / total_brgy_votes * 100), 2
                        )
        
        results[position] = {
            "total_votes": total_votes,
            "candidates": position_results
        }
    
    return {
        "total_votes": total_votes,
        "last_updated": datetime.utcnow(),
        "results": results,
        "votes": [{"barangay": k, "count": v} for k, v in barangay_stats.items()]  # Barangay distribution
    }

@app.get("/api/results/{position}")
async def get_position_results(position: str, db: Session = Depends(get_db)):
    """Get detailed results for a specific position"""
    if position not in CANDIDATES_DATA:
        raise HTTPException(status_code=404, detail="Position not found")
    
    votes = db.query(Vote).all()
    position_votes = {}
    total_position_votes = 0
    
    for vote in votes:
        if position in vote.votes:
            for candidate in vote.votes[position]:
                position_votes[candidate] = position_votes.get(candidate, 0) + 1
                total_position_votes += 1
    
    # Add candidates with zero votes
    for candidate in CANDIDATES_DATA[position]["candidates"]:
        if candidate not in position_votes:
            position_votes[candidate] = 0
    
    # Calculate percentages
    results = {
        candidate: {
            "votes": votes,
            "percentage": round((votes / total_position_votes * 100 if total_position_votes > 0 else 0), 2)
        }
        for candidate, votes in position_votes.items()
    }
    
    return {
        "position": position,
        "total_votes": total_position_votes,
        "last_updated": datetime.utcnow(),
        "results": results,
        "vote_limit": 8 if position == "MEMBER, SANGGUNIANG PANLUNGSOD" else 1
    }

@app.get("/api/stats/hourly")
async def get_hourly_stats(db: Session = Depends(get_db)):
    """Get hourly voting statistics"""
    query = db.query(
        func.date_format(Vote.timestamp, '%Y-%m-%d %H:00:00').label('hour'),
        func.count(Vote.id).label('vote_count')
    ).group_by('hour').order_by('hour')
    
    hourly_stats = query.all()
    return {
        "hourly_stats": [
            {
                "hour": stat.hour,
                "vote_count": stat.vote_count
            }
            for stat in hourly_stats
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8080, reload=True)