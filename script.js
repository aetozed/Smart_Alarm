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

// Initialize Firebase and the database instance
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// HTML element references
const ph_text = document.getElementById("ph_sensor");
const do_text = document.getElementById("do_sensor");
const turbidity_text = document.getElementById("turbidity_sensor");

// Variables to store the latest sensor values
let latest_ph_value = 0;
let latest_do_value = 0;
let latest_turbidity_value = 0;

// Firebase listeners
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

// Notification for alarm
const alarm_ref = ref(database, 'Sensor/Alarm');
onValue(alarm_ref, (snapshot) => {
    const alarm_value = snapshot.val();
    if (alarm_value === 1) {
        Notification.requestPermission().then(perm => {
            if (perm === "granted") {
                new Notification("Smart Alarm", {
                    body: "Terdeteksi air tercemar",
                    icon: "./assets/ico-robot.png",
                    tag: "Air Tercemar"
                });
            }
        });
    }
});

// Chart setup
var data_do = [];
var data_ph = [];
var data_tur = [];
const labels = [];

// Initialize the first timestamp
let currentTimestamp = new Date(); // Current time

// Function to format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Dynamic labels
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

// Function to update data every 10 seconds
setInterval(() => {
    // Add the latest sensor values to the respective arrays
    if (labels.length >= 10) {
        labels.shift();
        data_ph.shift();
        data_do.shift();
        data_tur.shift();
    }
    // Add the current or incremented timestamp to labels
    labels.push(formatTime(currentTimestamp));

    // Increment the timestamp by 20 minutes for the next label
    currentTimestamp.setMinutes(currentTimestamp.getMinutes() + 10);

    // Add sensor values to datasets
    data_ph.push(latest_ph_value);
    data_do.push(latest_do_value);
    data_tur.push(latest_turbidity_value);

    // Update the chart
    myChart.update();
}, 60000); // 10 seconds
