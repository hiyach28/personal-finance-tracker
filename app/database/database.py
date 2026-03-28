from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import pymysql

# Provide a way to create the database if it doesn't exist
def create_database_if_not_exists(database_url: str):
    # Example URL: mysql+pymysql://user:pass@host:port/dbname
    import urllib.parse
    parsed = urllib.parse.urlparse(database_url)
    db_name = parsed.path.lstrip("/")
    
    conn_url = database_url.rsplit("/", 1)[0]
    
    try:
        from sqlalchemy import text
        engine = create_engine(conn_url)
        with engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
    except Exception as e:
        print("Error checking or creating database:", e)
        
create_database_if_not_exists(settings.DATABASE_URL)

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
