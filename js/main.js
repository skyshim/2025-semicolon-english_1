// ============ 체크박스 생성 코드 ===========
const chap = document.querySelector('.chapter');

let ex1 = ''; // 1,2,5과용 exercise 요소
for(let i = 1; i < 13; i++) {
    ex1 += `<label><input type="checkbox"> Exercise ${i}</label>\n`;
}

let ex2 = ''; // 9과용 exercise 요소
for(let i = 1; i < 11; i++) {
    if (i == 5) {
        ex2 += `<label><input type="checkbox"> Exercise 5-6</label>\n`;
        continue;
    } else if (i == 6) continue;
    ex2 += `<label><input type="checkbox"> Exercise ${i}</label>\n`;
}
ex2 += `<label><input type="checkbox"> Exercise 11-12</label>\n`;

[1,2,5].forEach(unit => { // 1,2,5과 추가
    const content = `
    <details>
        <summary>
            <label><input id="unit_${unit}" type="checkbox"> Unit ${unit}</label>
        </summary>
        <div class="unit-content">
            ${ex1}
        </div>
    </details>
    `;
    chap.innerHTML += content;
});

[9].forEach(unit => { //9과 추가
    const content = `
    <details>
        <summary>
            <label><input id="unit_${unit}" type="checkbox"> Unit ${unit}</label>
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
const contentBoxes = document.querySelectorAll('.unit-content input[type="checkbox"]')
const btnStart = document.getElementById('btn-start')
const btnTest = document.getElementById('btn-mock-test')
const units = document.querySelectorAll('details')

// 순행 모드 관련
const seqToggle = document.getElementById('sequence-toggle');
sessionStorage.setItem('seqMode', false);

// 무한 모드 관련
const chickenToggle = document.getElementById('chicken-toggle');
sessionStorage.setItem('chickenMode', false);

// 단어 모드 관련
const wordToggle = document.getElementById('onlyword-toggle');
sessionStorage.setItem('onlyWordMode', false);

//변수 설정
let checklist = [] // [(UNIT_Exercise), [num, num, num]] [] [] .... 형식
let unitIndex
let exerciseIndex

// ========================================================

// 모의 테스트 버튼 -> 추후 업데이트 예정
btnTest.addEventListener('click', () => {
    window.location.href = 'test.html';
    // alert('추후 업데이트 예정입니다.');
})

// 전체 선택|해제 버튼 설정 -> 영향 안 받을 인풋(토글 등)은 not-all-checked라는 클래스 부여
btnSelectAll.addEventListener('click', function() {
    const boxes = document.querySelectorAll('input[type="checkbox"]:not(.not-all-checked)')
    boxes.forEach(cb => cb.checked = true)
})

btnCancelAll.addEventListener('click', function() {
    const boxes = document.querySelectorAll('input[type="checkbox"]:not(.not-all-checked)')
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

contentBoxes.forEach(childBox => {
    childBox.addEventListener('change', function () {
        const unit = this.closest('details');
        const parentBox = unit.querySelector('summary input[type="checkbox"]');
        const children = unit.querySelectorAll('.unit-content input[type="checkbox"]');
        
        // 하나라도 체크되어 있으면 상위 체크박스 true
        const anyChecked = Array.from(children).some(cb => cb.checked);
        parentBox.checked = anyChecked;
    });
});

//체크박스 확인함수
function checkboxDetect() {
    checklist = []
    const fixexdInnerTemp = ['1', '2', '3']

    units.forEach(unit => {
        unitIndex = unit.querySelector('summary input[type="checkbox"]').id.split('_').at(-1)
        
        unit.querySelectorAll('.unit-content label').forEach(c => { //label들에 대하여
            const unitTemp = []

            if (c.querySelector('input[type="checkbox"]').checked) { //각 박스들이 체크되어있으면
                exerciseIndex = c.textContent.split(' ').at(-1) //뒷자리(숫자)들만을 반환
                unitTemp.push(unitIndex + '_' + exerciseIndex)
                unitTemp.push(fixexdInnerTemp)
                checklist.push(unitTemp)
            }
        })
    })
    
    console.log(checklist)
    if (checklist.length == 0) return 1
}

//스타트 버튼
btnStart.addEventListener('click', function() {
    if(checkboxDetect()) {
        alert('범위를 선택해주세요!')
    }
    else {
        sessionStorage.setItem('checklist', JSON.stringify(checklist));
        sessionStorage.setItem('chickenMode', chickenToggle.checked);
        sessionStorage.setItem('onlyWordMode', wordToggle.checked);
        sessionStorage.setItem('seqMode', seqToggle.checked);
        window.location.href = 'quiz.html'
    }
});

chickenToggle.addEventListener('change', () => {
    if (chickenToggle.checked) seqToggle.checked = false;
});
seqToggle.addEventListener('change', () => {
    if (seqToggle.checked) chickenToggle.checked = false;
});


