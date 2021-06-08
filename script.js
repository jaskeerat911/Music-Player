let optionsContainer = document.querySelector(".options-container");

let playPauseBtn = document.querySelector("#play-pause");
let prevTrackBtn = document.querySelector("#previous");
let nextTrackBtn = document.querySelector("#next");

let currTime = document.querySelector("#current-time");
let totalTime = document.querySelector("#total-time");

let songSlider = document.querySelector(".song-slider");
let songProgressBar = document.querySelector("#song-progress-bar");

let volumeBtn = document.querySelector(".volume-icon");
let muteBtn = document.querySelector(".mute-icon");
let volumeSlider = document.querySelector(".volume-slider");
let volumeProgressBar = document.querySelector("#volume-progress-bar");

let playlist = document.querySelector(".playlist");

//Create audio element
let currTrack = document.createElement("audio");
let songIdx = 0;
let isPlaying = false;
let updateTimer;

const songsList = data;
let playlistSongs = [];

// Options Container
let allOptions = document.querySelectorAll(".option");
let optionsTitle = ["Close", "Now Playing", "Music", "Playlist"];
allOptions.forEach(function (ele) {
    ele.addEventListener("click", function () {
        document.querySelector(".options-container").style.transition = "width 0.3s ease-in-out";
        if (!document.querySelector(".options").classList.contains("active")) {
            document.querySelector(".options").classList.add("active");
            document.querySelector(".options-container").style.width = "14rem";

            for (let i in allOptions) {
                allOptions[i].innerHTML += `<div class="option-title">${optionsTitle[i]}</div>`;
            }
        }
        else {
            if (ele.getAttribute("id") == "open-close") {
                document.querySelector(".options").classList.remove("active");
                document.querySelector(".options-container").style.width = "4rem";
                document.querySelectorAll(".option-title").forEach(function (ele) {
                    ele.remove();
                });
                document.querySelectorAll(".music-player-visibility").forEach(function (ele) {
                    ele.classList.remove("active");
                    document.querySelector(".main-player").classList.add("active");
                });

            }
        }
    });
});

//Add Songs to music 
let musicList = document.querySelector(".music-list")
for (let i = 0; i < songsList.length; i++){
    let songDetail = songsList[i].Title.split("-");
    let songTitle = songDetail[0];
    musicList.innerHTML += `<div class="song music-list-song song-${i}">
                                <div class="song-image">
                                    <img src="${songsList[i].Artwork}">
                                </div>
                                <div class="song-title">${songTitle}</div>
                            </div>`;    
}

document.querySelector("#music-list").addEventListener("click", function () {
    document.querySelectorAll(".music-player-visibility").forEach(function (ele) {
        ele.classList.remove("active");
        document.querySelector(".music-list-container").classList.add("active");
    });
});

document.querySelector("#playlist").addEventListener("click", function () {
    document.querySelectorAll(".music-player-visibility").forEach(function (ele) {
        ele.classList.remove("active");
        document.querySelector(".music-playlist-container").classList.add("active");
    });
});

document.querySelector("#now-playing").addEventListener("click", function () {
    document.querySelectorAll(".music-player-visibility").forEach(function (ele) {
        ele.classList.remove("active");
        document.querySelector(".main-player").classList.add("active");
    });
})

//Add songs to playlist
let playlistStorage = localStorage.getItem("playlist");
playlistStorage = JSON.parse(playlistStorage);
if (playlistStorage != null) {
    for (let i = 0; i < playlistStorage.length; i++){
        let songDetail = playlistStorage[i].Title.split("-");
        let songTitle = songDetail[0];
        playlist.innerHTML += `<div class="song playlist-song song-${playlistStorage[i].SongIdx}">
                                    <div class="song-image">
                                        <img src="${playlistStorage[i].Artwork}">
                                    </div>
                                    <div class="song-title">${songTitle}</div>
                                </div>`;
    }
}

// Controls Container
songSlider.addEventListener("change", function () {
    songProgressBar.style.width = parseInt(this.value) + 0.3 + "%";
});

songSlider.addEventListener("input", function () {
    songProgressBar.style.width = this.value + "%";
    seekTo();
});

volumeSlider.addEventListener("mousemove", function () {
    volumeProgressBar.style.width = this.value + "%";
});

volumeBtn.addEventListener("click", function () {
    if (document.querySelector(".volume-container").classList.contains("active")) {
        document.querySelector(".volume-container").classList.remove("active");
    } else {
        document.querySelector(".volume-container").classList.add("active");
    }
});

muteBtn.addEventListener("click", function () {
    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        currTrack.muted = false;
    } else {
        this.classList.add("selected");
        currTrack.muted = true;
    }
})

volumeSlider.addEventListener("input", function () {
    volumeProgressBar.style.width = this.value + "%";
    currTrack.volume = parseInt(this.value) / 100;
});

nextTrackBtn.addEventListener("click", nextTrack);
prevTrackBtn.addEventListener("click", prevTrack);

document.querySelectorAll(".music-list-song").forEach(function (ele) {
    ele.addEventListener("click", function () {
        songIdx = ele.classList[2].split("-")[1];
        loadTrack(songIdx);
        playTrack();
    });
});

document.querySelectorAll(".playlist-song").forEach(function (ele) {
    ele.addEventListener("click", function () {
        songIdx = ele.classList[2].split("-")[1];
        loadTrack(songIdx);
        playTrack();
    });
});

