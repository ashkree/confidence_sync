from fastapi import FastAPI

from app.routes.tickets import ticket_router

app = FastAPI()
app.include_router(ticket_router)


@app.get("/health")
def read_root():
    return {"response": "ok"}
