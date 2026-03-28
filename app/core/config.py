import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Personal Finance Tracker API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:hiya%403497@localhost:3306/finance_tracker")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super_secret_key_12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
