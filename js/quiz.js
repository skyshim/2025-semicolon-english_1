//데이터 불러오기

const checklist = JSON.parse(sessionStorage.getItem('checklist'))
console.log(checklist)
let data = []


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
    })

// ====================================

// 퀴즈
