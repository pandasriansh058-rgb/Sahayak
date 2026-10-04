// =====================================================
// SAHAYAK - JavaScript
// =====================================================


// ===============================
// 1. GET HTML ELEMENTS
// ===============================

const voiceBtn = document.getElementById("voiceBtn");
const voiceStatus = document.getElementById("voiceStatus");

const locationBtn = document.getElementById("locationBtn");
const locationStatus = document.getElementById("locationStatus");

const reportBtn = document.getElementById("reportBtn");

const description = document.getElementById("description");
const photo = document.getElementById("photo");


// ===============================
// 2. VARIABLES
// ===============================

// Stores user's location
let userLocation = null;


// ===============================
// 3. ONLINE / OFFLINE STATUS
// ===============================

function updateNetworkStatus() {

    if (navigator.onLine) {

        console.log("Internet connection available");

        // Try sending reports saved while offline
        syncOfflineReports();

    } else {

        console.log("Internet connection unavailable");
    }
}


// Check status when page loads
updateNetworkStatus();


// Detect internet coming back
window.addEventListener("online", updateNetworkStatus);


// Detect internet going away
window.addEventListener("offline", function () {

    console.log("Internet connection lost");

});


// ===============================
// 4. VOICE ASSISTANCE
// ===============================

// Check whether browser supports Speech Recognition

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


// If supported
if (SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    // Language
    recognition.lang = "en-IN";


    // When user clicks voice button
    voiceBtn.addEventListener("click", function () {

        voiceStatus.textContent = "🎤 Listening... Speak now.";

        recognition.start();

    });


    // When speech is successfully recognized
    recognition.addEventListener("result", function (event) {

        const spokenText =
            event.results[0][0].transcript;


        // Put speech into textarea
        description.value = spokenText;


        voiceStatus.textContent =
            "✅ Voice captured successfully.";

    });


    // When recognition stops
    recognition.addEventListener("end", function () {

        console.log("Voice recognition ended.");

    });


    // If an error occurs
    recognition.addEventListener("error", function (event) {

        console.error("Speech recognition error:", event.error);

        voiceStatus.textContent =
            "❌ Voice recognition failed. Please try again.";

    });


// Browser does not support Speech Recognition
} else {

    voiceBtn.disabled = true;

    voiceStatus.textContent =
        "Voice recognition is not supported in this browser.";

}


// ===============================
// 5. GET USER LOCATION
// ===============================

locationBtn.addEventListener("click", function () {

    // Check whether browser supports geolocation
    if (!navigator.geolocation) {

        locationStatus.textContent =
            "❌ Location is not supported by this browser.";

        return;
    }


    locationStatus.textContent =
        "📍 Getting your location...";


    navigator.geolocation.getCurrentPosition(

        // SUCCESS
        function (position) {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const accuracy = position.coords.accuracy;


            // Store location
            userLocation = {

                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy

            };


            locationStatus.textContent =
                `✅ Location captured (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;


            console.log("Location:", userLocation);

        },


        // ERROR
        function (error) {

            console.error("Location error:", error);


            locationStatus.textContent =
                "❌ Unable to get your location.";

        },


        // OPTIONS
        {
            enableHighAccuracy: true,

            timeout: 10000,

            maximumAge: 0
        }

    );

});


// ===============================
// 6. CREATE EMERGENCY REPORT
// ===============================

reportBtn.addEventListener("click", function () {

    const emergencyDescription =
        description.value.trim();


    // Check description
    if (emergencyDescription === "") {

        alert("Please describe the emergency.");

        return;
    }


    // Create report object

    const report = {

        id: "SH-" + Date.now(),

        description: emergencyDescription,

        location: userLocation,

        createdAt: new Date().toISOString(),

        status: navigator.onLine
            ? "READY_TO_SEND"
            : "SYNC_PENDING"

    };


    console.log("Emergency Report:", report);


    // ===============================
    // ONLINE MODE
    // ===============================

    if (navigator.onLine) {

        sendReportToServer(report);

    }


    // ===============================
    // OFFLINE MODE
    // ===============================

    else {

        saveReportOffline(report);

        alert(
            "⚠️ No internet connection.\n\n" +
            "Your emergency report has been saved on this device " +
            "and will be synchronized when connectivity returns."
        );

    }

});


// ===============================
// 7. SAVE REPORT LOCALLY
// ===============================

function saveReportOffline(report) {

    // Get existing reports
    const existingReports =
        JSON.parse(
            localStorage.getItem("sahayakReports")
        ) || [];


    // Add new report
    existingReports.push(report);


    // Save again
    localStorage.setItem(
        "sahayakReports",
        JSON.stringify(existingReports)
    );


    console.log(
        "Report saved locally:",
        report
    );

}


// ===============================
// 8. GET OFFLINE REPORTS
// ===============================

function getOfflineReports() {

    return JSON.parse(
        localStorage.getItem("sahayakReports")
    ) || [];

}


// ===============================
// 9. SYNC OFFLINE REPORTS
// ===============================

function syncOfflineReports() {

    const reports = getOfflineReports();


    if (reports.length === 0) {

        return;
    }


    console.log(
        `Found ${reports.length} offline report(s).`
    );


    reports.forEach(function (report) {

        sendReportToServer(report);

    });

}


// ===============================
// 10. SEND REPORT TO SERVER
// ===============================

function sendReportToServer(report) {

    console.log(
        "Preparing to send report:",
        report
    );


    /*
        IMPORTANT:

        We don't have a backend yet.

        So for now we simulate
        successful transmission.
    */


    setTimeout(function () {

        console.log(
            "✅ Report ready for server:",
            report
        );


        removeOfflineReport(report.id);

        alert(
            "✅ Emergency report prepared successfully."
        );

    }, 1000);

}


// ===============================
// 11. REMOVE SYNCED REPORT
// ===============================

function removeOfflineReport(reportId) {

    const reports = getOfflineReports();


    const remainingReports =
        reports.filter(function (report) {

            return report.id !== reportId;

        });


    localStorage.setItem(
        "sahayakReports",
        JSON.stringify(remainingReports)
    );


    console.log(
        "Report removed from offline storage:",
        reportId
    );

}