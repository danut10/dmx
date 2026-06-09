from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse

from jinja2 import Environment, FileSystemLoader, select_autoescape

from .db import engine, Base
from .routers import projects, candidates

app = FastAPI(title="DMX Recruitment")

# create tables if they don't exist
Base.metadata.create_all(bind=engine)

app.mount("/static", StaticFiles(directory="app/static"), name="static")

app.include_router(projects.router)
app.include_router(candidates.router)

# server-side Jinja2 environment
jinja_env = Environment(
    loader=FileSystemLoader("app/templates"),
    autoescape=select_autoescape(["html", "xml"]),
)


def _render_template(name: str, **context) -> HTMLResponse:
    tpl = jinja_env.get_template(name)
    content = tpl.render(**context)
    return HTMLResponse(content)


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return _render_template("index.html")


@app.get("/projects", response_class=HTMLResponse)
def projects_page(request: Request):
    return _render_template("projects.html")


@app.get("/candidates", response_class=HTMLResponse)
def candidates_page(request: Request):
    return _render_template("candidates.html")


# Add pages for creating new entities
@app.get('/project/add', response_class=HTMLResponse)
def project_add(request: Request):
    return _render_template('project_add.html')


@app.get('/candidate/add', response_class=HTMLResponse)
def candidate_add(request: Request):
    return _render_template('candidate_add.html')


# Project view/edit pages
@app.get('/project/view/{project_id}', response_class=HTMLResponse)
def project_view(project_id: int, request: Request):
    return _render_template('project_view.html')


@app.get('/project/edit/{project_id}', response_class=HTMLResponse)
def project_edit(project_id: int, request: Request):
    return _render_template('project_edit.html')


# Candidate view/edit pages
@app.get('/candidate/view/{candidate_id}', response_class=HTMLResponse)
def candidate_view(candidate_id: int, request: Request):
    return _render_template('candidate_view.html')


@app.get('/candidate/edit/{candidate_id}', response_class=HTMLResponse)
def candidate_edit(candidate_id: int, request: Request):
    return _render_template('candidate_edit.html')