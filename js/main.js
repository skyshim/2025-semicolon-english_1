// ============ 체크박스 생성 코드 ===========
const chap = document.querySelector('.chapter');

let ex1 = ''; // 1,2,5,6과용 exercise 요소
for(let i = 1; i < 13; i++) {
    ex1 += `<label><input type="checkbox"> Exercise ${i}</label>\n`;
}

let ex2 = ''; // 9,10과용 exercise 요소
for(let i = 1; i < 11; i++) {
    if (i == 5) {
        ex2 += `<label><input type="checkbox"> Exercise 5-6</label>\n`;
        continue;
    } else if (i == 6) continue;
    ex2 += `<label><input type="checkbox"> Exercise ${i}</label>\n`;
}
ex2 += `<label><input type="checkbox"> Exercise 11-12</label>\n`;

[1,2,5,6].forEach(unit => { // 1,2,5,6과 추가
    const content = `
    <details>
        <summary>
            <label><input id="unit${unit}" type="checkbox"> UNIT ${unit}</label>
        </summary>
        <div class="unit-content">
            ${ex1}
        </div>
    </details>
    `;
    chap.innerHTML += content;
});

[9,10].forEach(unit => { //9,10과 추가
    const content = `
    <details>
        <summary>
            <label><input id="unit${unit}" type="checkbox"> UNIT ${unit}</label>
        </summary>
        <div class="unit-content">
            ${ex2}
        </div>
    </details>
    `;
    chap.innerHTML += content;
});
// ============================

//요소 받기
const btnSelectAll = document.getElementById('select-all')
const btnCancelAll = document.getElementById('cancel-all')

const unitBoxes = document.querySelectorAll('summary label input[type="checkbox"]') //label로 감싸져있음에 주의

const btnStart = document.getElementById('btn-start')


const units = document.querySelectorAll('details')
//변수 설정
let checklist = [] // [(UNIT), [(Exercise), (Exercise)]] [] [] .... 형식
let unitIndex

// ========================================================

// 전체 선택|해제 버튼 설정
btnSelectAll.addEventListener('click', function() {
    const boxes = document.querySelectorAll('input[type="checkbox"]')
    boxes.forEach(cb => cb.checked = true)
})

btnCancelAll.addEventListener('click', function() {
    const boxes = document.querySelectorAll('input[type="checkbox"]')
    boxes.forEach(cb => cb.checked = false)
})

//UNIT별 체크박스
unitBoxes.forEach(box => {
    box.addEventListener('change', function() {
        const childs = this.closest('details').querySelectorAll('.unit-content input[type="checkbox"]')
        if (box.checked) {
            childs.forEach(c => c.checked = true)
        } else {
            childs.forEach(c => c.checked = false)
        }
    })
})

//TODO - 모든 하위항목 해제시 상위 박스 해제(필요에 따라)
// 어케하지
// ========================================================

//체크박스 확인함수
function checkboxDetect() {
    checklist = []

    units.forEach(rawData => {
        const unitTemp = []
        const unitInnerTemp = []
        unitIndex = rawData.querySelector('summary input[type="checkbox"]').id.at(-1)
        unitTemp.push(unitIndex)
        rawData.querySelectorAll('.unit-content label').forEach(c => { //label들에 대하여
            if (c.querySelector('input[type="checkbox"]').checked) { //각 박스들이 체크되어있으면
                unitInnerTemp.push(c.textContent.at(-1)) //뒷자리(숫자)만을 반환
            }
        })

        if (unitInnerTemp.length != 0) {
            unitTemp.push(unitInnerTemp)
        }


        if (unitTemp.length != 1) { //첫 index는 포함되기때문
            checklist.push(unitTemp)
        }
    })
    
    console.log(checklist)
    if (checklist.length == 0) return 1
} //통지문(Exercise 11~12 등)을 어떻게 처리해야 할지? 
  // 데이터에 맞게 통으로 되어있는지 감지한 후 따로 빼는 조건문이 필요할 듯

//스타트 버튼
btnStart.addEventListener('click', function() {
    if(checkboxDetect()) {
        alert('범위를 선택해주세요!')
    }
    else {
        sessionStorage.setItem('checklist', JSON.stringify(checklist))
        window.location.href = 'quiz.html'
    }
})
