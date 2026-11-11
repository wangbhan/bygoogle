import os
import re
from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, Field, field_validator


@asynccontextmanager
async def lifespan(app: FastAPI):
    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url and not all(os.environ.get(key) for key in ("PGHOST", "PGDATABASE", "PGUSER")):
        raise RuntimeError("请设置 DATABASE_URL 或 PostgreSQL 的 PGHOST、PGDATABASE、PGUSER 环境变量")

    async with await psycopg.AsyncConnection.connect(database_url, connect_timeout=5) as connection:
        await connection.execute("""
            CREATE TABLE IF NOT EXISTS inquiries (
                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                name VARCHAR(60) NOT NULL,
                company VARCHAR(120) NOT NULL,
                contact VARCHAR(160) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)
    app.state.database_url = database_url
    yield


app = FastAPI(title="迈谷科技咨询服务", lifespan=lifespan)


class Inquiry(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=60)
    company: str = Field(min_length=1, max_length=120)
    contact: str = Field(min_length=5, max_length=160)
    message: str = Field(min_length=1, max_length=2000)

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, value: str) -> str:
        email = re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value)
        phone = re.fullmatch(r"\+?[0-9() -]+", value)
        digits = sum(char.isdigit() for char in value)
        if email or (phone and 7 <= digits <= 15):
            return value
        raise ValueError("请输入有效的电话号码或邮箱")


class InquiryReceipt(BaseModel):
    id: int


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/inquiries", status_code=status.HTTP_201_CREATED)
async def create_inquiry(inquiry: Inquiry, request: Request) -> InquiryReceipt:
    try:
        async with await psycopg.AsyncConnection.connect(
            request.app.state.database_url, connect_timeout=5
        ) as connection:
            cursor = await connection.execute(
                "INSERT INTO inquiries (name, company, contact, message) VALUES (%s, %s, %s, %s) RETURNING id",
                (inquiry.name, inquiry.company, inquiry.contact, inquiry.message),
            )
            inquiry_id, = await cursor.fetchone()
    except psycopg.OperationalError as exc:
        raise HTTPException(status_code=503, detail="数据库暂时不可用，请稍后重试") from exc

    return InquiryReceipt(id=inquiry_id)
