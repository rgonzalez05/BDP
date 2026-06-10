import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue,
    onDisconnect,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
   FIREBASE
   ========================= */

const firebaseConfig = {
    apiKey: "AIzaSyD51lAq7RXbwWT_WN8A_CkDPBKWivYhecQ",
    authDomain: "beso-de-pulgar.firebaseapp.com",
    databaseURL: "https://beso-de-pulgar-default-rtdb.firebaseio.com",
    projectId: "beso-de-pulgar",
    storageBucket: "beso-de-pulgar.firebasestorage.app",
    messagingSenderId: "358484407501",
    appId: "1:358484407501:web:0e1d4cdeb03299d411e584"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   SALA
   ========================= */

const params = new URLSearchParams(window.location.search);

let roomId = params.get("room");

if (!roomId) {

    roomId = crypto.randomUUID().slice(0, 8);

    window.history.replaceState(
        null,
        "",
        `?room=${roomId}`
    );
}

const userId = crypto.randomUUID();

/* =========================
   ELEMENTOS
   ========================= */

const touchArea = document.getElementById("touchArea");
const statusText = document.getElementById("status");

const heartPrint = document.getElementById("heartPrint");
const message = document.getElementById("message");
const loveBurst = document.getElementById("loveBurst");

const shareButton =
    document.getElementById("shareButton");

/* =========================
   FIREBASE REFS
   ========================= */

const myRef = ref(
    db,
    `rooms/${roomId}/users/${userId}`
);

const roomRef = ref(
    db,
    `rooms/${roomId}/users`
);

statusText.textContent =
    `Sala: ${roomId}`;

onDisconnect(myRef).remove();

/* =========================
   COMPARTIR SALA
   ========================= */

shareButton?.addEventListener(
    "click",
    async () => {

        const shareUrl =
            window.location.href;

        try {

            if (navigator.share) {

                await navigator.share({
                    title: "Beso de Pulgar 💗",
                    text: "Coloca tu pulgar conmigo 💗",
                    url: shareUrl
                });

                return;
            }

            await navigator.clipboard.writeText(
                shareUrl
            );

            alert(
                "💌 Enlace copiado al portapapeles"
            );

        } catch (error) {

            console.error(error);
        }
    }
);

/* =========================
   ACTUALIZAR ESTADO
   ========================= */

function updateMyTouch(isTouching) {

    set(myRef, {
        isTouching,
        updatedAt: serverTimestamp()
    });
}

/* =========================
   EVENTOS
   ========================= */

function startTouch() {
    updateMyTouch(true);
}

function endTouch() {
    updateMyTouch(false);
}

touchArea.addEventListener(
    "pointerdown",
    startTouch
);

touchArea.addEventListener(
    "pointerup",
    endTouch
);

touchArea.addEventListener(
    "pointercancel",
    endTouch
);

touchArea.addEventListener(
    "pointerleave",
    endTouch
);

touchArea.addEventListener(
    "touchstart",
    startTouch,
    { passive: false }
);

touchArea.addEventListener(
    "touchend",
    endTouch
);

touchArea.addEventListener(
    "touchcancel",
    endTouch
);

/* =========================
   SINCRONIZACIÓN
   ========================= */
function createHeartRain() {

    const hearts = [
        "💗",
        "💖",
        "💕",
        "💘",
        "💝"
    ];

    for (let i = 0; i < 20; i++) {

        const heart =
            document.createElement("div");

        heart.className =
            "floating-heart";

        heart.textContent =
            hearts[
                Math.floor(
                    Math.random() * hearts.length
                )
            ];

        heart.style.left =
            `${Math.random() * 100}%`;

        heart.style.bottom =
            "80px";

        heart.style.animationDelay =
            `${Math.random() * 0.8}s`;

        document.body.appendChild(
            heart
        );

        setTimeout(() => {
            heart.remove();
        }, 3000);
    }
}

onValue(roomRef, (snapshot) => {

    const users =
        snapshot.val() || {};

    const myData =
        users[userId];

    const otherEntry =
        Object.entries(users)
            .find(
                ([id]) =>
                    id !== userId
            );

    const otherData =
        otherEntry
            ? otherEntry[1]
            : null;

    const meTouching =
        myData?.isTouching || false;

    const otherTouching =
        otherData?.isTouching || false;

    statusText.textContent =
        `Sala: ${roomId}`;

    /* Ambos tocando */

    if (
        meTouching &&
        otherTouching
    ) {

        heartPrint.classList.remove(
            "waiting"
        );

        heartPrint.classList.add(
            "connected"
        );

        message.textContent =
            "💗 Beso de pulgar conectado 💗";

        if (!window.hasConnected) {

    window.hasConnected = true;

    loveBurst.classList.add("show");

    createHeartRain();

    setTimeout(() => {
        loveBurst.classList.remove("show");
    }, 1200);

    if (navigator.vibrate) {
        navigator.vibrate([
            100,
            50,
            100
        ]);
    }
}

        return;
    }

    /* Yo esperando */

    if (meTouching) {

        window.hasConnected =
            false;

        heartPrint.classList.remove(
            "connected"
        );

        heartPrint.classList.add(
            "waiting"
        );

        message.textContent =
            "💌 Esperando a la otra persona...";

        return;
    }

    /* Otra persona esperando */

    if (otherTouching) {

        window.hasConnected =
            false;

        heartPrint.classList.remove(
            "connected"
        );

        heartPrint.classList.add(
            "waiting"
        );

        message.textContent =
            "💗 La otra persona está esperando tu pulgar";

        return;
    }

    /* Nadie toca */

    window.hasConnected =
        false;

    heartPrint.classList.remove(
        "waiting"
    );

    heartPrint.classList.remove(
        "connected"
    );

    message.textContent =
        "Coloca tu pulgar aquí";
});

/* =========================
   BLOQUEOS IOS
   ========================= */

document.addEventListener(
    "contextmenu",
    (e) => {
        e.preventDefault();
    }
);

document.addEventListener(
    "dragstart",
    (e) => {
        e.preventDefault();
    }
);

document.addEventListener(
    "touchstart",
    (e) => {

        if (
            e.touches.length === 1
        ) {
            e.preventDefault();
        }

    },
    { passive: false }
);