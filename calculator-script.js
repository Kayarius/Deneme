class Calculator {
    constructor(previousOperandElement, currentOperandElement, memoryIndicatorElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.memoryIndicatorElement = memoryIndicatorElement;
        this.memory = 0;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
    }

    delete() {
        if (this.currentOperand === '0') return;
        if (this.currentOperand.length === 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

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
                    this.updateDisplay();
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        this.currentOperand = this.roundResult(computation).toString();
        this.operation = undefined;
        this.previousOperand = '';
    }

    roundResult(number) {
        return Math.round(number * 100000000) / 100000000;
    }

    percentage() {
        const current = parseFloat(this.currentOperand);
        if (isNaN(current)) return;
        this.currentOperand = (current / 100).toString();
    }

    memoryAdd() {
        const current = parseFloat(this.currentOperand);
        if (!isNaN(current)) {
            this.memory += current;
            this.updateMemoryIndicator();
        }
    }

    memorySubtract() {
        const current = parseFloat(this.currentOperand);
        if (!isNaN(current)) {
            this.memory -= current;
            this.updateMemoryIndicator();
        }
    }

    memoryRecall() {
        if (this.memory !== 0) {
            this.currentOperand = this.memory.toString();
        }
    }

    memoryClear() {
        this.memory = 0;
        this.updateMemoryIndicator();
    }

    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicatorElement.textContent = `M: ${this.getDisplayNumber(this.memory)}`;
        } else {
            this.memoryIndicatorElement.textContent = '';
        }
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
        if (this.operation != null) {
            this.previousOperandElement.textContent =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }
}

// Elements
const previousOperandElement = document.querySelector('.previous-operand');
const currentOperandElement = document.querySelector('.current-operand');
const memoryIndicatorElement = document.querySelector('.memory-indicator');

const calculator = new Calculator(previousOperandElement, currentOperandElement, memoryIndicatorElement);

// Number buttons
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Operator buttons
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

// Action buttons
document.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;

        switch(action) {
            case 'clear':
                calculator.clear();
                break;
            case 'delete':
                calculator.delete();
                break;
            case 'percent':
                calculator.percentage();
                break;
            case 'equals':
                calculator.compute();
                break;
        }

        calculator.updateDisplay();
    });
});

// Memory buttons
document.querySelectorAll('[data-memory]').forEach(button => {
    button.addEventListener('click', () => {
        const memoryAction = button.dataset.memory;

        switch(memoryAction) {
            case 'add':
                calculator.memoryAdd();
                break;
            case 'subtract':
                calculator.memorySubtract();
                break;
            case 'recall':
                calculator.memoryRecall();
                break;
            case 'clear':
                calculator.memoryClear();
                break;
        }

        calculator.updateDisplay();
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }

    if (e.key === '+' || e.key === '-') {
        calculator.chooseOperation(e.key);
        calculator.updateDisplay();
    }

    if (e.key === '*') {
        calculator.chooseOperation('×');
        calculator.updateDisplay();
    }

    if (e.key === '/') {
        e.preventDefault();
        calculator.chooseOperation('÷');
        calculator.updateDisplay();
    }

    if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
        calculator.updateDisplay();
    }

    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }

    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }

    if (e.key === '%') {
        calculator.percentage();
        calculator.updateDisplay();
    }
});
