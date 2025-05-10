//데이터 불러오기
const checklist = JSON.parse(sessionStorage.getItem('checklist'))
console.log(checklist)
let data = []
let shfData = []

function shuffle(array) { // Fisher–Yates 알고리즘이래요
  for (let i = array.length - 1; i > 0; i--) {
    // 0부터 i 사이의 랜덤 인덱스 선택
    const j = Math.floor(Math.random() * (i + 1));
    // 요소 교환
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//checklist
//['1', ['1', '2', '3']]
//['2', ['1', '2', '3']]
fetch('data.csv')
    .then(res => res.text())
    .then(text => {
        const rows = Papa.parse(text, {
            header: true,
            skipEmptyLines: true
        }).data

        rows.forEach(line => {
            for (let itemlist of checklist) {
                if ((line.UNIT === itemlist[0]) && (itemlist[1].includes(line.EXERCISE))) {
                    data.push(line)
                }
            }
        })
        console.log(data)
        
        // 셔플
        shfData = shuffle(data.slice());
        console.log(shfData);
        quizStart()
    })

// html 태그 불러오기
const quizCounter = document.getElementById('quiz-counter');
const unitIndicater = document.getElementById('unit-indicater');
const englsihSen = document.getElementById('english-sen');
const koreanSen = document.getElementById('korean-sen');
const checkBtn = document.getElementById('check-button');
const homeBtn = document.getElementById('go-home-button');
const ans = document.getElementById('answer');

const resPage = document.getElementById('result-page');
const resIndicater = document.getElementById('result-indicater');
const resDiscription = document.getElementById('result-discription');

// 변수 선언
let correct = 0; // 맞은 개수
const wrong = []; // 오답
let resText = '';
let disText = '';

// 응답 대기 함수
function waiting() {
    return new Promise(resolve => {
        function handler(e) {
            if (e.type === 'keydown' && e.key === 'Enter') {
                document.removeEventListener('keydown', handler);
                checkBtn.removeEventListener('click', handler);
                resolve();
            } else if (e.type === 'click') {
                document.removeEventListener('keydown', handler);
                checkBtn.removeEventListener('click', handler);
                resolve();
            }
        }
        document.addEventListener('keydown', handler);
        checkBtn.addEventListener('click', handler);
    });
}

// 퀴즈
async function quizStart() {
    let quizLen = shfData.length;
    for(let index = 0; index < quizLen; index++) {
        q = shfData[index];
        // 문제 표시 및 초기화
        resPage.style.display = 'none';
        resText = '';
        disText = '';

        quizCounter.textContent = `Question ${index+1} of ${quizLen}`;
        unitIndicater.textContent = `Unit ${q.UNIT} Exercise ${q.EXERCISE}`;
        englsihSen.textContent = q.ENGLISH;
        koreanSen.textContent = q.KOREAN;
        ans.value='';
        
        // 응답 대기
        await waiting();
        
        // 응답 처리
        if((ans.value === q.ANSWER1) || (q.ANSWER2 != '' && (ans.value === q.ANSWER2))) {
            correct++;
            resText = '정답입니다!';
        } else {
            q.WRONG = ans.value; // 오답노트 페이지에서 오답 표시하기 위함
            wrong.push(q);
            resText = '오답입니다!';
            if(q.ANSWER2 === '') disText = `답 : ${q.ANSWER1}`;
            else disText = `답 : ${q.ANSWER1} 또는 ${q.ANSWER2}`;
        }
        console.log('맞은 개수 :', correct);
        console.log(wrong);

        // 표시
        resIndicater.textContent = resText;
        resDiscription.textContent = disText;
        resPage.style.display = 'block';

        await waiting();
    }
    // 끝나는거 구현해야함
}

// 홈으로 버튼
homeBtn.addEventListener('click', () => {
    window.location.href = 'main.html';
});