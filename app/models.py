from sqlalchemy import Column, Integer, String, Text
from .db import Base


class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(5), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    descr = Column(Text, nullable=True)


class Candidate(Base):
    __tablename__ = "candidates"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
