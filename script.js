// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCMXf5L8NonN5QzDngc6qO47KXrEhUwlpE",
    authDomain: "smart-alarm-5271b.firebaseapp.com",
    databaseURL: "https://smart-alarm-5271b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "smart-alarm-5271b",
    storageBucket: "smart-alarm-5271b.appspot.com",
    messagingSenderId: "865584129322",
    appId: "1:865584129322:web:75b3072256e41191822a53"
};

// Initialize Firebase and database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Debugging: Log user agent for mobile testing
console.log("📱 User Agent:", navigator.userAgent);

// HTML element references
const ph_text = document.getElementById("ph_sensor");
const do_text = document.getElementById("do_sensor");
const turbidity_text = document.getElementById("turbidity_sensor");

// Variables for latest sensor values
let latest_ph_value = 0;
let latest_do_value = 0;
let latest_turbidity_value = 0;

// Request Notification Permission
document.addEventListener("DOMContentLoaded", () => {
    if (!("Notification" in window)) {
        console.log("❌ Notifications not supported in this browser.");
        return;
    }
    Notification.requestPermission().then(permission => {
        console.log("🔔 Notification permission:", permission);
    });
});

// Firebase Listeners for Sensor Data
const ph_ref = ref(database, 'Sensor/PH');
onValue(ph_ref, (snapshot) => {
    latest_ph_value = snapshot.val();
    ph_text.innerHTML = latest_ph_value;
});

const do_ref = ref(database, 'Sensor/DO');
onValue(do_ref, (snapshot) => {
    latest_do_value = snapshot.val();
    do_text.innerHTML = latest_do_value;
});

const turbidity_ref = ref(database, 'Sensor/Turbidity');
onValue(turbidity_ref, (snapshot) => {
    latest_turbidity_value = snapshot.val();
    turbidity_text.innerHTML = latest_turbidity_value;
});

// 🔔 Notification Trigger when Alarm = 1
const alarm_ref = ref(database, 'Sensor/Alarm');
onValue(alarm_ref, (snapshot) => {
    const alarm_value = snapshot.val();
    console.log("🚨 Alarm Value:", alarm_value); // Debugging

    if (alarm_value === 1 && document.visibilityState === "visible") {
        sendNotification();
    }
});

function sendNotification() {
    if (Notification.permission === "granted") {
        new Notification("Smart Alarm", {
            body: "Terdeteksi air tercemar",
            icon: "./assets/ico-robot.png",
            tag: "AirTercemar"
        });
        console.log("✅ Notification sent!");
    } else {
        console.log("⚠️ Notification permission denied.");
    }
}

// Detect Page Visibility (Debugging)
document.addEventListener("visibilitychange", () => {
    console.log("👀 Page Visibility:", document.visibilityState);
});

// Chart Setup
var data_do = [];
var data_ph = [];
var data_tur = [];
const labels = [];

// Initialize timestamp
let currentTimestamp = new Date();

// Function to format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Dynamic labels for Chart.js
const ctx = document.getElementById('myChart');

const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'DO',
            fill: true,
            backgroundColor: 'rgba(159,238,240, 0.3)',
            borderColor: '#6CE5E8',
            data: data_do,
        }, {
            label: 'PH',
            fill: true,
            backgroundColor: 'rgba(131,209,227, 0.3)',
            borderColor: '#41B8D5',
            data: data_ph,
        }, {
            label: 'Turbidity',
            fill: true,
            backgroundColor: 'rgba(119, 180, 210, 0.3)',
            borderColor: '#2D8BBA',
            data: data_tur,
        }]
    },
    options: {}
});

// Update Chart Every 10 Seconds
setInterval(() => {
    if (labels.length >= 10) {
        labels.shift();
        data_ph.shift();
        data_do.shift();
        data_tur.shift();
    }

    // Add the new timestamp label
    labels.push(formatTime(currentTimestamp));

    // Increment time by 10 minutes
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 10);

    // Add latest sensor values to chart
    data_ph.push(latest_ph_value);
    data_do.push(latest_do_value);
    data_tur.push(latest_turbidity_value);

    // Update chart
    myChart.update();
}, 10000); // Update every 10 seconds
