"""データベースモデル定義モジュール。

SQLAlchemyのORMモデルを定義します。
"""

from sqlalchemy import Column, Integer, String

from database import Base


class Item(Base):
    """アイテムを表すデータベースモデル。"""
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
