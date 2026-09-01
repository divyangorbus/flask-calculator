from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

ALLOWED_OPS = {"+", "-", "*", "/"}


def calculate(left: float, right: float, op: str) -> float:
    if op == "+":
        return left + right
    if op == "-":
        return left - right
    if op == "*":
        return left * right
    if op == "/":
        if right == 0:
            raise ZeroDivisionError("Cannot divide by zero")
        return left / right
    raise ValueError("Unsupported operator")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def api_calculate():
    data = request.get_json(silent=True) or {}
    op = data.get("op")
    if op not in ALLOWED_OPS:
        return jsonify({"ok": False, "error": "Choose +, -, ×, or ÷."}), 400

    try:
        left = float(data.get("left"))
        right = float(data.get("right"))
        result = calculate(left, right, op)
    except (TypeError, ValueError):
        return jsonify({"ok": False, "error": "Enter valid numbers."}), 400
    except ZeroDivisionError:
        return jsonify({"ok": False, "error": "Cannot divide by zero."}), 400

    if result == int(result) and abs(result) < 1e15:
        display = str(int(result))
    else:
        display = format(result, ".12g")

    return jsonify({"ok": True, "result": result, "display": display})


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
