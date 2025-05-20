document.addEventListener('DOMContentLoaded', () => {
  const checklist = JSON.parse(sessionStorage.getItem('checklist'));
  console.log(checklist);

  let data = [];
  let shfData = [];
  
  const isSeqMode = JSON.parse(sessionStorage.getItem('seqMode')) === true;
  const isChickenMode = JSON.parse(sessionStorage.getItem('chickenMode')) === true;
  const isOnlyWordMode = JSON.parse(sessionStorage.getItem('onlyWordMode')) === true;
  console.log("단어 모드 여부:", isOnlyWordMode);

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  fetch('data.csv')
    .then(res => res.text())
    .then(text => {
      const rows = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      }).data;

      let sentenceCounter = 1;
      rows.forEach(line => {
        for (let itemlist of checklist) {
          if ((line.UNIT === itemlist[0].split('_')[0]) &&
              (line.EXERCISE === itemlist[0].split('_')[1])) {
            if (itemlist[1].includes(String(sentenceCounter))) {
              data.push(line);
            }
            sentenceCounter += 1;
            if (sentenceCounter == 4) sentenceCounter = 1;
            break;
          }
        }
      });
      if (isSeqMode) {
        shfData = data.slice();
      } else {
        shfData = shuffle(data.slice());
      }
      if (isChickenMode) {
        document.getElementById('progress-container').style.display = 'block';
        chickenModeQuiz();
      } else {
        document.getElementById('progress-container').style.display = 'none';
        quizStart();
      }
    });

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

  let correct = 0;
  const wrong = [];
  let resText = '';
  let disText = '';

  function waiting() {
    return new Promise(resolve => {
      function handler(e) {
        if (e.type === 'keydown' && e.key === 'Enter') {
          document.removeEventListener('keydown', handler);
          checkBtn.removeEventListener('click', handler);
          ans.disabled = true;
          resolve();
        } else if (e.type === 'click') {
          document.removeEventListener('keydown', handler);
          checkBtn.removeEventListener('click', handler);
          ans.disabled = true;
          resolve();
        }
      }
      document.addEventListener('keydown', handler);
      checkBtn.addEventListener('click', handler);
    });
  }

  function getFirst(data) {
    let ind = -1;
    for(let i = 0; i < data.length; i++) {
      if(data[i] === '_') {
        ind = i - 1;
        break;
      }
    }
    if (ind === -1) return 'error';
    return data[ind].toLowerCase();
  }

  async function quizStart() {
    let quizLen = shfData.length;
    for (let index = 0; index < quizLen; index++) {
      ans.focus();
      const q = shfData[index];
      resPage.style.display = 'none';
      resText = '';
      disText = '';

      quizCounter.textContent = `Question ${index + 1} of ${quizLen}`;
      unitIndicater.textContent = `Unit ${q.UNIT} Exercise ${q.EXERCISE}`;

      if (isOnlyWordMode) {
        englsihSen.innerHTML = `&nbsp;${getFirst(q.ENGLISH)}________&nbsp;&nbsp;&nbsp;${q.TRANS}`;
        koreanSen.style.display = 'none';
      } else {
        englsihSen.textContent = q.ENGLISH;
        koreanSen.textContent = q.KOREAN;
        koreanSen.style.display = 'block';
      }

      ans.value = '';
      await waiting();

      let isCorrect = false;
      if (isOnlyWordMode) {
        isCorrect = (ans.value.toLowerCase() === q.WORD.toLowerCase());
      } else {
        isCorrect = (ans.value === q.ANSWER1) || (q.ANSWER2 !== '' && ans.value === q.ANSWER2);
      }

      if (isCorrect) {
        correct++;
        resText = '정답입니다!';
      } else {
        q.WRONG = ans.value;
        wrong.push(q);
        resText = '오답입니다!';
        if (isOnlyWordMode) {
          disText = `답 : ${q.WORD}`;
        } else {
          disText = (q.ANSWER2 === '') ? `답 : ${q.ANSWER1}` : `답 : ${q.ANSWER1} 또는 ${q.ANSWER2}`;
        }
      }

      resIndicater.textContent = resText;
      resDiscription.textContent = disText;
      resPage.style.display = 'block';

      resPage.classList.remove('correct-glow', 'wrong-glow'); // 먼저 초기화
      void resPage.offsetWidth; // 재렌더링 트릭
      resPage.classList.add(isCorrect ? 'correct-glow' : 'wrong-glow');

      await waiting();
      ans.disabled = false;
    }

    quizEnd(correct, wrong);
  }

  async function chickenModeQuiz() {
    let remaining = shfData.slice();
    correct = 0;
    wrong.length = 0;

    const progressBar = document.getElementById('progress-bar');
    document.getElementById('progress-container').style.display = 'block';

    while (remaining.length > 0) {
      const randomIndex = Math.floor(Math.random() * remaining.length);
      const q = remaining[randomIndex];

      resPage.style.display = 'none';
      resText = '';
      disText = '';

      quizCounter.textContent = `남은 단어: ${remaining.length}`;
      unitIndicater.textContent = `Unit ${q.UNIT} Exercise ${q.EXERCISE}`;

      if (isOnlyWordMode) {
        englsihSen.innerHTML = `&nbsp;${getFirst(q.ENGLISH)}________&nbsp;&nbsp;&nbsp;${q.TRANS}`;
        koreanSen.style.display = 'none';
      } else {
        englsihSen.textContent = q.ENGLISH;
        koreanSen.textContent = q.KOREAN;
        koreanSen.style.display = 'block';
      }

      ans.value = '';
      ans.focus();

      await waiting();

      let isCorrect = false;
      if (isOnlyWordMode) {
        isCorrect = (ans.value === q.WORD);
      } else {
        isCorrect = (ans.value === q.ANSWER1) || (q.ANSWER2 !== '' && ans.value === q.ANSWER2);
      }

      if (isCorrect) {
        remaining.splice(randomIndex, 1);
        correct++;
      } else {
        q.WRONG = ans.value;
        wrong.push(q);
      }

      const percentage = Math.round(((shfData.length - remaining.length) / shfData.length) * 100);
      progressBar.style.width = `${percentage}%`;

      resIndicater.textContent = isCorrect ? '정답입니다!' : '오답입니다!';
      disText = isOnlyWordMode
        ? `답 : ${q.WORD}`
        : (q.ANSWER2 === '' ? `답 : ${q.ANSWER1}` : `답 : ${q.ANSWER1} 또는 ${q.ANSWER2}`);
      resDiscription.textContent = disText;
      resPage.style.display = 'block';

      resPage.classList.remove('correct-glow', 'wrong-glow'); // 먼저 초기화
      void resPage.offsetWidth; // 재렌더링 트릭
      resPage.classList.add(isCorrect ? 'correct-glow' : 'wrong-glow');

      await waiting();
      ans.disabled = false;
    }

    quizEnd(correct, wrong);
  }

  function quizEnd(correct, wrong) {
    sessionStorage.setItem('correct', JSON.stringify(correct));
    sessionStorage.setItem('wrong', JSON.stringify(wrong));
    window.location.href = 'review.html';
  }

  homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
});
