from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.auth import auth_router
from app.routes.tickets import ticket_router

app = FastAPI(debug=True)

# Routers
main_route = APIRouter(prefix="/api/v1")
main_route.include_router(ticket_router)
main_route.include_router(auth_router)

app.include_router(main_route)


# Exception Handlers

from fastapi.exceptions import ResponseValidationError
from fastapi.responses import JSONResponse


@app.exception_handler(ResponseValidationError)
async def debug_response_validation_error(request, exc: ResponseValidationError):
    for err in exc.errors():
        __import__("pprint").pprint(err)
    return JSONResponse(
        status_code=500, content={"detail": "response validation failed"}
    )


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
