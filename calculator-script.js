class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
        this.updateDisplay();
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
        this.updateDisplay();
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand + ' ' + operation;
        this.currentOperand = '0';
        this.updateDisplay();
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(current)) return;
        if (isNaN(prev) && this.operation !== '%') return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert('Sıfıra bölme hatası!');
                    this.clear();
                    return;
                }
                computation = prev / current;
                break;
            case '%':
                computation = current / 100;
                break;
            default:
                return;
        }

        this.currentOperand = this.roundNumber(computation).toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.updateDisplay();
    }

    roundNumber(number) {
        return Math.round(number * 100000000) / 100000000;
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;

        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('tr-TR', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        this.previousOperandElement.textContent = this.previousOperand;
    }
}

const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');

const calculator = new Calculator(previousOperandElement, currentOperandElement);

document.addEventListener('keydown', (event) => {
    if (event.key >= '0' && event.key <= '9') {
        calculator.appendNumber(event.key);
    } else if (event.key === '.') {
        calculator.appendNumber('.');
    } else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculator.compute();
    } else if (event.key === 'Escape') {
        calculator.clear();
    } else if (event.key === 'Backspace') {
        calculator.delete();
    } else if (event.key === '+') {
        calculator.chooseOperation('+');
    } else if (event.key === '-') {
        calculator.chooseOperation('-');
    } else if (event.key === '*') {
        calculator.chooseOperation('×');
    } else if (event.key === '/') {
        event.preventDefault();
        calculator.chooseOperation('÷');
    } else if (event.key === '%') {
        calculator.chooseOperation('%');
    }
});
