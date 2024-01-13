async function main() {
  while (!Spicetify?.Player || !Spicetify?.Playbar?.Button || !Spicetify?.Player?.data?.item) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;

  const video = document.createElement('video');
  video.srcObject = canvas.captureStream();

  await changeCanvasTrack();

  let metadataLoaded = false;
  video.onloadedmetadata = () => {
    metadataLoaded = true;
  };
  while (!metadataLoaded) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  function getAlbumImg() {
    const track = Spicetify.Player.data.item;
    return track.images?.find((e) => e.label === 'standard')?.url
      ?.replaceAll('spotify:image:', 'https://i.scdn.co/image/');
  }

  function setMediaSession() {
    const track = Spicetify.Player.data.item;
    const imageSrc = getAlbumImg();
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artists.map((e) => e.name).join(', '),
      album: track.album.name,
      artwork: [
        { src: imageSrc, sizes: '300x300', type: 'image/jpeg' },
      ]
    });
  }

  async function changeCanvasTrack() {
    const image = new Image();
    image.crossOrigin = "true";
    image.src = getAlbumImg();
    await image.decode();

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, 512, 512);

    // create a gradient of black opacity from left to right for the text to be more readable
    const gradient = context.createLinearGradient(0, 0, 412, 0);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 412, 80);

    const track = Spicetify.Player.data.item;
    context.font = 'bold 30px sans-serif';
    context.fillStyle = 'white';
    context.fillText(track.name, 10, 40);
    context.font = '20px sans-serif';
    context.fillText(track.artists.map((e) => e.name).join(', '), 10, 65);

    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 502, 512, 10);

    await changeCanvasProgress();
  }

  async function changeCanvasProgress() {
    const context = canvas.getContext('2d');

    const track = Spicetify.Player.data.item;
    context.fillStyle = '#25D865';
    const progress = Spicetify.Player.getProgress() / track.duration.milliseconds;
    context.fillRect(0, 502, 512 * progress, 10);
  }

  function setActionHandler() {
    navigator.mediaSession.setActionHandler('play', async () => {
      await video.play();
      Spicetify.Player.play();
    });

    navigator.mediaSession.setActionHandler('pause', async () => {
      video.pause();
      Spicetify.Player.pause();
    });

    navigator.mediaSession.setActionHandler('previoustrack', Spicetify.Player.back);
    navigator.mediaSession.setActionHandler('nexttrack', Spicetify.Player.next);
  }

  async function showPictureInPictureWindow() {
    setMediaSession();
    await changeCanvasTrack();
    await video.requestPictureInPicture();
    setActionHandler();
    await video.play(); // play is required to show at least a frame
    if (!Spicetify.Player.isPlaying()) {
      video.pause();
    }
  }

  Spicetify.Player.addEventListener('songchange', () => {
    setMediaSession();
    changeCanvasTrack();
  });

  Spicetify.Player.addEventListener('onprogress', changeCanvasProgress);

  // Play/Pause
  Spicetify.Player.addEventListener('onplaypause', async ({ data }) => {
    if (data.isPaused) {
      video.pause();
      navigator.mediaSession.playbackState = 'paused';
    } else {
      await video.play();
      navigator.mediaSession.playbackState = 'playing';
    }
  });

  // Pip button
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="17px" height="17px" viewBox="0 0 16 16" class="bi bi-pip Svg-img-icon-small">
<path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
<path d="M8 8.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-5a.5.5 0 0 1-.5-.5v-3z"/>
</svg>`

  const pipButton = new Spicetify.Playbar.Button(
    'Mode Pip',
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

  video.addEventListener('leavepictureinpicture', () => {
    pipButton.active = false;
  });
}

export default main;
