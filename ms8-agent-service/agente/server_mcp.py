

import asyncio
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator, List, Optional, Dict, Any
from datetime import datetime

import asyncpg
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP, Context

# --- 1. Modelos de Datos (Pydantic) para Salida Estructurada ---
# Reflejan la estructura de tablas de la base de datos.

class Product(BaseModel):
    id: int
    name: str
    category: str
    price: int
    ingredients: str
    content: str



# --- 2. Contexto y Ciclo de Vida del Servidor con PostgreSQL ---
# Esto gestiona el "pool" de conexiones a la base de datos.
@dataclass
class AppContext:
    db_pool: asyncpg.Pool

@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    print("Conectando a la base de datos PostgreSQL...")
    try:
        pool = await asyncpg.create_pool(
            user="postgres",
            password="2025",
            database="market",
            host="localhost",
        )
        print("Pool de conexiones a PostgreSQL creado.")
        yield AppContext(db_pool=pool)
    finally:
        if 'pool' in locals() and pool:
            await pool.close()
            print("🔌 Pool de conexiones a PostgreSQL cerrado.")

# --- 3. Creación del Servidor MCP ---
mcp = FastMCP("BankTransactionServer", lifespan=app_lifespan)

# --- 4. Definición de Herramientas para Transacciones Bancarias ---
# Cada herramienta usa el pool de conexiones para interactuar con la DB.

@mcp.tool()
async def get_all_products(ctx: Context) -> List[Product]:
    """
    Devuelve todos los productos registrados en el sistema.
    """
    pool: asyncpg.Pool = ctx.request_context.lifespan_context.db_pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM products")
        return [Product(**row) for row in rows]

@mcp.tool()
async def get_products_by_id(id: int, ctx: Context) -> List[Product]:
    """
    Devuelve todos un producto registrado en el sistema mediante su ID.
    """
    pool: asyncpg.Pool = ctx.request_context.lifespan_context.db_pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM products WHERE id = $1", id)
        return [Product(**row) for row in rows]


# --- 5. Ejecución del Servidor ---
if __name__ == "__main__":
    print(" Iniciando servidor MCP con conexión a PostgreSQL...")
    mcp.run()