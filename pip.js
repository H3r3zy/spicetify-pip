(async function() {
        while (!Spicetify.React || !Spicetify.ReactDOM) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
        var pip = (() => {
  // src/app.tsx
  async function main() {
    var _a, _b, _c;
    while (!(Spicetify == null ? void 0 : Spicetify.Player) || !((_a = Spicetify == null ? void 0 : Spicetify.Playbar) == null ? void 0 : _a.Button) || !((_c = (_b = Spicetify == null ? void 0 : Spicetify.Player) == null ? void 0 : _b.data) == null ? void 0 : _c.item)) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const video = document.createElement("video");
    video.srcObject = canvas.captureStream();
    video.controls = true;
    await changeCanvasTrack();
    let metadataLoaded = false;
    video.onloadedmetadata = () => {
      metadataLoaded = true;
    };
    while (!metadataLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    function getAlbumImg() {
      var _a2, _b2, _c2;
      const track = Spicetify.Player.data.item;
      return (_c2 = (_b2 = (_a2 = track.images) == null ? void 0 : _a2.find((e) => e.label === "standard")) == null ? void 0 : _b2.url) == null ? void 0 : _c2.replaceAll("spotify:image:", "https://i.scdn.co/image/");
    }
    function setMediaSession() {
      const track = Spicetify.Player.data.item;
      const imageSrc = getAlbumImg();
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.name,
        artist: track.artists.map((e) => e.name).join(", "),
        album: track.album.name,
        artwork: [
          { src: imageSrc, sizes: "300x300", type: "image/jpeg" }
        ]
      });
    }
    async function changeCanvasTrack() {
      const image = new Image();
      image.crossOrigin = "true";
      image.src = getAlbumImg();
      await image.decode();
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, 512, 512);
      const gradient = context.createLinearGradient(0, 0, 412, 0);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 412, 80);
      const track = Spicetify.Player.data.item;
      context.font = "bold 30px sans-serif";
      context.fillStyle = "white";
      context.fillText(track.name, 10, 40);
      context.font = "20px sans-serif";
      context.fillText(track.artists.map((e) => e.name).join(", "), 10, 65);
      context.fillStyle = "rgba(0, 0, 0, 0.8)";
      context.fillRect(0, 502, 512, 10);
      await changeCanvasProgress();
    }
    async function changeCanvasProgress() {
      const context = canvas.getContext("2d");
      const track = Spicetify.Player.data.item;
      context.fillStyle = "#25D865";
      const progress = Spicetify.Player.getProgress() / track.duration.milliseconds;
      context.fillRect(0, 502, 512 * progress, 10);
    }
    const save = navigator.mediaSession.setActionHandler;
    navigator.mediaSession.setActionHandler = function() {
      save.apply(this, arguments);
    };
    function setActionHandler() {
      navigator.mediaSession.setActionHandler("play", async () => {
        await video.play();
        await Spicetify.Player.play();
      });
      navigator.mediaSession.setActionHandler("pause", async () => {
        await video.pause();
        await Spicetify.Player.pause();
      });
      navigator.mediaSession.setActionHandler("previoustrack", async () => {
        Spicetify.Player.back();
      });
      navigator.mediaSession.setActionHandler("nexttrack", async () => {
        Spicetify.Player.next();
      });
    }
    async function showPictureInPictureWindow() {
      setMediaSession();
      await changeCanvasTrack();
      await video.requestPictureInPicture();
      setActionHandler();
      await video.play();
      if (!Spicetify.Player.isPlaying()) {
        await video.pause();
      }
    }
    Spicetify.Player.addEventListener("songchange", async ({ data }) => {
      setMediaSession();
      await changeCanvasTrack();
    });
    Spicetify.Player.addEventListener("onplaypause", async ({ data }) => {
      if (data.isPaused) {
        await video.pause();
      } else {
        await video.play();
      }
    });
    Spicetify.Player.addEventListener("onprogress", async ($event) => {
      await changeCanvasProgress();
    });
    const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="17px" height="17px" viewBox="0 0 16 16" fill="#fff" class="bi bi-pip">
<path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
<path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z"/>
</svg>`;
    const pipButton = new Spicetify.Playbar.Button(
      "Mode Pip",
      icon,
      (element) => {
        if (!document.pictureInPictureElement) {
          showPictureInPictureWindow();
          pipButton.active = true;
        } else {
          document.exitPictureInPicture();
          pipButton.active = false;
        }
      },
      !document.pictureInPictureEnabled
    );
    video.addEventListener("leavepictureinpicture", () => {
      pipButton.active = false;
    });
  }
  var app_default = main;

  // ../AppData/Local/Temp/spicetify-creator/index.jsx
  (async () => {
    await app_default();
  })();
})();

      })();