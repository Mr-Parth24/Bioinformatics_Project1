from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import analyze
import export

project = FastAPI()

# so react can call the api from localhost
project.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

project.include_router(analyze.router, prefix="/api")
project.include_router(export.router, prefix="/api")

@project.get("/")
def read_root():
    return {"message": "server is running"}
