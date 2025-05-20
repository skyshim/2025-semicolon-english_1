const quizContainer = document.querySelector('.quiz-container');
const form = document.getElementById('submit-form');
const timerDisplay = document.getElementById('timer');

let allQuestions = [];
let timerInterval;
let timeLeft = 20 * 60; // 20분

// 셔플 함수
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 타이머 시작
function startTimer() {
    timerInterval = setInterval(() => {
        const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
        const seconds = String(timeLeft % 60).padStart(2, '0');
        timerDisplay.textContent = `남은 시간 - ${minutes}:${seconds}`;
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timerInterval);
            alert('시간이 종료되었습니다! 자동 제출됩니다.');
            form.requestSubmit();
        }
    }, 1000);
}

// 퀴즈 생성
function generateQuiz(data1, dataGx) {
    const quizData = [...shuffle(data1).slice(0, 20), ...shuffle(dataGx).slice(0, 5)];
    allQuestions = quizData;

    quizData.forEach((q, i) => {
        const inputHTML = `<input type="text" id="answer${i}" data-answer1="${q.ANSWER1}" data-answer2="${q.ANSWER2}" class="underline">`;
        const engWithInput = q.ENGLISH.replace(/_+/, inputHTML);

        const quizBlock = document.createElement('div');
        quizBlock.className = 'quiz-sentence';

        if (i >= 20) {
            quizBlock.style.backgroundColor = '#ffecec'; // 옅은 빨간색
        }

        const sentenceP = document.createElement('p');
        sentenceP.innerHTML = `<strong>Q${i + 1}.</strong> ${engWithInput}`;

        const koreanP = document.createElement('p');
        koreanP.textContent = q.KOREAN;

        quizBlock.appendChild(sentenceP);
        quizBlock.appendChild(koreanP);
        quizContainer.appendChild(quizBlock);
    });
}

// 결과 표시 함수
function displayResult(correctCount, wrongList) {
    const resultBox = document.createElement('div');
    resultBox.className = 'result-box';
    resultBox.innerHTML = `<h3>총점: ${correctCount} / 25</h3>`;

    if (wrongList.length > 0) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.className = 'action-btn';
        summary.textContent = '오답 펼치기';
        details.appendChild(summary);

        wrongList.forEach(({ ENGLISH, KOREAN, ANSWER1, ANSWER2, WRONG }) => {
            const wrongItem = document.createElement('div');
            wrongItem.className = 'wrong-item';
            wrongItem.innerHTML = `
                <p><strong>문제:</strong> ${ENGLISH.replace(/_+/, '_____')}</p>
                <p><strong>내 답:</strong> ${WRONG}</p>
                <p><strong>정답:</strong> ${ANSWER1}${ANSWER2 ? ` / ${ANSWER2}` : ''}</p>
                <p><strong>해석:</strong> ${KOREAN}</p><hr>
            `;
            details.appendChild(wrongItem);
        });

        resultBox.appendChild(details);
    } else {
        resultBox.innerHTML += `<p>모든 문제를 맞췄습니다! 🎉</p>`;
    }

    quizContainer.appendChild(resultBox);
}

// CSV 불러오기
async function loadCSV() {
    const [res1, resGx] = await Promise.all([
        fetch('data.csv').then(r => r.text()),
        fetch('data-G1.csv').then(r => r.text()) // 또는 'data-G2.csv'
    ]);

    const rows1 = Papa.parse(res1, { header: true, skipEmptyLines: true }).data;
    const rowsGx = Papa.parse(resGx, { header: true, skipEmptyLines: true }).data;

    generateQuiz(rows1, rowsGx);
    startTimer();
}

loadCSV();

// 제출 이벤트
form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearInterval(timerInterval);

    let correct = 0;
    const wrong = [];

    allQuestions.forEach((q, i) => {
        const input = document.getElementById(`answer${i}`);
        const userAns = input.value.trim().toLowerCase();
        const ans1 = input.dataset.answer1.toLowerCase();
        const ans2 = input.dataset.answer2?.toLowerCase();

        const checkCorrect = (ans, user) =>
            user === ans || user === ans.slice(1);  // 정답 or 첫 글자 뺀 것

        if (checkCorrect(ans1, userAns) || (ans2 && checkCorrect(ans2, userAns))) {
            correct++;
        } else {
            q.WRONG = userAns;
            wrong.push(q);
            input.style.backgroundColor = '#ffe5e5';
        }

        input.disabled = true;
    });

    displayResult(correct, wrong);
    document.querySelector('button[type="submit"]').style.display = 'none';

    // 버튼 복제 방지
    const btnGroup = document.getElementById('after-buttons');
    if (!btnGroup.querySelector('.action-btn')) {
        btnGroup.style.display = 'flex';

        const retryBtn = document.createElement('button');
        retryBtn.textContent = '다시하기';
        retryBtn.className = 'action-btn';
        retryBtn.onclick = () => window.location.href = 'test.html';

        const homeBtn = document.createElement('button');
        homeBtn.textContent = '홈으로';
        homeBtn.className = 'action-btn';
        homeBtn.onclick = () => window.location.href = 'index.html';

        btnGroup.appendChild(retryBtn);
        btnGroup.appendChild(homeBtn);
    }
});

