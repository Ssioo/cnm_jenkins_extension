

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

const extendBuildScreen = () => {
    const buildParams = document.getElementsByName('parameter')
    for (let p of buildParams) {
        if (p.children[0].value === "USER_NAME") {
            p.children[1].value = "niel.cho"
        }
        p.parentElement.parentElement.children[0].style = "font-size: 1.0rem;"
    }

    const forms = document.getElementsByClassName('jenkins-form-item')
    for (let f of forms) {
        const divider = document.createElement('div')
        divider.style = "height: 2px; background-color: var(--panel-header-bg-color); margin: 1rem 0 0 0;"
        f.appendChild(divider)
    }

}

let intervalId = null

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const simplifyBuildQueue = () => {
    let buildQueueCount = 0
    const summaryBuildQueueDiv = document.createElement('div')
    summaryBuildQueueDiv.id = "summaryBuildQueue"
    summaryBuildQueueDiv.style = "display: flex; justify-content: center; margin: 0 0 0 0; flex-direction: column;"

    const summaryBuildQueueTitle = document.createElement('div')
    summaryBuildQueueTitle.style = "background-color: var(--panel-header-bg-color); padding: 0.5rem 1.25rem;"
    summaryBuildQueueTitle.className = "pane-header-title"
    // buildQueueCount thousand comma split
    summaryBuildQueueTitle.innerHTML = `Build Queue Summary (${numberWithCommas(buildQueueCount)})`
    summaryBuildQueueDiv.appendChild(summaryBuildQueueTitle)

    const summaryBuildQueueDivContent = document.createElement('div')
    summaryBuildQueueDivContent.style = "display: flex; flex-direction: column;"
    summaryBuildQueueDiv.appendChild(summaryBuildQueueDivContent)

    document.getElementById('side-panel').insertBefore(summaryBuildQueueDiv, document.getElementById('side-panel').childNodes[1])
    intervalId = setInterval(() => {
        const queueTable = document.getElementById('buildQueue').children[1].children[0].children[1]
        const jobQueues = []
        buildQueueCount = 0
        for (let row of queueTable.children) {
            const jobname = row.children[0].children[0].innerHTML.split("<button")[0].split("<wbr>").join("")
            let found = false
            for (let p = 0; p < jobQueues.length; p++) {
                if (jobQueues[p][0] === jobname) {
                    jobQueues[p][1]++
                    found = true
                }
            }
            if (!found) {   
                jobQueues.push([jobname, 1])
            }
            buildQueueCount++
        }
        summaryBuildQueueTitle.innerHTML = `Build Queue Summary (${numberWithCommas(buildQueueCount)})`
        let newSummary = ""
        jobQueues.forEach((item) => {
            newSummary += `<div style="display: flex; flex-direction: row; padding: 0.5rem 0 0.25rem 1rem; ">
            <span style="flex: 1; font-weight: 600; text-decoration: underline; font-size: var(--font-size-xs);">${item[0]}</span>
            <span>(${item[1]})</span>
            </div>\n`
        })
        summaryBuildQueueDivContent.innerHTML = newSummary
    }, 1000)
}

window.addEventListener('load', () => {
    // if window.location.pathname is form of regular expression '/job/*/<number>/' or '/view/*/job/*/<number>/' then it is subjob page
    // else if it is form of regular expression '/job/*/' or '/view/*/job/*/' it is parent job page
    // else if it is form of regular expression '/job/*/build' or '/view/*/job/*/build' it is build page
    // else if it is '/' it is root page
    if (window.location.pathname === '/') {
        simplifyBuildQueue()
    } else if (window.location.pathname.match(/\/job\/.+\/build/) || window.location.pathname.match(/\/view\/.*\/job\/.+\/build/)) {
        console.log("build")
        extendBuildScreen()
    } else if (window.location.pathname.match(/\/job\/.+\/\d+\//) || window.location.pathname.match(/\/view\/.*\/job\/.+\/\d+\//)) {
        console.log("subjob")
        initSubJob()
    } else if (window.location.pathname.match(/\/job\/.+\//) || window.location.pathname.match(/\/view\/.*\/job\/.+\//)) {
        console.log("parentjob")
        initParentJob()
    } else {
        console.log("not job", window.location.pathname)
    }
})

window.addEventListener("unload", () => {
    clearInterval(intervalId)
})