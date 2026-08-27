"""データベース接続およびセッション管理モジュール。

SQLAlchemyの設定とセッション提供関数を定義します。
"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from config import settings

# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    """データベースセッションを取得するジェネレータ関数。
    
    リクエストごとにセッションを作成し、終了時にクローズします。
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
