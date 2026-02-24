from flask import Flask, request
from flask_cors import CORS
from client_mcp import main

app = Flask(__name__)
CORS(app)

@app.route("/query", methods=["POST"])
async def leer_consulta():
    datos = request.get_json()
    if not datos or "consulta" not in datos:
        return {"error": "El cuerpo de la solicitud debe ser un JSON con la clave 'consulta'"}, 400
    
    resultado = await main(datos.get("consulta"))
    
    return {"data": resultado}

if __name__ == "__main__":
    app.run(debug=True)