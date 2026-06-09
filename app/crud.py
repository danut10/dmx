from sqlalchemy.orm import Session
from . import models, schemas


def get_projects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Project).offset(skip).limit(limit).all()


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(code=project.code, name=project.name, descr=project.descr)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def update_project(db: Session, db_project: models.Project, project_update: schemas.ProjectUpdate):
    if project_update.code is not None:
        db_project.code = project_update.code
    if project_update.name is not None:
        db_project.name = project_update.name
    db.commit()
    db.refresh(db_project)
    return db_project


def delete_project(db: Session, project_id: int):
    db_project = get_project(db, project_id)
    if not db_project:
        return False
    db.delete(db_project)
    db.commit()
    return True


def get_candidates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Candidate).offset(skip).limit(limit).all()


def get_candidate(db: Session, candidate_id: int):
    return db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()


def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    db_candidate = models.Candidate(name=candidate.name)
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def update_candidate(db: Session, db_candidate: models.Candidate, candidate_update: schemas.CandidateUpdate):
    if candidate_update.name is not None:
        db_candidate.name = candidate_update.name
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def delete_candidate(db: Session, candidate_id: int):
    db_candidate = get_candidate(db, candidate_id)
    if not db_candidate:
        return False
    db.delete(db_candidate)
    db.commit()
    return True
