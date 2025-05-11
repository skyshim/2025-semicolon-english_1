const correctCnt = document.getElementById('answer-count')
const wrongCnt = document.getElementById('wrong-count')
const totalCnt = document.getElementById('total-percent')
const wrongSens = document.querySelector('.wrongs-content')
const reviewBtn = document.getElementById('review')
const homeBtn = document.getElementById('home')


let correct = JSON.parse(sessionStorage.getItem('correct'))
const wrong = JSON.parse(sessionStorage.getItem('wrong'))

let checklist = []

//====================================================

correctCnt.innerHTML = `Correct : ${correct}`
wrongCnt.innerHTML = `Wrong : ${wrong.length}`
totalCnt.innerHTML = `${correct} out of ${correct+wrong.length}, ${(correct*100 / (correct+wrong.length)).toFixed(1)}%`

for (let w of wrong) {
    let content;
    if (w.ANSWER2 == "") {
        content = `
            <p>${w.ENGLISH} <\p>
            <p>ANSWER : '${w.ANSWER1}'\
            <p>YOUR ANSWER : '${w.WRONG}' <\p>
            <br>
        `
    } else {
        content = `
            <p>${w.ENGLISH} <\p>
            <p>ANSWER : '${w.ANSWER1}' or '${w.ANSWER2}' <\p>
            <p>YOUR ANSWER : '${w.WRONG}' <\p>
            <br>
        `
    }
    wrongSens.innerHTML += content
}

if (wrong.length === 0) {
    reviewBtn.style.display = 'none'
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