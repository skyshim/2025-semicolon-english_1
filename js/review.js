// 요소 불러오기
const correctCnt = document.getElementById('answer-count');
const wrongCnt = document.getElementById('wrong-count');
const totalCnt = document.getElementById('total-percent');
const wrongSens = document.querySelector('.wrongs-content');
const reviewBtn = document.getElementById('review');
const homeBtn = document.getElementById('go-home-button');
const wrongContainer = document.querySelector('.wrongs');

// 데이터 불러오기
const isChickenMode = JSON.parse(sessionStorage.getItem('chickenMode')) === true;
const isWordMode = JSON.parse(sessionStorage.getItem('onlyWordMode')) === true;
const correct = JSON.parse(sessionStorage.getItem('correct'));
const wrong = JSON.parse(sessionStorage.getItem('wrong'));
let checklist = [];

// 홈 버튼 이벤트
homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

// 점수 표시
if (isChickenMode) {
    const total = correct;

    // 중복 없이 틀린 문제 수만 세기
    const uniqueWrongSet = new Set(wrong.map(w => w.ENGLISH));
    const wrongCount = uniqueWrongSet.size;

    const firstTryCorrect = total - wrongCount;
    const percent = ((firstTryCorrect / total) * 100).toFixed(1);

    correctCnt.innerHTML = `총 문제 수 : ${total}개`;
    wrongCnt.innerHTML = `재시도한 문제 수 : ${wrongCount}개`;
    totalCnt.innerHTML = `정확도(첫 시도 기준) : ${firstTryCorrect} / ${total}, ${percent}%`;
} else {
    correctCnt.innerHTML = `맞은 문제 수 : ${correct}`
    wrongCnt.innerHTML = `틀린 문제 수 : ${wrong.length}`
    totalCnt.innerHTML = `정답률 : ${correct} / ${correct+wrong.length}, ${(correct*100 / (correct+wrong.length)).toFixed(1)}%`
}


// 오답 목록 추가
if (isWordMode) {
    for (let w of wrong) {
        const content = `
            <div class='wrong-box'>
                <p>${w.TRANS}</p>
                <p>답 : '${w.WORD}'</p>
                <p>오답 : '${w.WRONG}'</p>
            </div>
        `;
        wrongSens.innerHTML += content;
    }
} else {
    for (let w of wrong) {
        const content = `
            <div class='wrong-box'>
                <p>${w.ENGLISH}</p>
                <p>답 : '${w.ANSWER1}'${w.ANSWER2 ? ` or '${w.ANSWER2}'` : ''}</p>
                <p>오답 : '${w.WRONG}'</p>
            </div>
        `;
        wrongSens.innerHTML += content;
    }
}

// 오답이 없을 경우
if (wrong.length === 0) {
    reviewBtn.style.display = 'none';
    wrongContainer.style.display = 'none';
}

// 다시 풀기 버튼
reviewBtn.addEventListener('click', () => {
    const tempCl = [];

    fetch('data.csv')
        .then(res => res.text())
        .then(text => {
            const rows = Papa.parse(text, {
                header: true,
                skipEmptyLines: true
            }).data;

            let sentenceCounter = 1;
            rows.forEach(line => {
                for (let w of wrong) {
                    if (w.ENGLISH === line.ENGLISH) {
                        tempCl.push(`${w.UNIT}_${w.EXERCISE}:${sentenceCounter}`);
                        break;
                    }
                }
                sentenceCounter++;
                if (sentenceCounter === 4) sentenceCounter = 1;
            });

            for (let c of tempCl) {
                const [unit_exer, counter] = c.split(':');
                const existing = checklist.find(item => item[0] === unit_exer);
                if (existing) {
                    existing[1].push(counter);
                } else {
                    checklist.push([unit_exer, [counter]]);
                }
            }

            console.log(checklist);
            sessionStorage.setItem('checklist', JSON.stringify(checklist));
            window.location.href = 'quiz.html';
        });
});
