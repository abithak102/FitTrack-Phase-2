
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models import Badge, UserBadge, Workout, Goal


router = APIRouter(
    prefix="/badges",
    tags=["Achievement Badges"]
)


BADGE_DEFINITIONS = [
    {
        "name": "First Workout",
        "description": "Complete your first workout.",
        "icon": "🏅",
        "requirement_type": "workouts",
        "requirement_value": 1
    },
    {
        "name": "Workout Beginner",
        "description": "Complete 10 workouts.",
        "icon": "🥉",
        "requirement_type": "workouts",
        "requirement_value": 10
    },
    {
        "name": "Workout Enthusiast",
        "description": "Complete 25 workouts.",
        "icon": "🥈",
        "requirement_type": "workouts",
        "requirement_value": 25
    },
    {
        "name": "Fitness Champion",
        "description": "Complete 50 workouts.",
        "icon": "🥇",
        "requirement_type": "workouts",
        "requirement_value": 50
    },
    {
        "name": "Workout Legend",
        "description": "Complete 100 workouts.",
        "icon": "🏆",
        "requirement_type": "workouts",
        "requirement_value": 100
    },
    {
        "name": "3 Day Streak",
        "description": "Work out for 3 consecutive days.",
        "icon": "🔥",
        "requirement_type": "streak",
        "requirement_value": 3
    },
    {
        "name": "7 Day Streak",
        "description": "Work out for 7 consecutive days.",
        "icon": "⚡",
        "requirement_type": "streak",
        "requirement_value": 7
    },
    {
        "name": "30 Day Streak",
        "description": "Work out for 30 consecutive days.",
        "icon": "💎",
        "requirement_type": "streak",
        "requirement_value": 30
    },
    {
        "name": "First Goal Completed",
        "description": "Complete your first fitness goal.",
        "icon": "🎯",
        "requirement_type": "goals",
        "requirement_value": 1
    },
    {
        "name": "Goal Achiever",
        "description": "Complete 5 fitness goals.",
        "icon": "🌟",
        "requirement_type": "goals",
        "requirement_value": 5
    },
    {
        "name": "Goal Master",
        "description": "Complete 10 fitness goals.",
        "icon": "👑",
        "requirement_type": "goals",
        "requirement_value": 10
    }
]


def calculate_streak(workout_dates):
    if not workout_dates:
        return 0

    today = date.today()
    current_streak = 0

    if workout_dates[0] in (today, today - timedelta(days=1)):
        expected_date = workout_dates[0]

        for workout_date in workout_dates:
            if workout_date == expected_date:
                current_streak += 1
                expected_date -= timedelta(days=1)
            else:
                break

    longest_streak = 0
    streak_count = 0
    previous_date = None

    for workout_date in reversed(workout_dates):
        if previous_date is None:
            streak_count = 1
        elif workout_date == previous_date + timedelta(days=1):
            streak_count += 1
        else:
            streak_count = 1

        longest_streak = max(longest_streak, streak_count)
        previous_date = workout_date

    return max(current_streak, longest_streak)


@router.get("/summary")
def get_badges(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Create badge definitions if they do not exist
    for definition in BADGE_DEFINITIONS:
        badge = db.query(Badge).filter(
            Badge.name == definition["name"]
        ).first()

        if not badge:
            db.add(Badge(**definition))

    db.commit()

    # Calculate workout count
    workout_count = db.query(Workout).filter(
        Workout.user_id == current_user.id
    ).count()

    # Calculate streak achievement
    workout_dates = (
        db.query(Workout.workout_date)
        .filter(
            Workout.user_id == current_user.id,
            Workout.workout_date <= date.today()
        )
        .distinct()
        .order_by(Workout.workout_date.desc())
        .all()
    )

    dates = [item[0] for item in workout_dates]
    streak_count = calculate_streak(dates)

    # Calculate completed goals
    completed_goals = db.query(Goal).filter(
        Goal.user_id == current_user.id,
        Goal.status == "COMPLETED"
    ).count()

    progress_values = {
        "workouts": workout_count,
        "streak": streak_count,
        "goals": completed_goals
    }

    # Award eligible badges without duplicates
    all_badges = db.query(Badge).order_by(Badge.id).all()

    for badge in all_badges:
        achieved_value = progress_values.get(
            badge.requirement_type, 0
        )

        if achieved_value >= badge.requirement_value:
            existing = db.query(UserBadge).filter(
                UserBadge.user_id == current_user.id,
                UserBadge.badge_id == badge.id
            ).first()

            if not existing:
                new_user_badge = UserBadge(
                    user_id=current_user.id,
                    badge_id=badge.id
                )
                db.add(new_user_badge)

    db.commit()

    # Return all badges with earned status
    results = []

    for badge in all_badges:
        user_badge = db.query(UserBadge).filter(
            UserBadge.user_id == current_user.id,
            UserBadge.badge_id == badge.id
        ).first()

        results.append({
            "id": badge.id,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
            "requirement_type": badge.requirement_type,
            "requirement_value": badge.requirement_value,
            "earned": user_badge is not None,
            "earned_at": (
                user_badge.earned_at if user_badge else None
            )
        })

    return {
        "total_badges": len(results),
        "earned_badges": sum(
            1 for item in results if item["earned"]
        ),
        "badges": results
    }
