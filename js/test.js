//MADE BY GPT행님 :):):)

const quizContainer = document.querySelector('.quiz-container');
const form = document.getElementById('submit-form')
const timerDisplay = document.getElementById('timer');

let combinedData = [];
let timeLeft = 20 * 60; // 20 minutes in seconds

// Fisher–Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 타이머 함수
function startTimer() {
    const interval = setInterval(() => {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `남은 시간 - ${minutes}:${seconds}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(interval);
            alert('시간이 종료되었습니다! 제출합니다.');
            form.requestSubmit();
        }
    }, 1000);
}

// 퀴즈 문제 생성
function generateQuiz(data1, dataG1) {
    const fullQuiz = [...shuffle(data1).slice(0, 20), ...shuffle(dataG1).slice(0, 5)];

    fullQuiz.forEach((q, i) => {
        const isG1 = i >= 20;
        const questionNumber = i + 1;

        const quizBlock = document.createElement('div');
        quizBlock.className = 'quiz-sentence';
        if (isG1) quizBlock.classList.add('g1-question');

        // input 엘리먼트를 HTML 문자열로 준비
        const inputHTML = `<input type="text" id="answer${i}" data-answer1="${q.ANSWER1}" data-answer2="${q.ANSWER2}" class="underline">`;

        // "_________" 자리를 <input>으로 교체
        const engWithInput = q.ENGLISH.replace(/_+/, inputHTML);

        const sentenceP = document.createElement('p');
        sentenceP.innerHTML = `<strong>Q${questionNumber}.</strong> ${engWithInput}`;

        const koreanP = document.createElement('p');
        koreanP.textContent = q.KOREAN;

        quizBlock.appendChild(sentenceP);
        quizBlock.appendChild(koreanP);
        quizContainer.appendChild(quizBlock);
    });
}




// CSV 불러오기
async function loadCSV() {
    const [res1, res2] = await Promise.all([
        fetch('data.csv').then(r => r.text()),
        fetch('data-G1.csv').then(r => r.text())
    ]);

    const rows1 = Papa.parse(res1, { header: true, skipEmptyLines: true }).data;
    const rows2 = Papa.parse(res2, { header: true, skipEmptyLines: true }).data;

    generateQuiz(rows1, rows2); // 두 개 따로 전달
    startTimer();
}


loadCSV();

// 제출 시 정답 처리
form.addEventListener('submit', function (e) {
    e.preventDefault();
    let correct = 0;
    const wrong = [];

    combinedData.forEach((q, i) => {
        const input = document.getElementById(`answer${i}`);
        const userAns = input.value.trim();
        const ans1 = input.dataset.answer1;
        const ans2 = input.dataset.answer2;

        if (userAns === ans1 || (ans2 && userAns === ans2)) {
            correct++;
        } else {
            q.WRONG = userAns;
            wrong.push(q);
        }
    });

    sessionStorage.setItem('correct', JSON.stringify(correct));
    sessionStorage.setItem('wrong', JSON.stringify(wrong));
    window.location.href = 'review.html';
});
