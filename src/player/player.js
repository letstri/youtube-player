const VOLUME_ICONS = {
  up: 'fa-volume-up',
  down: 'fa-volume-down',
  off: 'fa-volume-off',
  mute: 'fa-volume-mute',
};
const FULLSCREEN_ICONS = {
  compress: 'fa-compress',
  expand: 'fa-expand',
};

class Player {
  constructor(selector) {
    this.player = document.querySelector(selector);
    this.video = this.player?.querySelector('video');

    if (!this.player || !this.video) {
      throw new Error('Player or video not found');
    }

    this.initVideoListeners();
    this.initPlayerListeners();
    this.initTimelineListeners();
    this.initPageListeners();
  }

  initVideoListeners() {
    this.video.addEventListener('click', this.toggleVideo.bind(this));
    this.video.addEventListener('loadedmetadata', () => {
      this.setVideoDuration();
      this.updateVolumeInput();
    });
    this.video.addEventListener('timeupdate', () => {
      this.setVideoDuration();
      this.toggleInterface();
    });
    this.video.addEventListener('dblclick', this.toggleFullscreen.bind(this));
    this.video.addEventListener('volumechange', this.updateVolumeInput.bind(this));
  }

  initPlayerListeners() {
    this.player.addEventListener('fullscreenchange', this.checkFullscreen.bind(this));
    this.player.addEventListener('mousemove', this.checkInterface.bind(this));
    this.player.querySelector('.j-toggle-video').addEventListener('click', this.toggleVideo.bind(this));
    this.player.querySelector('.j-volume-input').addEventListener('input', this.setVolume.bind(this));
    this.player.querySelector('.j-toggle-volume').addEventListener('click', () => {
      this.video.volume = Number(this.video.volume !== 1);
    });
    this.player.querySelector('.j-fullscreen').addEventListener('click', this.toggleFullscreen.bind(this));
  }

  initTimelineListeners() {
    const line = this.player.querySelector('.j-line');

    line.addEventListener('mousemove', this.calcGhostLine.bind(this));
    line.addEventListener('click', (event) => {
      const { left } = event.target.getBoundingClientRect();
      this.video.currentTime = this.calcNeededLine(event, left);
    });
  }

  initPageListeners() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        this.toggleVideo();
      } else if (event.code === 'ArrowRight') {
        this.video.currentTime += 5;
      } else if (event.code === 'ArrowLeft') {
        this.video.currentTime -= 5;
      }
    });
  }

  setVolume({ target }) {
    this.video.volume = target.value / 100;
  }

  toggleVideo() {
    this.isPlaying = !this.isPlaying;

    const icon = this.player.querySelector('.j-toggle-video .fas');

    this.player.querySelector('.j-play').style.display = this.isPlaying ? 'block' : 'none';
    this.player.querySelector('.j-pause').style.display = !this.isPlaying ? 'block' : 'none';

    icon.classList.toggle('fa-play', !this.isPlaying);
    icon.classList.toggle('fa-pause', this.isPlaying);

    this.video[this.isPlaying ? 'play' : 'pause']();
  }

  fixNumber(number) {
    return number < 10 ? `0${number}` : `${number}`;
  }

  formatTime(seconds) {
    return `${Math.floor(seconds / 60)}:${this.fixNumber(Math.floor(seconds % 60))}`;
  }

  setVideoDuration() {
    const duration = Number(this.video.duration.toFixed());
    const current = Number(this.video.currentTime.toFixed());
    const newTime = `${this.formatTime(current)} / ${this.formatTime(duration)}`;
    const durationElement = this.player.querySelector('.j-duration');

    this.player.querySelector('.j-line-current').style.width = `${current / (duration / 100)}%`;

    if (durationElement.innerHTML !== newTime) {
      durationElement.innerHTML = newTime;
    }
  }

  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      this.player.requestFullscreen();
    }
  }

  checkFullscreen() {
    const isFullscreen = Boolean(document.fullscreenElement);
    const icon = this.player.querySelector('.j-fullscreen .fas');

    icon.classList.toggle(FULLSCREEN_ICONS.expand, !isFullscreen);
    icon.classList.toggle(FULLSCREEN_ICONS.compress, isFullscreen);

    this.player.classList.toggle('player--fullscreen', isFullscreen);
  }

  calcNeededLine(event, left) {
    const needPercent = ((event.clientX - left) / event.target.offsetWidth);

    return this.video.duration * needPercent;
  }

  updateVolumeInput() {
    const toggleClasses = this.player.querySelector('.j-toggle-volume').classList;
    this.player.querySelector('.j-volume-input').value = this.video.volume * 100;

    toggleClasses.remove(VOLUME_ICONS.up, VOLUME_ICONS.down, VOLUME_ICONS.off, VOLUME_ICONS.mute);

    if (this.video.volume > 0.66) {
      toggleClasses.add(VOLUME_ICONS.up);
    } else if (this.video.volume > 0.33) {
      toggleClasses.add(VOLUME_ICONS.down);
    } else if (this.video.volume > 0) {
      toggleClasses.add(VOLUME_ICONS.off);
    } else if (this.video.volume === 0) {
      toggleClasses.add(VOLUME_ICONS.mute);
    }
  }

  calcGhostLine(event) {
    const { left } = event.target.getBoundingClientRect();
    const hint = this.player.querySelector('.j-hint');
    const ghost = this.player.querySelector('.j-line-ghost');

    hint.innerHTML = this.formatTime(this.calcNeededLine(event, left));
    hint.style.left = `${event.clientX - (left + (hint.offsetWidth / 2))}px`;
    ghost.style.width = `${event.clientX - left}px`;
  }

  toggleInterface() {
    this.player.classList.toggle('player--hide-interface', this.isHiddenInterface);
  }

  checkInterface() {
    this.isHiddenInterface = false;

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.timeout = setTimeout(() => {
      this.isHiddenInterface = true;
    }, 5000);
  }
}

export default Player;
