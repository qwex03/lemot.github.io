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
    const MAX_TRIES = 6; 

    let currentRow = 0; 

    inputs[0].focus();

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
                    } else if (Index === MAX_TRIES - 1) {
                        setTimeout(() => {
                            alert(`😞 Perdu ! Le mot était : ${word.join("")}`);
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

            if (rowIndex !== currentRow) {
                this.value = '';
                inputs[currentRow * 5].focus();
                return;
            }

            if (this.value.length >= 1) {
                let nextInput = inputs[index + 1];
                if (nextInput && Math.floor((index + 1) / 5) === rowIndex) {
                    nextInput.focus();
                }
            }
        });

        input.addEventListener('keyup', function(event) {  
            let rowIndex = Math.floor(index / 5);

            if (rowIndex !== currentRow) {
                event.preventDefault();
                inputs[currentRow * 5].focus();
                return;
            }

            if (event.key === 'Backspace' && this.value.length === 0) {
                let previousInput = inputs[index - 1];
                if (previousInput && Math.floor((index - 1) / 5) === currentRow) {
                    previousInput.focus();
                }
            }

            if (event.key === 'Enter') {
                lockedRows.add(currentRow);

                let letters = getRowValues(currentRow);
                VerifyWord(currentRow, letters);

                currentRow++;  

                if (currentRow < MAX_TRIES) {
                    inputs[currentRow * 5].focus();
                }
            }
        });
    });
})();
