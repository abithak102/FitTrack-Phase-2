
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .auth import get_current_user
from .routers import users, workouts, progress, goals,analytics,notifications,workout_plans,exercises,progress_comparison,streaks,badges


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="FitTrack API",
    description="Fitness and Workout Management Platform",
    version="1.0.0"
)


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API Routers
app.include_router(users.router)
app.include_router(workouts.router)
app.include_router(progress.router)
app.include_router(goals.router)
app.include_router(analytics.router)
app.include_router(notifications.router)
app.include_router(workout_plans.router)
app.include_router(exercises.router)
app.include_router(progress_comparison.router)
app.include_router(streaks.router)
app.include_router(badges.router)
@app.get("/")
def home():
    return {
        "message": "Welcome to FitTrack API",
        "status": "Running"
    }


@app.get("/protected")
def protected_route(
    current_user=Depends(get_current_user)
):
    return {
        "message": "You are authenticated!",
        "username": current_user.username,
        "user_id": current_user.id
    }