document.querySelector("#add-to-playlist").addEventListener("click", function () {
    if (songsList[songIdx].addToPlaylist) {
        this.classList.add("selected");
    }

    if (this.classList.contains("selected")) {
        this.classList.remove("selected");
        removeFromPlaylist();
    } else {
        this.classList.add("selected");
        addToPlaylist();
    }
})

//load track
function loadTrack(songIdx) {
    if(!isPlaying){
        document.querySelector(".music-image").style.animationPlayState = 'paused';
    }
    clearInterval(updateTimer);
    resetValues();
    currTrack.src = songsList[songIdx].Link;
    currTrack.load();

    let songDetail = songsList[songIdx].Title.split("-");
    let songTitle = songDetail[0];
    let songArtist = songDetail[1];

    document.querySelector(".music-image img").setAttribute("src", songsList[songIdx].Artwork);
    document.querySelector(".song-img img").setAttribute("src", songsList[songIdx].Artwork);
    document.querySelector(".song-detail .song-title").innerText = songTitle;
    document.querySelector(".song-detail .song-artist").innerText = songArtist;

    for (let i = 0; i < playlistStorage.length; i++) {
        if (playlistStorage[i].SongIdx == songIdx)
            songsList[songIdx].addToPlaylist = true;
    }

    if (songsList[songIdx].addToPlaylist) {
        document.querySelector("#add-to-playlist").classList.add("selected");
    }
    else {
        document.querySelector("#add-to-playlist").classList.remove("selected");
    }

    updateTimer = setInterval(function () {
        seekUpdate();
        songSlider.dispatchEvent(new Event('change'));
    }, 1000);

    currTime.addEventListener("ended", nextTrack);
}

//Load the first track of the list
loadTrack(songIdx);

function resetValues() {
    currTime.textContent = "00:00";
    totalTime.textContent = "00:00";
    songSlider.value = 0;
}

playPauseBtn.addEventListener("click", function () {
    if (!isPlaying) {
        playTrack();
        document.querySelector(".music-image").style.animationPlayState = 'running';
    }
    else {
        pauseTrack();
        document.querySelector(".music-image").style.animationPlayState = 'paused';
    }
})

function playTrack() {
    currTrack.play();
    isPlaying = true;
    playPauseBtn.innerText = "pause";
}

function pauseTrack() {
    currTrack.pause();
    isPlaying = false;
    playPauseBtn.innerText = "play_arrow";
}

function seekTo() {
    currTrack.currentTime = Math.floor((songSlider.value * currTrack.duration) / 100);
}

function seekUpdate() {
    songSlider.value = Math.floor((currTrack.currentTime / currTrack.duration) * 100);

    if (!isNaN(currTrack.duration)) {
        let currentMinutes = Math.floor(currTrack.currentTime / 60);
        let currentSeconds = Math.floor(currTrack.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(currTrack.duration / 60);
        let durationSeconds = Math.floor(currTrack.duration - durationMinutes * 60);

        if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
        if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
        if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

        currTime.textContent = currentMinutes + ":" + currentSeconds;
        totalTime.textContent = durationMinutes + ":" + durationSeconds;
    }
}

function nextTrack() {
    if (songIdx == songsList.length) {
        songIdx = 0;
    }
    else {
        songIdx++;
    }

    loadTrack(songIdx);
    playTrack();
}

function prevTrack() {
    if (songIdx == 0) {
        songIdx = songsList.length - 1;
    }
    else {
        songIdx--;
    }

    loadTrack(songIdx);
    playTrack();
}


function addToPlaylist() {
    if (playlistStorage != null) {
        playlistStorage = JSON.parse(localStorage.getItem("playlist"));
        playlistSongs = playlistStorage;
    }
    playlistSong = {};
    songsList[songIdx].addToPlaylist = true;
    let songForPlaylist = songsList[songIdx];
    let songDetail = songForPlaylist.Title.split("-");
    let songTitle = songDetail[0];
    playlist.innerHTML += `<div class="song playlist-song song-${songIdx}">
                                <div class="song-image">
                                    <img src="${songForPlaylist.Artwork}">
                                </div>
                                <div class="song-title">${songTitle}</div>
                            </div>`;
    
    playlistSong["SongIdx"] = songIdx;
    playlistSong["Artwork"] = songForPlaylist.Artwork;
    playlistSong["Title"] = songTitle;
    playlistSong["Link"] = songForPlaylist.Link;
    playlistSong["addToPlaylist"] = true;

    playlistSongs.push(playlistSong);
    
    document.querySelectorAll(".playlist-song").forEach(function (ele) {
        ele.addEventListener("click", function () {
            songIdx = ele.classList[2].split("-")[1];
            loadTrack(songIdx);
            playTrack();
        })
    })

    localStorage.setItem("playlist", JSON.stringify(playlistSongs));
    
}

function removeFromPlaylist() {
    songsList[songIdx].addToPlaylist = false;
    document.querySelector(`.playlist-song.song-${songIdx}`).remove();
    if (playlistStorage != null) {
        playlistStorage = JSON.parse(localStorage.getItem("playlist"));
        playlistSongs = playlistStorage;
    }

    for (let i = 0; i < playlistSongs.length; i++){
        if (playlistSongs[i].SongIdx == songIdx) {
            playlistSongs.splice(i, 1);
        }
    }

    localStorage.setItem("playlist", JSON.stringify(playlistSongs));

}

