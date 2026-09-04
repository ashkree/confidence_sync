from fastapi import APIRouter, Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.exceptions.handlers import register_exception_handlers
from app.routes.auth import auth_router
from app.routes.chat import chat_router
from app.routes.documents import document_router
from app.routes.tickets import ticket_router

app = FastAPI(debug=True)

# Exception Handlers
register_exception_handlers(app)

# Routers
main_route = APIRouter(prefix="/api/v1")
main_route.include_router(document_router)
main_route.include_router(ticket_router)
main_route.include_router(auth_router)
main_route.include_router(chat_router)

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


health_router = APIRouter(prefix="/health")


@health_router.get("")
def read_root():
    return {"response": "ok"}


@app.get("/db")
async def read_db(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        await db.commit()
        return {"response": "ok"}
    except Exception as e:
        return {"response": str(e)}


app.include_router(health_router)
