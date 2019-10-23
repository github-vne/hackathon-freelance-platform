// Generate random room name if needed
if (!location.hash) {
  location.hash = "123";
}
const roomHash = location.hash.substring(1);
const possibleEmojis = [
  "🐀",
  "🐁",
  "🐭",
  "🐹",
  "🐂",
  "🐃",
  "🐄",
  "🐮",
  "🐅",
  "🐆",
  "🐯",
  "🐇",
  "🐐",
  "🐑",
  "🐏",
  "🐴",
  "🐎",
  "🐱",
  "🐈",
  "🐰",
  "🐓",
  "🐔",
  "🐤",
  "🐣",
  "🐥",
  "🐦",
  "🐧",
  "🐘",
  "🐩",
  "🐕",
  "🐷",
  "🐖",
  "🐗",
  "🐫",
  "🐪",
  "🐶",
  "🐺",
  "🐻",
  "🐨",
  "🐼",
  "🐵",
  "🙈",
  "🙉",
  "🙊",
  "🐒",
  "🐉",
  "🐲",
  "🐊",
  "🐍",
  "🐢",
  "🐸",
  "🐋",
  "🐳",
  "🐬",
  "🐙",
  "🐟",
  "🐠",
  "🐡",
  "🐚",
  "🐌",
  "🐛",
  "🐜",
  "🐝",
  "🐞"
];

function randomEmoji() {
  var randomIndex = Math.floor(Math.random() * possibleEmojis.length);
  return possibleEmojis[randomIndex];
}

const emoji = randomEmoji();
// const user = prompt('Enter your name:');
const user = "Nikolay";
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = "ru-RU";
recognition.interimResults = true;
recognition.maxAlternatives = 1;
recognition.start();

const drone = new ScaleDrone("pMbakAnQeahIRBtF");
const roomName = "observable-" + roomHash;
const configuration = {
  iceServers: [
    {
      url: "stun:stun01.sipphone.com"
    },
    {
      url: "stun:stun.ekiga.net"
    },
    {
      url: "stun:stun.fwdnet.net"
    },
    {
      url: "stun:stun.ideasip.com"
    },
    {
      url: "stun:stun.iptel.org"
    },
    {
      url: "stun:stun.rixtelecom.se"
    },
    {
      url: "stun:stun.schlund.de"
    },
    {
      url: "stun:stun.l.google.com:19302"
    },
    {
      url: "stun:stun1.l.google.com:19302"
    },
    {
      url: "stun:stun2.l.google.com:19302"
    },
    {
      url: "stun:stun3.l.google.com:19302"
    },
    {
      url: "stun:stun4.l.google.com:19302"
    },
    {
      url: "stun:stunserver.org"
    },
    {
      url: "stun:stun.softjoys.com"
    },
    {
      url: "stun:stun.voiparound.com"
    },
    {
      url: "stun:stun.voipbuster.com"
    },
    {
      url: "stun:stun.voipstunt.com"
    },
    {
      url: "stun:stun.voxgratia.org"
    },
    {
      url: "stun:stun.xten.com"
    },
    {
      url: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com"
    },
    {
      url: "turn:192.158.29.39:3478?transport=udp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808"
    },
    {
      url: "turn:192.158.29.39:3478?transport=tcp",
      credential: "JZEOEt2V3Qb0y27GRntt2u2PAYA=",
      username: "28224511:1379330808"
    }
  ]
};
let room;
let pc;

function onSuccess() {}

function onError(error) {
  console.error(error);
}

drone.on("open", error => {
  if (error) {
    return console.error(error);
  }
  room = drone.subscribe(roomName);
  room.on("open", error => {
    if (error) {
      onError(error);
    }
  });
  room.on("members", members => {
    console.log("MEMBERS", members);
    const isOfferer = members.length === 2;
    startWebRTC(isOfferer);
  });
});

function sendMessage(message) {
  drone.publish({
    room: roomName,
    message
  });
}

