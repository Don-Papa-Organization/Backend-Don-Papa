import asyncio
import sys
import os

from dotenv import load_dotenv
load_dotenv()

from mirascope import llm, BaseTool
from pydantic import Field
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# --- 1. Definición de Herramientas
class GetAllProducts(BaseTool):
    """ Útiliza esta herramienta para saber cuáles productos hay en el catálogo de la tienda."""
    def call(self) -> str:
        return "Herramienta 'GetAllProducts' seleccionada."

class GetProductById(BaseTool):
    """ Útiliza esta herramienta para obtener un producto mediante su ID"""
    def call(self) -> str:
        return "Herramienta 'GetProductById' seleccionada."



# --- 2. Mapeo de Herramientas
TOOL_NAME_MAP = {
    "GetAllProducts": "get_all_products",
    "GetProductById": "get_products_by_id"
}

# --- 3. Función de llamada al LLM
@llm.call(
    "google",
    model="gemini-2.5-pro",
    tools=[
        GetAllProducts,
        GetProductById
    ],
)
def get_user_intent(query: str):
    """
    ¡Eres un asistente de una tienda en línea!
    1.  Analiza la petición del usuario.
    2.  Si la petición del usuario coincide EXACTA y EXPLÍCITAMENTE con la descripción de una de las herramientas disponibles, llama a esa herramienta.
    3.  Si la petición NO coincide con ninguna herramienta (por ejemplo, si te preguntan por canciones, el clima, o te saludan entre otros temas), tu ÚNICA respuesta debe ser: 
        "Lo siento, no puedo procesar esa solicitud. Mi única función es ayudarte a obtener todos los productos del catálogo. Puedes intentarlo diciendo 'dame todos los productos'."
    No intentes tener una conversación. No ofrezcas información que no provenga directamente de una herramienta. Tu propósito es únicamente seleccionar una herramienta o dar la respuesta de error predefinida.
    """
    return query

# --- 4. Lógica Principal del Cliente
async def main(prompt):
    server_params = StdioServerParameters(command=sys.executable, args=["server_mcp.py"])

    print("Cliente MarketPlace MCP (usando Gemini) iniciado. Escribe 'salir' para terminar.")
    print("Ejemplos: 'cuáles productos hay?'")

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
                await session.initialize()
                try:
                    response = get_user_intent(prompt)
                    
                    if tool := response.tool:
                        tool_call_info = tool.tool_call
                        tool_name = tool_call_info.name
                        tool_args = tool_call_info.args

                        tool_name_on_server = TOOL_NAME_MAP.get(tool_name)
                        
                        if not tool_name_on_server:
                             print(f" Error: El LLM devolvió una herramienta desconocida: {tool_name}")
                             

                        print(f" LLM decidió llamar a la herramienta '{tool_name_on_server}' con argumentos: {tool_args}")
                        
                        result = await session.call_tool(tool_name_on_server, arguments=tool_args)

                        if result.isError:
                            print(f"Error del servidor: {result.content}")
                        elif result.structuredContent:
                            print("xxxxxxxxxxxxxxx")
                            print("Respuesta del servidor:")
                            f = result.structuredContent
                            f["tool"] = tool_name_on_server
                            return result.structuredContent
                        else:
                            print("///////////////////")
                            return result.content
                    else:
                        return  response.content
                except Exception as e:
                    print(f"Ha ocurrido un error inesperado: {e}")

    print("\n Cliente desconectado. ¡Adiós!")