from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from ..database import Base


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String(120), nullable=False)
    description = Column(Text, nullable=True)
    scheduled_date = Column(Date, nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")