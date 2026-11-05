
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func

from ..database import Base


class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    badge_id = Column(
        Integer,
        ForeignKey("badges.id"),
        nullable=False,
        index=True
    )

    earned_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
