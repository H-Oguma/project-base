"""データベースモデル定義モジュール。

SQLAlchemyのORMモデルを定義します。
"""

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Item(Base):
    """アイテムを表すデータベースモデル。"""

    __tablename__ = "items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str] = mapped_column(String, index=True)
