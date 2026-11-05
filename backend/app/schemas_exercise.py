from pydantic import BaseModel, ConfigDict, Field


class ExerciseCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    category: str = Field(..., pattern="^(Cardio|Strength|Yoga)$")
    description: str | None = Field(default=None, max_length=500)
    duration: int = Field(..., gt=0, le=300)


class ExerciseOut(BaseModel):
    id: int
    name: str
    category: str
    description: str | None
    duration: int

    model_config = ConfigDict(from_attributes=True)