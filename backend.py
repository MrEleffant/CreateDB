import os
from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file, send_from_directory, safe_join, abort
from flask_cors import CORS
import json
import datetime

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
    app.run(host="0.0.0.0", port=4000)
