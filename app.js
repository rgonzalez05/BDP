import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getDatabase,
    ref,
    set,
    onValue,
    onDisconnect,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/*
    Reemplaza estos valores por los tuyos.
*/
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

const touchArea = document.getElementById("touchArea");
const statusText = document.getElementById("status");

const heartPrint = document.getElementById("heartPrint");
const message = document.getElementById("message");
const loveBurst = document.getElementById("loveBurst");

const myRef = ref(
    db,
    `rooms/${roomId}/users/${userId}`
);

const roomRef = ref(
    db,
    `rooms/${roomId}/users`
);

statusText.textContent = `Sala: ${roomId}`;

onDisconnect(myRef).remove();

function updateMyTouch(isTouching) {
    set(myRef, {
        isTouching,
        updatedAt: serverTimestamp()
    });
}

/*
    Mantener presionado
*/
touchArea.addEventListener("pointerdown", () => {
    updateMyTouch(true);
});

/*
    Soltar dedo
*/
touchArea.addEventListener("pointerup", () => {
    updateMyTouch(false);
});

touchArea.addEventListener("pointercancel", () => {
    updateMyTouch(false);
});

touchArea.addEventListener("pointerleave", () => {
    updateMyTouch(false);
});

/*
    Escuchar cambios en la sala
*/
onValue(roomRef, (snapshot) => {

    const users = snapshot.val() || {};

    const myData = users[userId];

    const otherEntry =
        Object.entries(users)
            .find(([id]) => id !== userId);

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

    /*
        Ambos presionando
    */
    if (meTouching && otherTouching) {

        heartPrint.classList.remove("waiting");
        heartPrint.classList.add("connected");

        message.textContent =
            "💗 Beso de pulgar conectado 💗";

        if (!window.hasConnected) {

            window.hasConnected = true;

            loveBurst.classList.add("show");

            setTimeout(() => {
                loveBurst.classList.remove("show");
            }, 1200);

            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        }

        return;
    }

    /*
        Yo estoy esperando
    */
    if (meTouching) {

        window.hasConnected = false;

        heartPrint.classList.remove("connected");
        heartPrint.classList.add("waiting");

        message.textContent =
            "💌 Esperando a la otra persona...";

        return;
    }

    /*
        La otra persona espera
    */
    if (otherTouching) {

        window.hasConnected = false;

        heartPrint.classList.remove("connected");
        heartPrint.classList.add("waiting");

        message.textContent =
            "💗 La otra persona está esperando tu pulgar";

        return;
    }

    /*
        Nadie toca
    */
    window.hasConnected = false;

    heartPrint.classList.remove("waiting");
    heartPrint.classList.remove("connected");

    message.textContent =
        "Coloca tu pulgar aquí";
});