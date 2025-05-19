document.addEventListener('DOMContentLoaded', () => {

    //데이터 불러오기
    const checklist = JSON.parse(sessionStorage.getItem('checklist'))
    console.log(checklist)
    let data = []
    let shfData = []
    
    function shuffle(array) { // Fisher–Yates 알고리즘
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
        }).data
    
        let sentenceCounter = 1;
        rows.forEach(line => {
          for (let itemlist of checklist) {
            if ((line.UNIT === itemlist[0].split('_')[0]) && (line.EXERCISE === itemlist[0].split('_')[1])) {
              if (itemlist[1].includes(String(sentenceCounter))) {
                data.push(line)
              }
              sentenceCounter += 1
              if (sentenceCounter == 4) sentenceCounter = 1;
              break;
            }
          }
        })
        console.log(data)
    
        shfData = shuffle(data.slice());
        console.log(shfData);
    
        if (JSON.parse(sessionStorage.getItem('chickenMode')) === true) {
          document.getElementById('progress-container').style.display = 'block';
          chickenModeQuiz();
        } else {
          document.getElementById('progress-container').style.display = 'none';
          quizStart();
        }
      })
    
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
    
    async function quizStart() {
      let quizLen = shfData.length;
      for (let index = 0; index < quizLen; index++) {
        ans.focus();
        q = shfData[index];
        resPage.style.display = 'none';
        resText = '';
        disText = '';
    
        quizCounter.textContent = `Question ${index + 1} of ${quizLen}`;
        unitIndicater.textContent = `Unit ${q.UNIT} Exercise ${q.EXERCISE}`;
        englsihSen.textContent = q.ENGLISH;
        koreanSen.textContent = q.KOREAN;
        ans.value = '';
    
        await waiting();
    
        if ((ans.value === q.ANSWER1) || (q.ANSWER2 !== '' && ans.value === q.ANSWER2)) {
          correct++;
          resText = '정답입니다!';
        } else {
          q.WRONG = ans.value;
          wrong.push(q);
          resText = '오답입니다!';
          if (q.ANSWER2 === '') disText = `답 : ${q.ANSWER1}`;
          else disText = `답 : ${q.ANSWER1} 또는 ${q.ANSWER2}`;
        }
        console.log('맞은 개수 :', correct);
        console.log(wrong);
    
        resIndicater.textContent = resText;
        resDiscription.textContent = disText;
        resPage.style.display = 'block';
    
        await waiting();
        ans.disabled = false;
      }
      ans.disabled = false;
      quizEnd(correct, wrong);
    }
    
    async function chickenModeQuiz() {
        let remaining = shfData.slice(); // 남은 문제들
        correct = 0;
        wrong.length = 0;
      
        const progressBar = document.getElementById('progress-bar');
        document.getElementById('progress-container').style.display = 'block';
      
        while (remaining.length > 0) {
          // 무작위 선택
          const randomIndex = Math.floor(Math.random() * remaining.length);
          const q = remaining[randomIndex];
      
          // 문제 표시
          resPage.style.display = 'none';
          resText = '';
          disText = '';
      
          quizCounter.textContent = `남은 단어: ${remaining.length}`;
          unitIndicater.textContent = `Unit ${q.UNIT} Exercise ${q.EXERCISE}`;
          englsihSen.textContent = q.ENGLISH;
          koreanSen.textContent = q.KOREAN;
          ans.value = '';
          ans.focus();
      
          await waiting();
      
          if (ans.value === q.ANSWER1 || (q.ANSWER2 !== '' && ans.value === q.ANSWER2)) {
            // 맞으면 목록에서 제거
            remaining.splice(randomIndex, 1);
            correct++;
          } else {
            q.WRONG = ans.value;
            wrong.push(q);
          }
      
          // 보스바 업데이트
          const percentage = Math.round(((shfData.length - remaining.length) / shfData.length) * 100);
          progressBar.style.width = `${percentage}%`;
      
          resIndicater.textContent = (ans.value === q.ANSWER1 || (q.ANSWER2 !== '' && ans.value === q.ANSWER2))
            ? '정답입니다!' : '오답입니다!';
          disText = (q.ANSWER2 === '') ? `답 : ${q.ANSWER1}` : `답 : ${q.ANSWER1} 또는 ${q.ANSWER2}`;
          resDiscription.textContent = disText;
          resPage.style.display = 'block';
      
          await waiting();
          ans.disabled = false;
        }
      
        // 종료
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
    