function startWebRTC(isOfferer) {
  pc = new RTCPeerConnection(configuration);

  pc.onicecandidate = event => {
    if (event.candidate) {
      sendMessage({
        candidate: event.candidate
      });
    }
  };

  if (isOfferer) {
    pc.onnegotiationneeded = () => {
      pc.createOffer(localDescCreated, error => console.error(error));
    };
    dataChannel = pc.createDataChannel("chat");
    setupDataChannel();
  } else {
    pc.ondatachannel = event => {
      dataChannel = event.channel;
      setupDataChannel();
    };
  }

  pc.ontrack = event => {
    const stream = event.streams[0];
    if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
      remoteVideo.srcObject = stream;
    }
  };

  navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: true
    })
    .then(stream => {
      localVideo.srcObject = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }, onError);
  startListentingToSignals();
}

function startListentingToSignals() {
  room.on("data", (message, client) => {
    if (client.id === drone.clientId) {
      return;
    }

    if (message.sdp) {
      pc.setRemoteDescription(
        new RTCSessionDescription(message.sdp),
        () => {
          if (pc.remoteDescription.type === "offer") {
            pc.createAnswer()
              .then(localDescCreated)
              .catch(onError);
          }
        },
        onError
      );
    } else if (message.candidate) {
      pc.addIceCandidate(
        new RTCIceCandidate(message.candidate),
        onSuccess,
        onError
      );
    }
  });
}

function localDescCreated(desc) {
  pc.setLocalDescription(
    desc,
    () =>
      sendMessage({
        sdp: pc.localDescription
      }),
    onError
  );
}

function setupDataChannel() {
  checkDataChannelState();
  dataChannel.onopen = checkDataChannelState;
  dataChannel.onclose = checkDataChannelState;
  dataChannel.onmessage = event => {
    const jsonData = JSON.parse(event.data);
    if (jsonData.type == "chat-message") {
      insertMessageToDOM(jsonData, false);
    } else {
      console.info(jsonData.content, "субтитры");
      user !== jsonData.user ? processSubtitles(jsonData) : false;
    }
  };
}

function checkDataChannelState() {
  console.log("WebRTC channel state is:", dataChannel.readyState);
}

recognition.onresult = event => {
  const res = event.results[0][0].transcript;
  for (let el of event.results) {
    console.info(el[0].transcript);
    sendSubtitles(el[0].transcript);
    // sendSubtitles(el[0].transcript, user);
  }
};

function processSubtitles(options) {
  const subtitles = document.getElementById("subtitles");
  subtitles.innerText = options.content;
  //TO DO
}

function insertMessageToDOM(options, isFromMe) {
  const template = document.querySelector('template[data-template="message"]');
  const nameEl = template.content.querySelector(".message__name");
  if (options.emoji || options.name) {
    nameEl.innerText = options.emoji + " " + options.name;
  }
  template.content.querySelector(".message__bubble").innerText =
    options.content;
  const clone = document.importNode(template.content, true);
  const messageEl = clone.querySelector(".message");
  if (isFromMe) {
    messageEl.classList.add("message--mine");
  } else {
    messageEl.classList.add("message--theirs");
  }

  const messagesEl = document.querySelector(".messages");
  messagesEl.appendChild(clone);

  // Scroll to bottom
  messagesEl.scrollTop = messagesEl.scrollHeight - messagesEl.clientHeight;
}

const form = document.getElementById("form_test");
console.log(form);

form.addEventListener("submit", () => {
  if (dataChannel.readyState === "open") {
    const input = document.querySelector("#text");
    const value = input.value;
    input.value = "";

    const data = {
      type: "chat-message",
      name,
      content: value,
      emoji
    };

    dataChannel.send(JSON.stringify(data));

    insertMessageToDOM(data, true);
  }
});

function sendSubtitles(value) {
  const data = {
    type: "subtitles",
    user: "test",
    content: value
  };
  $("#subtitles").html(`Наставник: ${value}`);
  // console.info(data);
  // dataChannel.send(JSON.stringify(data));
}
