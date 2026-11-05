from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models import WorkoutPlan
from ..schemas_workout_plan import (
    WorkoutPlanCreate,
    WorkoutPlanUpdate,
    WorkoutPlanOut,
)


router = APIRouter(
    prefix="/workout-plans",
    tags=["Workout Plans"]
)


# Create Workout Plan
@router.post(
    "/",
    response_model=WorkoutPlanOut,
    status_code=status.HTTP_201_CREATED
)
def create_workout_plan(
    plan: WorkoutPlanCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_plan = WorkoutPlan(
        user_id=current_user.id,
        title=plan.title,
        description=plan.description,
        scheduled_date=plan.scheduled_date
    )

    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)

    return new_plan


# List All Workout Plans
@router.get("/", response_model=list[WorkoutPlanOut])
def list_workout_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(WorkoutPlan)
        .filter(WorkoutPlan.user_id == current_user.id)
        .order_by(WorkoutPlan.scheduled_date.asc())
        .all()
    )


# View Upcoming Workout Plans
@router.get("/upcoming", response_model=list[WorkoutPlanOut])
def upcoming_workout_plans(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.user_id == current_user.id,
            WorkoutPlan.scheduled_date >= date.today()
        )
        .order_by(WorkoutPlan.scheduled_date.asc())
        .all()
    )


# Update Workout Plan
@router.patch("/{plan_id}", response_model=WorkoutPlanOut)
def update_workout_plan(
    plan_id: int,
    plan: WorkoutPlanUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
        .first()
    )

    if not existing_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    update_data = plan.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(existing_plan, key, value)

    db.commit()
    db.refresh(existing_plan)

    return existing_plan


# Delete Workout Plan
@router.delete("/{plan_id}")
def delete_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_plan = (
        db.query(WorkoutPlan)
        .filter(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id
        )
        .first()
    )

    if not existing_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workout plan not found"
        )

    db.delete(existing_plan)
    db.commit()

    return {"message": "Workout plan deleted successfully"}