from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import auth_router
from app.routes.tickets import ticket_router

app = FastAPI()

# Routers
main_route = APIRouter(prefix="/api/v1")
main_route.include_router(ticket_router)
main_route.include_router(auth_router)

app.include_router(main_route)


# Middleware
origins = [
    "http://localhost:5173",  # Default Vite port
]

app.add_middleware(
    CORSMiddleware, allow_origins=origins, allow_methods=["*"], allow_headers=["*"]
)


@app.get("/health")
def read_root():
    return {"response": "ok"}
