const correctCnt = document.getElementById('answer-count')
const wrongCnt = document.getElementById('wrong-count')
const totalCnt = document.getElementById('total-percent')
const wrongSens = document.querySelector('.wrongs-content')
const reviewBtn = document.getElementById('review')
const homeBtn = document.getElementById('home')
const wrongContainer = document.querySelector('.wrongs')


let correct = JSON.parse(sessionStorage.getItem('correct'))
const wrong = JSON.parse(sessionStorage.getItem('wrong'))

let checklist = []

//====================================================

correctCnt.innerHTML = `맞은 개수 : ${correct}`
wrongCnt.innerHTML = `틀린 개수 : ${wrong.length}`
totalCnt.innerHTML = `${correct} out of ${correct+wrong.length}, ${(correct*100 / (correct+wrong.length)).toFixed(1)}%`

for (let w of wrong) {
    let content; // div class='wrong-box'로 묶었음(css 작업할 때 있어야할 것 같아서)
    if (w.ANSWER2 == "") {
        content = `
            <div class='wrong-box'>
                <p>${w.ENGLISH} </p>
                <p>답 : '${w.ANSWER1}'</p>
                <p>오답 : '${w.WRONG}' </p>
            </div>
        `
    } else {
        content = `
            <div class='wrong-box'>
                <p>${w.ENGLISH} </p>
                <p>답 : '${w.ANSWER1}' or '${w.ANSWER2}' </p>
                <p>오답 : '${w.WRONG}' </p>
            </div>
        `
    }
    wrongSens.innerHTML += content
}

if (wrong.length === 0) {
    reviewBtn.style.display = 'none'
    wrongContainer.style.display = 'none'
}

reviewBtn.addEventListener('click', () => {
    const tempCl = []
    fetch('data.csv')
    .then(res => res.text())
    .then(text => {
        const rows = Papa.parse(text, {
            header: true,
            skipEmptyLines: true
        }).data

        let sentenceCounter = 1;
        rows.forEach(line => { //줄별로 조사
            for (let w of wrong) {
                if (w.ENGLISH === line.ENGLISH) {
                    tempCl.push(w.UNIT + '_' + w.EXERCISE + ':' + sentenceCounter) //그럼 모든 문장이 [1_2:3, 4_1:2] 이런느낌으로 쭈우우욱 저장장
                    break
                }
            }
            sentenceCounter += 1
            if (sentenceCounter == 4) sentenceCounter = 1
        })

        //자 이제 코딩테스트마냥 배열정리 들어갑니다~ ㅋㅋㅋㅋ
        for (let c of tempCl) {
            const unit_exer = c.split(':')[0] 
            const counter = c.split(':')[1] //일단 두개 분리

            if (checklist.map(item => item[0]).includes(unit_exer)) { //이미 있으면
                for (let itemlist of checklist) { //checklist 뜯어서
                    if (itemlist[0] === unit_exer) itemlist[1].push(counter) //맞는데에다가 문장번호 추가
                }
            } else { //없으면 걍 추가하고
                checklist.push([unit_exer, [counter]])
            }
        }
        //해결!! 30분걸림 ㅋㅋ~
        console.log(checklist)

        sessionStorage.setItem('checklist', JSON.stringify(checklist))
        window.location.href = 'quiz.html'
    })
})

homeBtn.addEventListener('click', () => {
    window.location.href = 'main.html'
})

// console.log(correct)
// console.log(wrong)