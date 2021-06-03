const auth_link = "https://www.strava.com/oauth/token";
const activities_base_link = "https://www.strava.com/api/v3/athlete/activities?access_token=";

function getActivities(info) {
    let token = info.access_token;
    const activities_link = `${activities_base_link}${token}`;
    fetch(activities_link)
        .then((res) => res.json())
        .then(function (data) {
            var map = L.map('map').setView([42.664853, 23.352025], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            let lineColor = "";
            let totalKm = 0;

            for (let x = 0; x < data.length; x++) {
                // console.log(data[x]);
                totalKm += (+data[x].distance)/1000;
                let poly = data[x].map.summary_polyline;
                if (poly) {
                    let coordinates = L.Polyline.fromEncoded(data[x].map.summary_polyline).getLatLngs();

                    if (data[x].type == "Ride") {
                        lineColor = "red";
                    } else if (data[x].type == "Run") {
                        lineColor = "green";
                    } else {
                        lineColor = "blue";
                    }

                    L.polyline(
                        coordinates,
                        {
                            color: lineColor,
                            weight: 5,
                            opacity: .7,
                            lineJoin: "round"
                        }
                    ).addTo(map);
                }
            }

            document.getElementById("totalKm").append(`${totalKm.toFixed(2)} km`);
        })
}

function reAuthorize() {
    fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: secrets.CLIENT_ID,
            client_secret: secrets.CLIENT_SECRET,
            refresh_token: secrets.REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    }).then((res) => res.json())
        .then(res => getActivities(res));
}

reAuthorize();