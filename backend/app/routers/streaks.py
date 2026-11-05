
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models.workout import Workout


router = APIRouter(
    prefix="/streaks",
    tags=["Workout Streaks"]
)


@router.get("/summary")
def get_streak_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()

    workout_dates = (
        db.query(Workout.workout_date)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date <= today
        )
        .distinct()
        .order_by(Workout.workout_date.desc())
        .all()
    )

    dates = [item[0] for item in workout_dates]

    if not dates:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_workout_date": None
        }

    # Calculate current streak
    current_streak = 0

    if dates[0] == today or dates[0] == today - timedelta(days=1):
        expected_date = dates[0]

        for workout_date in dates:
            if workout_date == expected_date:
                current_streak += 1
                expected_date -= timedelta(days=1)
            else:
                break

    # Calculate longest streak
    longest_streak = 0
    streak_count = 0
    previous_date = None

    for workout_date in reversed(dates):
        if previous_date is None:
            streak_count = 1
        elif workout_date == previous_date + timedelta(days=1):
            streak_count += 1
        else:
            streak_count = 1

        longest_streak = max(longest_streak, streak_count)
        previous_date = workout_date

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "last_workout_date": dates[0]
    }
