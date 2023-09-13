from flask import Flask, request, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/getDATA", methods=["GET"])
def sendData():
    try:
        print(request.args["DB"])
        path = "./db/" + request.args["DB"] + ".json"
        data = open(path, "r").read()
        response = app.response_class(
            response=data,
            status=200,
            mimetype='application/json'
        )
        return response
    except FileNotFoundError:
        abort(404) 

if __name__ == "__main__":
    print("API de backend de l'extension chrome CtrlConverter")
    app.run(host="0.0.0.0", port=16384)
