from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_user
from ..models import Exercise
from ..schemas_exercise import ExerciseCreate, ExerciseOut


router = APIRouter(
    prefix="/exercises",
    tags=["Exercise Library"]
)


# Add New Exercise
@router.post("/", response_model=ExerciseOut, status_code=status.HTTP_201_CREATED)
def create_exercise(
    exercise: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_exercise = Exercise(
        name=exercise.name,
        category=exercise.category,
        description=exercise.description,
        duration=exercise.duration
    )

    db.add(new_exercise)
    db.commit()
    db.refresh(new_exercise)

    return new_exercise


# List and Search Exercises
@router.get("/", response_model=list[ExerciseOut])
def list_exercises(
    search: str | None = Query(default=None, min_length=1),
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Exercise)

    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))

    if category:
        if category not in ["Cardio", "Strength", "Yoga"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid exercise category"
            )

        query = query.filter(Exercise.category == category)

    return query.order_by(Exercise.name.asc()).all()


# Delete Exercise
@router.delete("/{exercise_id}")
def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    exercise = (
        db.query(Exercise)
        .filter(Exercise.id == exercise_id)
        .first()
    )

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )

    db.delete(exercise)
    db.commit()

    return {"message": "Exercise deleted successfully"}