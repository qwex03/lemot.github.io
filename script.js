let board = document.querySelector('.board');
let word = [];
let lockedRows = new Set();


const toggleBtn = document.querySelector('#toggle-theme');

toggleBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.dataset.theme !== 'light';

    html.dataset.theme = isDark ? 'light' : 'dark';
    toggleBtn.textContent = isDark ? '☀️' : '🌙';
});

async function RandomWord() {
    try {
        let response = await fetch('https://random-words-api.kushcreates.com/api?language=fr&length=5&words=1');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        let data = await response.json();
        
        if (data.length > 0) {
            word = data[0].word.toUpperCase().split('');
        } else {
            console.error("No word returned from API");
        }
    } catch (error) {
        console.error("Error fetching random word:", error);
    }
}

function createBoard() {
    for (let i = 0; i < 6; i++) {
        let row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < 5; j++) {
            let input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            row.appendChild(input);
        }
        board.appendChild(row);
    }
}

function getRowValues(rowIndex) {
    let row = document.querySelectorAll('.row')[rowIndex];
    let values = Array.from(row.querySelectorAll('input')).map(input => input.value.toUpperCase());
    return values;
}


(async () => {
    await RandomWord();
    createBoard();

    let inputs = document.querySelectorAll('input');

    function VerifyWord(Index, Letters) { 
        let correctCount = 0;

        for (let i = 0; i < Letters.length; i++) { 
            setTimeout(() => {
                if (Letters[i] === word[i]) {
                    inputs[Index * 5 + i].classList.add('good');
                    correctCount++;
                } else if (word.includes(Letters[i])) {
                    inputs[Index * 5 + i].classList.add('partial');
                }

                if (i === Letters.length - 1) {
                    if (correctCount === word.length) {
                        setTimeout(() => {
                            alert("🎉 Bravo, tu as gagné !");
                            inputs.forEach(inp => inp.disabled = true); 
                        }, 200);
                    }
                }
            }, i * 150);
        }
    }



    inputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            let rowIndex = Math.floor(index / 5);

            if (lockedRows.has(rowIndex)) {
                this.value = ''; 
                return;
            }

            if (this.value.length >= 1) {
                let nextInput = inputs[index + 1];
                if (nextInput && Math.floor((index + 1) / 5) === rowIndex) {
                    nextInput.focus();
                }
            }
        });

        input.addEventListener('keydown', function(event) {
            let rowIndex = Math.floor(index / 5);
            let colIndex = index % 5;

            if (lockedRows.has(rowIndex)) {
                event.preventDefault();
                return;
            }

            if (event.key === 'Backspace' && this.value.length === 0) {
                let previousInput = inputs[index - 1];
                if (previousInput && !lockedRows.has(Math.floor((index - 1) / 5))) {
                    previousInput.focus();
                }
            }

            if (event.key === 'Enter') {
                lockedRows.add(rowIndex);                
                
                let letters = getRowValues(rowIndex);
                console.log("Ligne " + rowIndex + " :", letters);

                VerifyWord(rowIndex, letters);
                
                let nextRowFirstInput = inputs[(rowIndex + 1) * 5];
                if (nextRowFirstInput) {
                    nextRowFirstInput.focus();
                }
            }
        });
    });
})();
