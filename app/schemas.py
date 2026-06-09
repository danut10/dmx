from pydantic import BaseModel, constr
from typing import Optional


class ProjectBase(BaseModel):
    code: constr(max_length=5)
    name: constr(max_length=100)
    descr: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    code: Optional[constr(max_length=5)] = None
    name: Optional[constr(max_length=100)] = None


class ProjectOut(ProjectBase):
    id: int

    class Config:
        orm_mode = True


class CandidateBase(BaseModel):
    name: constr(max_length=100)


class CandidateCreate(CandidateBase):
    pass


class CandidateUpdate(BaseModel):
    name: Optional[constr(max_length=100)] = None


class CandidateOut(CandidateBase):
    id: int

    class Config:
        orm_mode = True
