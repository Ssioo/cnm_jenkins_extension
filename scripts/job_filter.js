

const initParentJob = () => {
    const buildHistoyList = document.getElementsByTagName('table')[0].children[0].children

    let index = 0
    for (const c of buildHistoyList) {
        index++
        if (index === 1) {
            continue
        }
        const subJobUrl = c.children[0].children[0].children[0].children[1].href
        const req = new XMLHttpRequest()
        req.onload = () => {
            if (req.status === 200) {
                let rawStr = req.responseText
                const userName = rawStr.substring(rawStr.indexOf("Started by user")).split("</a>")[0].split(">")[1]
                console.log(userName)
                const userNameElem = document.createElement('span')
                userNameElem.innerHTML = 'by ' + userName
                userNameElem.className = "username_text"
                c.children[0].children[1].appendChild(userNameElem)
            }
        }
        req.open('GET', subJobUrl, true)
        req.send()
    }
}

const initSubJob = () => {
    let failedCnt = 0
    let successCnt = 0


    const subjobList = document.getElementsByTagName('ul')[1].children

    const filterSubJobs = (criteria) => {
        if (criteria === 0) {
            for (const c of subjobList) {
                if (c.children[1].children[0].src.includes("blue")) {
                    c.style.display = "none"
                } else {
                    c.style.display = "block"
                }
            }
        } else if (criteria === 1) {
            for (const c of subjobList) {
                if (c.children[1].children[0].src.includes("red")) {
                    c.style.display = "none"
                } else {
                    c.style.display = "block"
                }
            }
        }
    }

    const rerunAll = () => {
        if (!window.confirm('모든 실패한 job을 재시도하시겠습니까?'))
            return
        for (const c of subjobList) {
            if (c.children[1].children[0].src.includes("red")) {
                const jobUrl = c.children[1].href + 'retry'
                const req = new XMLHttpRequest()
                req.onload = () => { }
                req.open('GET', jobUrl, true)
                req.send()
            }
        }
        window.alert('실패한 모든 job을 재시도했습니다.')
    }


    for (const c of subjobList) {
        if (c.children[1].children[0].src.includes("blue")) {
            successCnt++
        } else {
            failedCnt++
        }
    }

    const filterObj = document.createElement('div')
    filterObj.style = "display: flex; justify-content: center; margin: 10px 0px;"
    const button1 = this.document.createElement('button')
    button1.innerHTML = `Success ${successCnt}개`
    button1.className = "success_button"
    button1.onclick = () => filterSubJobs(1)

    const button2 = this.document.createElement('button')
    button2.innerHTML = `Failed ${failedCnt}개`
    button2.className = "failed_button"
    button2.onclick = () => filterSubJobs(0)

    const button3 = this.document.createElement('button')
    button3.innerHTML = `Rerun ${failedCnt}개`
    button3.className = "rerun_button"
    button3.onclick = () => rerunAll()


    filterObj.appendChild(button1)
    filterObj.appendChild(button2)
    filterObj.appendChild(button3)

    document.getElementsByTagName('h2')[0].parentElement.insertBefore(filterObj, document.getElementsByTagName('h2')[0])
}
window.addEventListener('load', () => {
    // if window.location.pathname is form of regular expression '/job/*/<number>/' or '/view/*/job/*/<number>/' then it is subjob page
    // else if it is form of regular expression '/job/*/' or '/view/*/job/*/' it is parent job page
    if (window.location.pathname.match(/\/job\/.+\/\d+\//) || window.location.pathname.match(/\/view\/.*\/job\/.+\/\d+\//)) {
        console.log("subjob")
        initSubJob()
    } else if (window.location.pathname.match(/\/job\/.+\//) || window.location.pathname.match(/\/view\/.*\/job\/.+\//)) {
        console.log("parentjob")
        initParentJob()
    } else {
        console.log("not job", window.location.pathname)
    }
})