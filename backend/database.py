"""データベース接続およびセッション管理モジュール。

SQLAlchemyの設定とセッション提供関数を定義します。
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

# connect_args={"check_same_thread": False} is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """データベースセッションを取得するジェネレータ関数。
    
    リクエストごとにセッションを作成し、終了時にクローズします。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
