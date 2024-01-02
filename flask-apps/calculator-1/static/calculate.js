document.addEventListener('DOMContentLoaded', function() {
    const entryScreen = document.getElementById('entry');
    const solutionScreen = document.getElementById('solution');
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const buttonValue = this.getAttribute('data-value') || this.innerText;

            if (buttonValue === '=') {
                calculateResult();
            } else if (buttonValue === 'C') {
                entryScreen.textContent = '0';
                solutionScreen.textContent = '';
            } else if (buttonValue === 'DEL') {
                entryScreen.textContent = entryScreen.textContent.slice(0, -1) || '0';
            } else {
                if (entryScreen.textContent === '0') {
                    entryScreen.textContent = buttonValue;
                } else {
                    entryScreen.textContent += buttonValue;
                }
            }
        });
    });

    function calculateResult() {
        let expression = entryScreen.textContent;
    
        expression = expression.replace(/√/g, 'sqrt(');

        // Add a closing parenthesis for every opening parenthesis
        let openParens = (expression.match(/\(/g) || []).length;
        let closeParens = (expression.match(/\)/g) || []).length;
        expression += ')'.repeat(openParens - closeParens);  // Close all open parentheses
        
        // Correctly format the expression for square root and square
        expression = formatExpressionForBackend(expression);
    
        // Send the expression to the backend
        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ expression: expression }),
        })
        .then(response => response.json())
        .then(data => {
            solutionScreen.textContent = data.result;
        })
        .catch(error => {
            solutionScreen.textContent = 'Error';
        });
    }
    
    function formatExpressionForBackend(expression) {
        // Replace the front-end symbol for square root and square
        expression = expression.replace(/√/g, 'sqrt('); // Assume every sqrt symbol is followed by a number and therefore add an open parenthesis
        expression = expression.replace(/x²/g, '**2');
    
        // Add closing parenthesis for functions like sqrt that need it
        let openParens = (expression.match(/\(/g) || []).length;
        let closeParens = (expression.match(/\)/g) || []).length;
        while(openParens > closeParens) {
            expression += ')';
            closeParens++;
        }
    
        return expression.replace(/\^/g, '**');
    }
});