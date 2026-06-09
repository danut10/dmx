from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database connection — update credentials here or via environment variables
# Using user `admin` and password `MyStrongPassword` as requested.
DATABASE_URL = "mysql+pymysql://admin:MyStrongPassword@localhost:3306/dmx"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
