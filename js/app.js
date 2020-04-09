// BUDGET CONTROLLER
var budgetController = (function () { 

    // Constructor Function for Income Object
    var Income = function (id, description, value) {  
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Constructor Function for Expenses Object
    var Expense = function (id, description, value) {  
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {  
        var sum=0;
        data.allItems[type].forEach(el => {
            sum += el.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: '--'
    };

    return {
        addItem: function (type, des, val) {  
            var newItem, ID;

            // Create New ID
            if (data.allItems[type].length == 0) ID=0
            else ID = data.allItems[type][data.allItems[type].length-1].id+1;

            // Create new items based on type
            if (type == 'inc') newItem = new Income(ID, des, val);
            else newItem = new Expense(ID, des, val);

            // Push data to out data structure
            data.allItems[type].push(newItem);
            // If we add incomes and expenses from here, when a data is removes, we have to subtract that data! So we calculate all the data once from the data list with private function in public function calculateBudget()

            // Return New Element
            return newItem;
        },

        calculateBudget: function () {  
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate the percentage of income that we spent
            if (data.totals.inc >= 0) data.percentage = Math.round(data.totals.exp / data.totals.inc * 100.0) + '%';
            else data.percentage = '---';
        },

        getBudget: function () {  
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        test: function () {  
            console.log(data);
        }
    }

})();



// UI CONTROLLER
var UIController = (function () { 

    // Total classes that we use throught the code
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenceslabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage'
    };

    return {
        getInput: function () { 
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) { 
            var html, newHTML;

            // Create HTML string with PlaceHolder text
            if (type == 'inc') html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            else html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document.querySelector(type == 'inc' ? DOMStrings.incomeContainer : DOMStrings.expensesContainer).insertAdjacentHTML('beforeend', newHTML);
        },

        clearFields: function () { 
            var fields; 
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

            fields = Array.prototype.slice.call(fields); // Works without this line + this line converts nodes list to array to use array functions , here, it used to use foreach method which already works on nodes list

            fields.forEach((field, index, array) => {
                field.value = '';
            });
            fields[0].focus();
        },

        displayBudget: function (data) {  
            document.querySelector(DOMStrings.budgetLabel).textContent = data.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = ' + '+data.totalInc;
            document.querySelector(DOMStrings.expenceslabel).textContent =  ' - '+data.totalExp;
            document.querySelector(DOMStrings.percentageLabel).textContent = data.percentage;
        },

        getDOMStrings: function () {  
            return DOMStrings;
        }
    };

})();



// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {  

    var setupEventListeners = function () {  
        var DOM = UICtrl.getDOMStrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (e) {  
            if (e.key == 'Enter' || e.keyCode == 13 || e.which == 13) { // e.keyCode == 13 also can be used
                ctrlAddItem();
            }
        });
    };


    var updateBudget = function () {  
        // Calculate the budget
        budgetCtrl.calculateBudget();

        // Return the budget
        var budget = budgetCtrl.getBudget();

        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    };


    var ctrlAddItem = function () {  

        // Get The Input Data
        var input = UICtrl.getInput();

        // input Validation
        if (input.description !== '' && !isNaN(input.value) && input.value>0) {
            // Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // Clear the fields
            UICtrl.clearFields();

            // Calculate and Update Budget
            updateBudget();
        }
    }

    return {
        init: function () {  
            console.log('Started');
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: '---'
            });
        }
    }
 
})(budgetController, UIController);

controller.init();
