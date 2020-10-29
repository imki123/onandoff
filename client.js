//connection event
let url = "https://socket-imki123.herokuapp.com"
//url = "http://localhost:4000"
let socket = io(url) //default: window.location
let allClients = []

function clickUsage() {
  alert(
    `1. 🔲버튼을 눌러서 ON / OFF를 변경해보세요.\n2. 불이 켜져 있을 때는 버튼을 모두 OFF로 바꿔야합니다.\n3. 불이 꺼져 있을 때는 버튼을 모두 ON으로 바꿔야합니다.\n4. 😅최근 성공했다면 점수가 올라가지 않아요. 다른 분이 성공한 후에 다시 시도해주세요!\n5. 🎉높은 점수를 얻어서 랭킹을 올려보세요!!`
  )
}

//버튼클릭하면 ON/OFF 바꾸고 소켓에 버튼 아이디 전송
function clickButton(button) {
  socket.emit("clickButton", button.id.replace("button_", ""))
  if (button.innerHTML === "ON") {
    button.innerHTML = "OFF"
    button.classList.add("off")
  } else {
    button.innerHTML = "ON"
    button.classList.remove("off")
  }
}

function send() {
  let msg = document.querySelector("#chat")
  if (msg.value.trim() === "") return
  socket.emit("chat message", msg.value.trim())
  msg.value = ""
}
function sendOnEnter(event) {
  if (event.key === "Enter") send()
}

//접속자수 클릭하면 클라이언트 목록 보여주기
function toggleClients() {
  const $allClientsWrapper = document.querySelector(".allClientsWrapper")
  if ($allClientsWrapper.classList.contains("view"))
    $allClientsWrapper.classList.remove("view")
  else $allClientsWrapper.classList.add("view")
}

window.onload = function () {
  const $game = document.querySelector(".game")
  const $msgs = document.querySelector(".msgs")
  const $clientLength = document.querySelector(".clientsLength")
  const $allClientsList = document.querySelector(".allClientsList")

  //버튼 배열 받기
  socket.on("buttons", ({ buttons, recents, weeks, months, winner }) => {
    //배경색 바꾸기
    $game.style.background = buttons[0]
    //버튼 바꾸기
    for (let i = 1; i < buttons.length; i++) {
      button = document.querySelector(`#button_${i}`)
      if (buttons[i]) {
        button.innerHTML = "ON"
        button.classList.remove("off")
      } else {
        button.innerHTML = "OFF"
        button.classList.add("off")
      }
    }
    //console.log(buttons, recents, weeks, months)
    //recents 렌더링
    let html = ""
    recents.forEach(
      (i, idx) => (html += `<div><span>${idx + 1}. ${i.client}</span></div>`)
    )
    document.querySelector(".recent .boardList").innerHTML = html
    //weeks 렌더링
    html = ""
    weeks.forEach(
      (i, idx) =>
        (html += `<div><span>${idx + 1}. ${i.client}</span><span>${
          i.count
        }</span></div>`)
    )
    document.querySelector(".week .boardList").innerHTML = html
    //months 렌더링
    html = ""
    months.forEach(
      (i, idx) =>
        (html += `<div><span>${idx + 1}. ${i.client}</span><span>${
          i.count
        }</span></div>`)
    )
    document.querySelector(".month .boardList").innerHTML = html
    if (winner === true) {
      alert("🎉성공! 축하해요!!🎉")
    } else if (winner === false) {
      alert(
        "😅최근에 성공하셔서 점수가 올라가지 않았어요. 다른 분이 성공한 후에 다시 시도해주세요!"
      )
    }
  })

  //접속된 사람 수 보여주기
  socket.on("allClients", function ({ address, clients }) {
    //console.log(clients)
    if (clients) allClients = clients
    $clientLength.innerHTML = clients.length + "명"
    //나간 사람 보여주기
    if (address) {
      const div = document.createElement("div")
      div.classList.add("disconnect")
      div.innerHTML = `${address}님이 나가셨습니다`
      $msgs.append(div)
      //맨 아래로 스크롤하기
      $msgs.scrollTop = $msgs.scrollHeight + $msgs.offsetHeight
    }

    $allClientsList.innerHTML = ""
    for (let i of allClients) {
      const div = document.createElement("div")
      div.classList.add("client")
      div.innerHTML = `${i}`
      $allClientsList.append(div)
    }
  })

  //저장된 메시지 가져오기
  socket.on("get msgs", function (msgs) {
    let time = ""
    $msgs.innerHTML = ""
    for (let i of msgs) {
      if (time.substring(0, 10) !== i.time.substring(0, 10)) {
        time = i.time
        const div = document.createElement("div")
        div.classList.add("date")
        div.innerHTML = `${i.time.substring(0, 10)}`
        $msgs.append(div)
      }
      const div = document.createElement("div")
      div.classList.add("msg")
      div.innerHTML = `${i.address} : ${
        i.msg
      } <span class="time">${i.time.substring(11)}</span>`
      $msgs.append(div)
    }
    //맨 아래로 스크롤하기
    $msgs.scrollTop = $msgs.scrollHeight + $msgs.offsetHeight
  })

  //접속하면 접속한 사람 아이디 보여주기
  socket.on("new connect", ({ client, isMe }) => {
    const div = document.createElement("div")
    const $client = document.querySelector(".client")
    div.classList.add("connect")
    if (isMe) {
      div.innerHTML = `${client}님 환영합니다 :D`
      $client.innerHTML = client
    } else div.innerHTML = `${client}님이 접속했습니다.`
    $msgs.append(div)
    //맨 아래로 스크롤하기
    $msgs.scrollTop = $msgs.scrollHeight + $msgs.offsetHeight
  })

  //날짜가 변경되면 날짜 표시
  let date = new Date()
  let today = date.getFullYear()
  today += date.getMonth() < 10 ? "/0" + date.getMonth() : "/" + date.getMonth()
  today += date.getDate() < 10 ? "/0" + date.getDate() : "/" + date.getDate()
  //메시지 받으면 화면에 그리기
  socket.on("chat message", function ({ address, msg, time }) {
    if (today.substring(0, 10) !== time.substring(0, 10)) {
      today = time
      const div = document.createElement("div")
      div.classList.add("date")
      div.innerHTML = `${time.substring(0, 10)}`
      $msgs.append(div)
    }
    const div = document.createElement("div")
    div.classList.add("msg")
    div.innerHTML = `${address} : ${msg} <span class="time">${time.substring(
      11
    )}</span>`
    $msgs.append(div)
    //맨 아래로 스크롤하기
    $msgs.scrollTop = $msgs.scrollHeight + $msgs.offsetHeight
  })

  //clearMsgs '대화삭제' 입력하면 모든 메시지 삭제
  socket.on("clearMsgs", () => {
    $msgs.innerHTML = ""
    //맨 아래로 스크롤하기
    $msgs.scrollTop = $msgs.scrollHeight + $msgs.offsetHeight
  })
}
