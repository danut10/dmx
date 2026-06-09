# DMX — Recruitment app (FastAPI)

Minimal FastAPI application for managing Projects and Candidates.

Prerequisites
- Python 3.10+
- MySQL server with a database `dmx` available at `localhost:3306`

Default DB connection is configured in `app/db.py` as:

```
mysql+pymysql://admin:MyStrongPassword@localhost:3306/dmx
```

Note: update credentials in `app/db.py` or switch to environment variables for production.

Install dependencies (recommended inside a virtualenv):

```bash
pip install -r requirements_fastapi.txt
```

Run the application:

```bash
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000 in your browser. API endpoints are under `/api/*`.

Next steps
- Consider moving DB credentials to environment variables.
- Add Alembic for migrations.
