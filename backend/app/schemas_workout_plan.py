from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class WorkoutPlanCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    scheduled_date: date


class WorkoutPlanUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=500)
    scheduled_date: date | None = None


class WorkoutPlanOut(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    scheduled_date: date
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)