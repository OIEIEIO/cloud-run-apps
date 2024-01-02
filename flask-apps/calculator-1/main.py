from flask import Flask, jsonify, render_template, request
import math
import ast
import operator

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("calculate.html")

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json(force=True)
    expression = data.get('expression', "")
    expression = preprocess_expression(expression)

    try:
        # Evaluate the expression using the modified eval_ast
        result = eval_ast(ast.parse(expression, mode='eval').body)
    except Exception as e:
        return jsonify(result=f"Error: {str(e)}"), 400

    return jsonify(result=str(result))

def preprocess_expression(expression):
    # Handle square root and power symbols for Python syntax
    expression = expression.replace('√', 'math.sqrt')
    expression = expression.replace('^', '**')
    # Handle percentage symbol
    expression = expression.replace('%', '/100')
    return expression

def eval_ast(node):
    # Define allowed operators and math functions
    allowed_operators = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
        ast.Pow: operator.pow
    }

    allowed_functions = {
        'sqrt': math.sqrt,
        'pow': math.pow
    }

    if isinstance(node, ast.Expression):
        return eval_ast(node.body)
    elif isinstance(node, ast.Num):
        return node.n
    elif isinstance(node, ast.BinOp) and type(node.op) in allowed_operators:
        left = eval_ast(node.left)
        right = eval_ast(node.right)
        return allowed_operators[type(node.op)](left, right)
    elif isinstance(node, ast.UnaryOp) and isinstance(node.op, ast.USub):
        return -eval_ast(node.operand)
    elif isinstance(node, ast.Call):
        if not isinstance(node.func, ast.Name) or node.func.id not in allowed_functions:
            raise ValueError(f"Unsupported function: {ast.dump(node)}")
        func = allowed_functions[node.func.id]
        args = [eval_ast(arg) for arg in node.args]
        return func(*args)
    else:
        raise ValueError(f"Unsupported operation: {ast.dump(node)}")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=True)

