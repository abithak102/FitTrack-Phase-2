from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Workout
from ..auth import get_current_user


router = APIRouter(
    prefix="/progress-comparison",
    tags=["Progress Comparison"]
)


def get_period_summary(db, user_id, start_date, end_date):
    result = db.query(
        func.count(Workout.id),
        func.coalesce(func.sum(Workout.duration), 0),
        func.coalesce(func.sum(Workout.calories_burned), 0)
    ).filter(
        Workout.user_id == user_id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= end_date
    ).first()

    return {
        "total_workouts": result[0],
        "total_duration": result[1],
        "total_calories": result[2]
    }


def get_comparison(current, previous):
    return {
        "workouts_change": current["total_workouts"] - previous["total_workouts"],
        "duration_change": current["total_duration"] - previous["total_duration"],
        "calories_change": current["total_calories"] - previous["total_calories"]
    }


@router.get("/weekly")
def weekly_comparison(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()

    current_start = today - timedelta(days=today.weekday())
    current_end = today

    previous_start = current_start - timedelta(days=7)
    previous_end = current_start - timedelta(days=1)

    current = get_period_summary(
        db, current_user.id, current_start, current_end
    )

    previous = get_period_summary(
        db, current_user.id, previous_start, previous_end
    )

    return {
        "period": "Weekly",
        "current_period": current,
        "previous_period": previous,
        "comparison": get_comparison(current, previous)
    }


@router.get("/monthly")
def monthly_comparison(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()

    current_start = today.replace(day=1)
    current_end = today

    previous_end = current_start - timedelta(days=1)
    previous_start = previous_end.replace(day=1)

    current = get_period_summary(
        db, current_user.id, current_start, current_end
    )

    previous = get_period_summary(
        db, current_user.id, previous_start, previous_end
    )

    return {
        "period": "Monthly",
        "current_period": current,
        "previous_period": previous,
        "comparison": get_comparison(current, previous)
    }


@router.get("/trends")
def progress_trends(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()
    start_date = today - timedelta(days=29)

    results = db.query(
        Workout.workout_date,
        func.count(Workout.id).label("total_workouts"),
        func.coalesce(func.sum(Workout.duration), 0).label("total_duration"),
        func.coalesce(func.sum(Workout.calories_burned), 0).label("total_calories")
    ).filter(
        Workout.user_id == current_user.id,
        Workout.workout_date >= start_date,
        Workout.workout_date <= today
    ).group_by(
        Workout.workout_date
    ).order_by(
        Workout.workout_date.asc()
    ).all()

    return {
        "period": "Last 30 Days",
        "trends": [
            {
                "date": str(row.workout_date),
                "total_workouts": row.total_workouts,
                "total_duration": row.total_duration,
                "total_calories": row.total_calories
            }
            for row in results
        ]
    }