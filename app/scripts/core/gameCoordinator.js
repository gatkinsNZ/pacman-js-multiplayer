import Ghost from '/app/scripts/characters/ghost.js'
import Pacman from '/app/scripts/characters/pacman.js'
import GameEngine from '/app/scripts/core/gameEngine.js'
import Pickup from '/app/scripts/pickups/pickup.js'
import CharacterUtil from '/app/scripts/utilities/characterUtil.js'
import SoundManager from '/app/scripts/utilities/soundManager.js'
import Timer from '/app/scripts/utilities/timer.js'
import gameControl from '/app/scripts/utilities/controller/gamecontrol.js';

export default class GameCoordinator {
  constructor() {
    this.gameUi = document.getElementById('game-ui');
    this.rowTop = document.getElementById('row-top');
    this.mazeDiv = document.getElementById('maze');
    this.mazeImg = document.getElementById('maze-img');
    this.mazeCover = document.getElementById('maze-cover');
    this.pointsDisplay = document.getElementById('points-display');
    this.highScoreDisplay = document.getElementById('high-score-display');
    this.extraLivesDisplay = document.getElementById('extra-lives');
    this.levelDisplay = document.getElementById('level-display');
    this.levelImage1 = document.getElementById('level-image1');
    this.levelImage2 = document.getElementById('level-image2');
    this.fruitDisplay = document.getElementById('fruit-display');
    this.mainMenu = document.getElementById('main-menu-container');
    this.gameStartButton = document.getElementById('game-start');
    this.pauseButton = document.getElementById('pause-button');
    this.soundButton = document.getElementById('sound-button');
    this.leftCover = document.getElementById('left-cover');
    this.rightCover = document.getElementById('right-cover');
    this.pausedText = document.getElementById('paused-text');
    this.bottomRow = document.getElementById('bottom-row');
    this.movementButtons = document.getElementById('movement-buttons');
    this.gamepadInfoText = document.getElementById("gamepad-info");
    this.level1Button = document.getElementById("level_1_btn");
    this.level5Button = document.getElementById("level_5_btn");
    this.level9Button = document.getElementById("level_9_btn");
    this.level11Button = document.getElementById("level_11_btn");
    this.videoContainer = document.getElementById("video-container");
    this.pacmanVideo = document.getElementById("pacman-video");
    
    this.mazeArray = [
      ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
      ['XooooooooooooXXooooooooooooX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XOXXXXoXXXXXoXXoXXXXXoXXXXOX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XooooooooooooooooooooooooooX'],
      ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
      ['XoXXXXoXXoXXXXXXXXoXXoXXXXoX'],
      ['XooooooXXooooXXooooXXooooooX'],
      ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
      ['XXXXXXoXXXXX XX XXXXXoXXXXXX'],
      ['XXXXXXoXX          XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX X      X XXoXXXXXX'],
      ['      o   X      X   o      '],
      ['XXXXXXoXX X      X XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX          XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XXXXXXoXX XXXXXXXX XXoXXXXXX'],
      ['XooooooooooooXXooooooooooooX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XoXXXXoXXXXXoXXoXXXXXoXXXXoX'],
      ['XOooXXooooooo  oooooooXXooOX'],
      ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
      ['XXXoXXoXXoXXXXXXXXoXXoXXoXXX'],
      ['XooooooXXooooXXooooXXooooooX'],
      ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
      ['XoXXXXXXXXXXoXXoXXXXXXXXXXoX'],
      ['XooooooooooooooooooooooooooX'],
      ['XXXXXXXXXXXXXXXXXXXXXXXXXXXX'],
    ];

    this.resetLevel = 1;
    this.maxFps = 120;
    this.tileSize = 8;
    this.scale = this.determineScale(1);
    this.scaledTileSize = this.tileSize * this.scale;
    this.firstGame = true;

    this.movementKeys = {
      // WASD
      87: 'up',
      83: 'down',
      65: 'left',
      68: 'right',

      // Arrow Keys
      38: 'up',
      40: 'down',
      37: 'left',
      39: 'right',
    };

    this.fruitPoints = {
      1: 100,
      2: 300,
      3: 500,
      4: 700,
      5: 1000,
      6: 2000,
      7: 3000,
      8: 5000,
    };

    this.mazeArray.forEach((row, rowIndex) => {
      this.mazeArray[rowIndex] = row[0].split('');
    });

    this.gameStartButton.addEventListener('click', this.startButtonClick.bind(this));
    this.level1Button.addEventListener('click', this.levelButtonClick.bind(this, 1));
    this.level5Button.addEventListener('click', this.levelButtonClick.bind(this, 5));
    this.level9Button.addEventListener('click', this.levelButtonClick.bind(this, 9));
    this.level11Button.addEventListener('click', this.levelButtonClick.bind(this, 11));
    this.pauseButton.addEventListener('click', this.handlePauseKey.bind(this));
    this.soundButton.addEventListener('click', this.soundButtonClick.bind(this));
    this.registerControllers();

    this.preloadAssets()
  }

  /**
   * Recursive method which determines the largest possible scale the game's graphics can use
   * @param {Number} scale
   */
  determineScale(scale) {
    const availableScreenHeight = Math.min(
      document.documentElement.clientHeight,
      window.innerHeight || 0,
    );
    const availableScreenWidth = Math.min(
      document.documentElement.clientWidth,
      window.innerWidth || 0,
    );
    const scaledTileSize = this.tileSize * scale;

    // The original Pac-Man game leaves 5 tiles of height (3 above, 2 below) surrounding the
    // maze for the UI. See app\style\graphics\spriteSheets\references\mazeGridSystemReference.png
    // for reference.
    const mazeTileHeight = this.mazeArray.length + 5;
    const mazeTileWidth = this.mazeArray[0][0].split('').length;

    if (
      scaledTileSize * mazeTileHeight < availableScreenHeight
      && scaledTileSize * mazeTileWidth < availableScreenWidth
    ) {
      return this.determineScale(scale + 1);
    }

    return scale - 1;
  }

  /**
   * Reveals the game underneath the loading covers and starts gameplay
   */
  startButtonClick() {
    this.leftCover.style.left = '-50%';
    this.rightCover.style.right = '-50%';
    this.mainMenu.style.opacity = 0;
    this.gameStartButton.disabled = true;

    setTimeout(() => {
      this.mainMenu.style.visibility = 'hidden';
    }, 1000);

    this.reset();
    if (this.firstGame) {
      this.firstGame = false;
      this.init();
    }
    this.startGameplay(true);
  }

  levelButtonClick(level) {
    this.resetLevel = level;
  }

  /**
   * Toggles the master volume for the soundManager, and saves the preference to storage
   */
  soundButtonClick() {
    const newVolume = this.soundManager.masterVolume === 1 ? 0 : 1;
    this.soundManager.setMasterVolume(newVolume);
    localStorage.setItem('volumePreference', newVolume);
    this.setSoundButtonIcon(newVolume);
  }

  /**
   * Sets the icon for the sound button
   */
  setSoundButtonIcon(newVolume) {
    this.soundButton.innerHTML = newVolume === 0 ? 'volume_off' : 'volume_up';
  }

  /**
   * Displays an error message in the event assets are unable to download
   */
  displayErrorMessage() {
    const loadingContainer = document.getElementById('loading-container');
    const errorMessage = document.getElementById('error-message');
    loadingContainer.style.opacity = 0;
    setTimeout(() => {
      loadingContainer.remove();
      errorMessage.style.opacity = 1;
      errorMessage.style.visibility = 'visible';
    }, 1500);
  }

  /**
   * Load all assets into a hidden Div to pre-load them into memory.
   * There is probably a better way to read all of these file names.
   */
  preloadAssets() {
    const loadingContainer = document.getElementById('loading-container');
    const loadingPacman = document.getElementById('loading-pacman');
    const loadingDotMask = document.getElementById('loading-dot-mask');

    const imgBase = 'app/style/graphics/spriteSheets/';
    const imgSources = [
      // Pacman
      `${imgBase}characters/pacman/arrow_down.svg`,
      `${imgBase}characters/pacman/arrow_left.svg`,
      `${imgBase}characters/pacman/arrow_right.svg`,
      `${imgBase}characters/pacman/arrow_up.svg`,
      `${imgBase}characters/pacman/pacman_death.svg`,
      `${imgBase}characters/pacman/pacman_error.svg`,
      `${imgBase}characters/pacman/pacman_down.svg`,
      `${imgBase}characters/pacman/pacman_left.svg`,
      `${imgBase}characters/pacman/pacman_right.svg`,
      `${imgBase}characters/pacman/pacman_up.svg`,

      // Blinky
      `${imgBase}characters/ghosts/blinky/blinky_down_angry.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_down_annoyed.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_down.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_left_angry.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_left_annoyed.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_left.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_right_angry.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_right_annoyed.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_right.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_up_angry.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_up_annoyed.svg`,
      `${imgBase}characters/ghosts/blinky/blinky_up.svg`,

      // Clyde
      `${imgBase}characters/ghosts/clyde/clyde_down.svg`,
      `${imgBase}characters/ghosts/clyde/clyde_left.svg`,
      `${imgBase}characters/ghosts/clyde/clyde_right.svg`,
      `${imgBase}characters/ghosts/clyde/clyde_up.svg`,

      // Inky
      `${imgBase}characters/ghosts/inky/inky_down.svg`,
      `${imgBase}characters/ghosts/inky/inky_left.svg`,
      `${imgBase}characters/ghosts/inky/inky_right.svg`,
      `${imgBase}characters/ghosts/inky/inky_up.svg`,

      // Pinky
      `${imgBase}characters/ghosts/pinky/pinky_down.svg`,
      `${imgBase}characters/ghosts/pinky/pinky_left.svg`,
      `${imgBase}characters/ghosts/pinky/pinky_right.svg`,
      `${imgBase}characters/ghosts/pinky/pinky_up.svg`,

      // Ghosts Common
      `${imgBase}characters/ghosts/eyes_down.svg`,
      `${imgBase}characters/ghosts/eyes_left.svg`,
      `${imgBase}characters/ghosts/eyes_right.svg`,
      `${imgBase}characters/ghosts/eyes_up.svg`,
      `${imgBase}characters/ghosts/scared_blue.svg`,
      `${imgBase}characters/ghosts/scared_white.svg`,

      // Dots
      `${imgBase}pickups/pacdot.svg`,
      `${imgBase}pickups/powerPellet.svg`,

      // Fruit
      `${imgBase}pickups/apple.svg`,
      `${imgBase}pickups/bell.svg`,
      `${imgBase}pickups/cherry.svg`,
      `${imgBase}pickups/galaxian.svg`,
      `${imgBase}pickups/key.svg`,
      `${imgBase}pickups/melon.svg`,
      `${imgBase}pickups/orange.svg`,
      `${imgBase}pickups/strawberry.svg`,

      // Text
      `${imgBase}text/ready.svg`,

      // Points
      `${imgBase}text/100.svg`,
      `${imgBase}text/200.svg`,
      `${imgBase}text/300.svg`,
      `${imgBase}text/400.svg`,
      `${imgBase}text/500.svg`,
      `${imgBase}text/700.svg`,
      `${imgBase}text/800.svg`,
      `${imgBase}text/1000.svg`,
      `${imgBase}text/1600.svg`,
      `${imgBase}text/2000.svg`,
      `${imgBase}text/3000.svg`,
      `${imgBase}text/5000.svg`,

      // Maze
      `${imgBase}maze/maze_blue.svg`,

      // Misc
      'app/style/graphics/extra_life.png',
      'app/style/graphics/a_button.png',

      // Kids
      'app/style/graphics/kids/Isla.png',
      'app/style/graphics/kids/Jesse.png',
      'app/style/graphics/kids/Joe.png',
      'app/style/graphics/kids/Lachlan.png',
      'app/style/graphics/kids/Max.png',
      'app/style/graphics/kids/Milly.png',
      'app/style/graphics/kids/Olive.png',
      'app/style/graphics/kids/Ruby.png',
      'app/style/graphics/kids/Grandma.png',
      'app/style/graphics/kids/Basil1.png',
      'app/style/graphics/kids/Basil2.png',
    ];

    const audioBase = 'app/style/audio/';
    const audioSources = [
      `${audioBase}game_start.mp3`,
      `${audioBase}pause.mp3`,
      `${audioBase}pause_beat.mp3`,
      `${audioBase}siren_1.mp3`,
      `${audioBase}siren_2.mp3`,
      `${audioBase}siren_3.mp3`,
      `${audioBase}power_up.mp3`,
      `${audioBase}extra_life.mp3`,
      `${audioBase}eyes.mp3`,
      `${audioBase}eat_ghost.mp3`,
      `${audioBase}fruit.mp3`,
      `${audioBase}dot_1.mp3`,
      `${audioBase}dot_2.mp3`,
      `${audioBase}/death/death (1).mp3`,
      `${audioBase}/death/death (2).mp3`,
      `${audioBase}/death/death (3).mp3`,
      `${audioBase}/death/death (4).mp3`,
      `${audioBase}/death/death (5).mp3`,
      `${audioBase}/death/death (6).mp3`,
      `${audioBase}/death/death (7).mp3`,
      `${audioBase}/death/death (8).mp3`,
      `${audioBase}/death/death (9).mp3`,
      `${audioBase}/death/death (10).mp3`,
      `${audioBase}/death/death (11).mp3`,
      `${audioBase}/death/death (12).mp3`,
      `${audioBase}/death/death (13).mp3`,
      `${audioBase}/death/death (14).mp3`,
      `${audioBase}/death/death (15).mp3`,
      `${audioBase}/death/death (16).mp3`,
      `${audioBase}/death/death (17).mp3`,
      `${audioBase}/death/death (18).mp3`,
      `${audioBase}/death/death (19).mp3`,
      `${audioBase}/death/death (20).mp3`,
      `${audioBase}/death/death (21).mp3`,
      `${audioBase}/death/death (22).mp3`,
      `${audioBase}/death/death (23).mp3`,
      `${audioBase}/death/death (24).mp3`,
      `${audioBase}/death/death (25).mp3`,
      `${audioBase}/death/death (26).mp3`,
      `${audioBase}/death/death (27).mp3`,
      `${audioBase}/death/death (28).mp3`,
      `${audioBase}/death/death (29).mp3`,
      `${audioBase}/level_end/level_end_1.mp3`,
      `${audioBase}/level_end/level_end_2.mp3`,
      `${audioBase}/level_end/level_end_3.mp3`,
      `${audioBase}/level_end/level_end_4.mp3`,
      `${audioBase}/level_end/level_end_5.mp3`,
      `${audioBase}/level_end/level_end_6.mp3`,
      `${audioBase}/level_end/level_end_7.mp3`,
      `${audioBase}/level_end/level_end_8.mp3`,
      `${audioBase}/level_end/level_end_9.mp3`,
      `${audioBase}/level_end/level_end_10.mp3`,
      `${audioBase}/level_end/level_end_11.mp3`,
      `${audioBase}/powerup/powerup (1).mp3`,
      `${audioBase}/powerup/powerup (2).mp3`,
      `${audioBase}/powerup/powerup (3).mp3`,
      `${audioBase}/powerup/powerup (4).mp3`,
      `${audioBase}/powerup/powerup (5).mp3`,
      `${audioBase}/powerup/powerup (6).mp3`,
      `${audioBase}/powerup/powerup (7).mp3`,
      `${audioBase}/powerup/powerup (8).mp3`,
      `${audioBase}/powerup/powerup (9).mp3`,
      `${audioBase}/powerup/powerup (10).mp3`,
      `${audioBase}/powerup/powerup (11).mp3`,
      `${audioBase}/powerup/powerup (12).mp3`,
      `${audioBase}/powerup/powerup (13).mp3`,
      `${audioBase}/powerup/powerup (14).mp3`,
    ];

    const totalSources = imgSources.length + audioSources.length;
    this.remainingSources = totalSources;

    loadingPacman.style.left = '0';
    loadingDotMask.style.width = '0';

    Promise.all([
      this.createElements(imgSources, 'img', totalSources, this),
      this.createElements(audioSources, 'audio', totalSources, this),
    ])
      .then(() => {
        loadingContainer.style.opacity = 0;

        setTimeout(() => {
          loadingContainer.remove();
          this.mainMenu.style.opacity = 1;
          this.mainMenu.style.visibility = 'visible';
        }, 1500);

        return;
      })
      .catch((err) => {
        console.log("Error Loading assets: " + err);
        this.displayErrorMessage();
      })
  }

  /**
   * Iterates through a list of sources and updates the loading bar as the assets load in
   * @param {String[]} sources
   * @param {('img'|'audio')} type
   * @param {Number} totalSources
   * @param {Object} gameCoord
   * @returns {Promise}
   */
  createElements(sources, type, totalSources, gameCoord) {
    const loadingContainer = document.getElementById('loading-container');
    const preloadDiv = document.getElementById('preload-div');
    const loadingPacman = document.getElementById('loading-pacman');
    const containerWidth = loadingContainer.scrollWidth
      - loadingPacman.scrollWidth;
    const loadingDotMask = document.getElementById('loading-dot-mask');

    const gameCoordRef = gameCoord;

    return new Promise((resolve, reject) => {
      let loadedSources = 0;

      sources.forEach((source) => {
        const element = type === 'img' ? new Image() : new Audio();
        preloadDiv.appendChild(element);

        const elementReady = () => {
          gameCoordRef.remainingSources -= 1;
          loadedSources += 1;
          const percent = 1 - gameCoordRef.remainingSources / totalSources;
          loadingPacman.style.left = `${percent * containerWidth}px`;
          loadingDotMask.style.width = loadingPacman.style.left;

          if (loadedSources === sources.length) {
            resolve();
          }
        };

        if (type === 'img') {
          element.onload = elementReady;
          element.onerror = reject;
        } else {
          element.addEventListener('canplaythrough', elementReady);
          element.onerror = reject;
        }

        element.src = source;

        if (type === 'audio') {
          element.load();
        }
      });
    });
  }

  /**
   * Resets gameCoordinator values to their default states
   */
  reset() {
    this.activeTimers = [];
    this.points = 0;
    this.speedLevel = 1;
    this.pacmenOnLevel = 4;
    this.horizontalControlsReversed = false;
    this.verticalControlsReversed = false;
    this.level = this.resetLevel;
    this.lives = 2;
    this.extraLifeGiven = false;
    this.remainingDots = 0;
    this.allowKeyPresses = true;
    this.allowPacmanMovement = false;
    this.allowPause = false;
    this.cutscene = true;
    this.highScore = localStorage.getItem('highScore');

    if (this.firstGame) {
      setInterval(() => {
        this.collisionDetectionLoop();
      }, 500);

      this.pacman = new Pacman(
        this.scaledTileSize,
        this.mazeArray,
        new CharacterUtil(),
        'pacman',
        0,
        4
      );
      this.pacman.enabled = true;
      this.pacman2 = new Pacman(
        this.scaledTileSize,
        this.mazeArray,
        new CharacterUtil(),
        'pacman_george',
        1,
        4
      );
      this.pacman3 = new Pacman(
        this.scaledTileSize,
        this.mazeArray,
        new CharacterUtil(),
        'pacman_george2',
        2,
        4
      );
      this.pacman4 = new Pacman(
        this.scaledTileSize,
        this.mazeArray,
        new CharacterUtil(),
        'pacman_george3',
        3,
        4
      );
      this.pacmans = [this.pacman, this.pacman2, this.pacman3, this.pacman4];


      this.blinky = new Ghost(
        this.scaledTileSize,
        this.mazeArray,
        this.pacmans,
        'blinky',
        this.speedLevel,
        new CharacterUtil(),
      );
      this.pinky = new Ghost(
        this.scaledTileSize,
        this.mazeArray,
        this.pacmans,
        'pinky',
        this.speedLevel,
        new CharacterUtil(),
      );
      this.inky = new Ghost(
        this.scaledTileSize,
        this.mazeArray,
        this.pacmans,
        'inky',
        this.speedLevel,
        new CharacterUtil(),
        this.blinky,
      );
      this.clyde = new Ghost(
        this.scaledTileSize,
        this.mazeArray,
        this.pacmans,
        'clyde',
        this.speedLevel,
        new CharacterUtil(),
      );
      this.fruit = new Pickup(
        'fruit',
        this.scaledTileSize,
        13.5,
        17,
        this.pacmans,
        this.mazeDiv,
        100,
      );
    }

    this.ghosts = [this.blinky, this.pinky, this.inky, this.clyde];
    this.scaredGhosts = [];
    this.eyeGhosts = 0;

    this.entityList = [
      this.pacman,
      this.pacman2,
      this.pacman3,
      this.pacman4,
      this.blinky,
      this.pinky,
      this.inky,
      this.clyde,
      this.fruit,
    ];

    this.setupForLevel();

    if (this.firstGame) {
      this.drawMaze(this.mazeArray, this.entityList);
      this.soundManager = new SoundManager();
      this.setUiDimensions();
    } else {
      this.pacmans.forEach((pacman) => {
        pacman.reset(true);
      });
      this.ghosts.forEach((ghost) => {
        ghost.reset(true);
      });
      this.pickups.forEach((pickup) => {
        if (pickup.type !== 'fruit') {
          this.remainingDots += 1;
          pickup.reset();
          this.entityList.push(pickup);
        }
      });
    }

    this.pointsDisplay.innerHTML = '00';
    this.highScoreDisplay.innerHTML = this.highScore || '00';
    this.clearDisplay(this.fruitDisplay);

    const volumePreference = parseInt(
      localStorage.getItem('volumePreference') || 1,
      10,
    );
    this.setSoundButtonIcon(volumePreference);
    this.soundManager.setMasterVolume(volumePreference);
  }

  /**
   * Calls necessary setup functions to start the game
   */
  init() {
    this.registerEventListeners();

    this.gameEngine = new GameEngine(this.maxFps, this.entityList);
    this.gameEngine.start();
  }

  isMainMenuDisplaying() {
    return this.mainMenu.style.opacity == 1
  }

  /**
   * Adds HTML elements to draw on the webpage by iterating through the 2D maze array
   * @param {Array} mazeArray - 2D array representing the game board
   * @param {Array} entityList - List of entities to be used throughout the game
   */
  drawMaze(mazeArray, entityList) {
    this.pickups = [this.fruit];

    this.mazeDiv.style.height = `${this.scaledTileSize * 31}px`;
    this.mazeDiv.style.width = `${this.scaledTileSize * 28}px`;
    this.gameUi.style.width = `${this.scaledTileSize * 28}px`;
    this.bottomRow.style.minHeight = `${this.scaledTileSize * 2}px`;
    this.dotContainer = document.getElementById('dot-container');

    mazeArray.forEach((row, rowIndex) => {
      row.forEach((block, columnIndex) => {
        if (block === 'o' || block === 'O') {
          const type = block === 'o' ? 'pacdot' : 'powerPellet';
          const points = block === 'o' ? 10 : 50;
          const dot = new Pickup(
            type,
            this.scaledTileSize,
            columnIndex,
            rowIndex,
            this.pacmans,
            this.dotContainer,
            points,
          );

          entityList.push(dot);
          this.pickups.push(dot);
          this.remainingDots += 1;
        }
      });
    });
  }

  setUiDimensions() {
    this.gameUi.style.fontSize = `${this.scaledTileSize}px`;
    this.rowTop.style.marginBottom = `${this.scaledTileSize}px`;
  }

  /**
   * Loop which periodically checks which pickups are nearby Pacman.
   * Pickups which are far away will not be considered for collision detection.
   */
  collisionDetectionLoop() {
    this.pickups.forEach((pickup) => {
      pickup.checkPacmanProximity(null, null, false);
    });

    //the below is actually defunct for multiple pacmans - as they will be spread out in maze and so a pickup will always be close
    // this.pacmans.forEach((pacman) => {
    //   if (pacman.position) {
    //     const maxDistance = pacman.velocityPerMs * 750;
    //     const pacmanCenter = {
    //       x: pacman.position.left + this.scaledTileSize,
    //       y: pacman.position.top + this.scaledTileSize,
    //     };

    //     // Set this flag to TRUE to see how two-phase collision detection works!
    //     const debugging = false;

    //     this.pickups.forEach((pickup) => {
    //       //console.log("pickup check" + pacman.name);
    //       pickup.checkPacmanProximity(maxDistance, pacmanCenter, debugging);
    //     });
    //   }
    // });
  }

  /**
   * Displays "Ready!" and allows Pacman to move after a breif delay
   * @param {Boolean} initialStart - Special condition for the game's beginning
   */
  startGameplay(initialStart) {
    if (initialStart) {
      this.soundManager.play('game_start');
    }

    this.scaredGhosts = [];
    this.eyeGhosts = 0;
    this.allowPacmanMovement = false;

    const left = this.scaledTileSize * 11;
    const top = this.scaledTileSize * 16.5;
    const duration = initialStart ? 4500 : 2000;
    const width = this.scaledTileSize * 6;
    const height = this.scaledTileSize * 2;

    let levelNameAndImages = this.determineLevelNameAndImg();
    this.levelDisplay.innerHTML = levelNameAndImages.name;
    this.levelImage1.src = levelNameAndImages.imageurl1;
    this.levelImage2.src = levelNameAndImages.imageurl2;
    this.displayText({ left, top }, 'ready', duration, width, height);
    this.updateExtraLivesDisplay();

    new Timer(() => {
      this.allowPause = true;
      this.cutscene = false;
      this.soundManager.setCutscene(this.cutscene);
      this.soundManager.setAmbience(this.determineSiren(this.remainingDots));

      this.allowPacmanMovement = true;

      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.moving = true;
      });

      this.ghostCycle('scatter');

      this.idleGhosts = [this.pinky, this.inky, this.clyde];
      this.releaseGhost();
    }, duration);
  }

  determineLevelNameAndImg() {
    switch(this.level) {
      case 1:
        return { 
          name: "Lachlan", 
          imageurl1: "app/style/graphics/kids/Lachlan.png",
          imageurl2: "app/style/graphics/kids/Lachlan.png",
         };
      case 2:
        return { 
          name: "Joe", 
          imageurl1: "app/style/graphics/kids/Joe.png", 
          imageurl2: "app/style/graphics/kids/Joe.png" 
        };
      case 3:
        return { 
          name: "Ruby", 
          imageurl1: "app/style/graphics/kids/Ruby.png",
          imageurl2: "app/style/graphics/kids/Ruby.png"
        };
      case 4:
        return { 
          name: "Olive", 
          imageurl1: "app/style/graphics/kids/Olive.png",
          imageurl2: "app/style/graphics/kids/Olive.png",
        };
      case 5:
        return { 
          name: "Jesse", 
          imageurl1: "app/style/graphics/kids/Jesse.png",
          imageurl2: "app/style/graphics/kids/Jesse.png",
        };
      case 6:
        return { 
          name: "Max", 
          imageurl1: "app/style/graphics/kids/Max.png",
          imageurl2: "app/style/graphics/kids/Max.png",
        };
      case 7:
        return { 
          name: "Isla", 
          imageurl1: "app/style/graphics/kids/Isla.png",
          imageurl2: "app/style/graphics/kids/Isla.png",
        };
      case 8:
        return { 
          name: "Milly", 
          imageurl1: "app/style/graphics/kids/Milly.png",
          imageurl2: "app/style/graphics/kids/Milly.png",
        };
      case 9:
        return { 
          name: "Grandma", 
          imageurl1: "app/style/graphics/kids/Grandma.png",
          imageurl2: "app/style/graphics/kids/Grandma.png",
        };
      case 10:
        return { 
          name: "Basil", 
          imageurl1: "app/style/graphics/kids/Basil2.png",
          imageurl2: "app/style/graphics/kids/Basil1.png",
        };
      case 11:
        return { 
          name: "Final!", 
          imageurl1: "app/style/graphics/kids/Basil2.png",
          imageurl2: "app/style/graphics/kids/Basil1.png",
        };

      // more cases...
      default:
        return { name: this.level, imageurl: "" };
    }
  }

  /**
   * Clears out all children nodes from a given display element
   * @param {String} display
   */
  clearDisplay(display) {
    while (display.firstChild) {
      display.removeChild(display.firstChild);
    }
  }

  /**
   * Displays extra life images equal to the number of remaining lives
   */
  updateExtraLivesDisplay() {
    this.clearDisplay(this.extraLivesDisplay);

    for (let i = 0; i < this.lives; i += 1) {
      const extraLifePic = document.createElement('img');
      extraLifePic.setAttribute('src', 'app/style/graphics/extra_life.svg');
      extraLifePic.style.height = `${this.scaledTileSize * 2}px`;
      this.extraLivesDisplay.appendChild(extraLifePic);
    }
  }

  /**
   * Displays a rolling log of the seven most-recently eaten fruit
   * @param {String} rawImageSource
   */
  updateFruitDisplay(rawImageSource) {
    const parsedSource = rawImageSource.slice(
      rawImageSource.indexOf('(') + 1,
      rawImageSource.indexOf(')'),
    );

    if (this.fruitDisplay.children.length === 7) {
      this.fruitDisplay.removeChild(this.fruitDisplay.firstChild);
    }

    const fruitPic = document.createElement('img');
    fruitPic.setAttribute('src', parsedSource);
    fruitPic.style.height = `${this.scaledTileSize * 2}px`;
    this.fruitDisplay.appendChild(fruitPic);
  }

  /**
   * Cycles the ghosts between 'chase' and 'scatter' mode
   * @param {('chase'|'scatter')} mode
   */
  ghostCycle(mode) {
    const delay = mode === 'scatter' ? 7000 : 20000;
    const nextMode = mode === 'scatter' ? 'chase' : 'scatter';

    this.ghostCycleTimer = new Timer(() => {
      this.ghosts.forEach((ghost) => {
        ghost.changeMode(nextMode);
      });

      this.ghostCycle(nextMode);
    }, delay);
  }

  /**
   * Releases a ghost from the Ghost House after a delay
   */
  releaseGhost() {
    if (this.idleGhosts.length > 0) {
      const delay = Math.max((8 - (this.speedLevel - 1) * 4) * 1000, 0);

      this.endIdleTimer = new Timer(() => {
        this.idleGhosts[0].endIdleMode();
        this.idleGhosts.shift();
      }, delay);
    }
  }

  /**
   * Register listeners for various game sequences
   */
  registerEventListeners() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('awardPoints', this.awardPoints.bind(this));
    window.addEventListener('deathSequence', this.deathSequence.bind(this));
    window.addEventListener('dotEaten', this.dotEaten.bind(this));
    window.addEventListener('powerUp', this.powerUp.bind(this));
    window.addEventListener('eatGhost', this.eatGhost.bind(this));
    window.addEventListener('restoreGhost', this.restoreGhost.bind(this));
    window.addEventListener('addTimer', this.addTimer.bind(this));
    window.addEventListener('removeTimer', this.removeTimer.bind(this));
    window.addEventListener('releaseGhost', this.releaseGhost.bind(this));

    const directions = ['up', 'down', 'left', 'right'];

    //onscreen controls - not currently working
    directions.forEach((direction) => {
      document
        .getElementById(`button-${direction}`)
        .addEventListener('touchstart', () => {
          this.changeDirection(this.pacmans[0], direction);
        }, { passive: true} );
    });
  }

  registerControllers() {
    gameControl.on('connect', gamepad => {
      gamepad.set('axeThreshold', 0.85); //lowering
      console.log('A new gamepad was connected!');
      console.log(gamepad);

      let controllers = gameControl.getGamepads();
      let numberOfControllers = Object.keys(controllers).length
      if(numberOfControllers >= 2) //TODO: change to 4
      {  
        console.log(numberOfControllers + ' controllers connected');
        this.gameStartButton.disabled = false;
        //this.gameStartButton.style.visibility = 'visible';
        this.gamepadInfoText.textContent = numberOfControllers + " controllers connected.\r\n You can start the game by pressing A";
        if (!this.isMainMenuDisplaying()) 
          this.handlePauseKey();
      }
      else {
        //this.gameStartButton.style.visibility = 'hidden';
        this.gamepadInfoText.textContent = "Only " + numberOfControllers + " controllers connected.\r\n Waiting for 4 gamepads to connect...\r\n(turn on and press A)";
      }

      //A button
      gamepad.before('button0', () => {
        //if in main menu and can start game (e.g. have correct numbner of controllers), start it
        if (this.isMainMenuDisplaying()) {
          if(!this.gameStartButton.disabled)
            this.startButtonClick();
        }          
      });

      //D-pad
      gamepad.before('button12', () => {
        this.controllerToPacmanMapMove(gamepad, "up");
      });

      gamepad.before('button13', () => {
        this.controllerToPacmanMapMove(gamepad, "down");
      });
  
      gamepad.before('button14', () => {
        this.controllerToPacmanMapMove(gamepad, "left");
      });

      gamepad.before('button15', () => {
        this.controllerToPacmanMapMove(gamepad, "right");
      });
        
      //left analog stick
      gamepad.before('up', () => {
        this.controllerToPacmanMapMove(gamepad, "up");
      });

      gamepad.before('down', () => {
        this.controllerToPacmanMapMove(gamepad, "down");
      });

      gamepad.before('left', () => {
        this.controllerToPacmanMapMove(gamepad, "left");
      });

      gamepad.before('right', () => {
        this.controllerToPacmanMapMove(gamepad, "right");
      });

      //triggers - left
      gamepad.before('button4', () => {
        this.controllerToPacmanMapVibrate(gamepad, "left")
      });

      //triggers - right
      gamepad.before('button5', () => {
        this.controllerToPacmanMapVibrate(gamepad, "right");
      });
 
    });
    
    gameControl.on('disconnect', gamepad => {
        console.log('A gamepad was disconnected!');
        let controllers = gameControl.getGamepads();
        let numberOfControllers = Object.keys(controllers).length;

        if(numberOfControllers < 2)
        {  
          console.log('Only ' + numberOfControllers + ' controllers connected');
          this.gameStartButton.disabled = true;
          this.gamepadInfoText.textContent = "Only " + numberOfControllers + " controllers connected.\r\n Waiting for 4 gamepads to connect...\r\n(turn on and press A)";
          if (this.gameEngine.running)
            this.handlePauseKey();
        }
        else {
          this.gamepadInfoText.textContent = numberOfControllers + " controllers connected.\r\n You can start the game by pressing A";
        }   
    });
  }

  controllerToPacmanMapMove(gamepad, direction)
  {
    let controllerNumber = parseInt(gamepad.id)
    console.log("controller: " + controllerNumber)

    if(controllerNumber <= this.pacmans.length) {
      if(this.pacmenOnLevel == 4)
        this.changeDirection(this.pacmans[controllerNumber], direction);
      else if (this.pacmenOnLevel == 2) {
        let pacman = this.pacmans[0];

        if(controllerNumber > 1)
          pacman = this.pacmans[1];

        if((controllerNumber == 0 || controllerNumber == 2) && (direction == "up" || direction =="down"))
          this.changeDirection(pacman, direction);
        else if((controllerNumber == 1 || controllerNumber == 3) && (direction == "left" || direction =="right"))
          this.changeDirection(pacman, direction);
      }
      else if (this.pacmenOnLevel == 1) {
        let pacman = this.pacmans[0];

        if(controllerNumber == 0 && direction == "up")
          this.changeDirection(pacman, direction);
        else if(controllerNumber == 1 && direction == "down")
          this.changeDirection(pacman, direction);
        else if(controllerNumber == 2 && direction == "left")
          this.changeDirection(pacman, direction);
        else if(controllerNumber == 3 && direction == "right")
          this.changeDirection(pacman, direction);
      }


        // } else
        // if(controllerNumber == 3 && (direction == "up" || direction =="down"))
        //   this.changeDirection(this.pacmans[1], direction);
        // else if(controllerNumber == 4 && (direction == "left" || direction =="right"))
        //   this.changeDirection(this.pacmans[1], direction);
    }
    else
      console.log("Too many controllers!")
  }

  controllerToPacmanMapVibrate(gamepad, triggerLocation)
  {
    let controllerNumber = parseInt(gamepad.id)
    console.log("controller: " + controllerNumber)

    let controllers = gameControl.getGamepads();
    let numberOfControllers = Object.keys(controllers).length
    console.log("controllers count: " + numberOfControllers);

    let controllerNumberToRumble = 0;
    if (numberOfControllers == 4)
      if(triggerLocation == 'left') {
        controllerNumberToRumble = controllerNumber - 1;
        if (controllerNumberToRumble < 0)
          controllerNumberToRumble = 3;
        controllers[controllerNumberToRumble].vibrate(0.8, 300, 'left-trigger');
      }
      else if(triggerLocation == 'right') {
        controllerNumberToRumble = controllerNumber + 1;
        if (controllerNumberToRumble > 3)
          controllerNumberToRumble = 0;
        controllers[controllerNumberToRumble].vibrate(0.8, 300, 'right-trigger');
      }
  }

  rumbleAllControllers()
  {
    let controllers = gameControl.getGamepads();

    for(const [key, controller] of Object.entries(controllers)) {
      controller.vibrate(1, 200);
      new Timer(() => {
        controller.vibrate(1, 200);
        new Timer(() => {
          controller.vibrate(1, 200);
        }, 300);
      }, 300);
    }
  }

  stopRumbleAllControllers()
  {
    let controllers = gameControl.getGamepads();

    for(const [key, controller] of Object.entries(controllers)) {
      controller.resetVibrate();
    }
  }

  rumbleControllerDeath(index)
  {
    let controllers = gameControl.getGamepads();
    let controller = controllers[index]

    if (controller) {
      controller.vibrate(0.9, 200, 'left-trigger');
      new Timer(() => {
        controller.vibrate(0.9, 200, 'right-trigger');
        new Timer(() => {
          controller.vibrate(0.9, 200, 'left-trigger');
          new Timer(() => {
            controller.vibrate(0.9, 200, 'right-trigger');
            new Timer(() => {
              controller.vibrate(0.9, 200, 'left-trigger');
              new Timer(() => {
                controller.vibrate(0.9, 200, 'right-trigger');
                new Timer(() => {
                  controller.vibrate(0.9, 200, 'left-trigger');
                  new Timer(() => {
                    controller.vibrate(0.9, 200, 'right-trigger');
                  }, 300);
                }, 300);
              }, 300);
            }, 300);
          }, 300);
        }, 300);
      }, 300);
    }
  }

  // controllerToPacmanMapMove(gamepad, direction)
  // {
  //   let controllerNumber = parseInt(gamepad.id)

  //   if(controllerNumber <= this.pacmans.length) {
  //     if(this.pacmenOnLevel == 4)
  //       return this.pacmans[controllerNumber];
  //     else if (this.pacmenOnLevel == 2)
  //       if(controllerNumber)
  //       return this.pacmans[controllerNumber % 1];
  //   }
  //   else
  //     return this.pacmans[1];
  // }

  /**
   * Calls Pacman's changeDirection event if certain conditions are met
   * @param {({'up'|'down'|'left'|'right'})} direction
   */
  changeDirection(pacman, direction) {
    if (this.allowKeyPresses && this.gameEngine.running) {
      if (this.horizontalControlsReversed) {
        if (direction == 'left')
          direction = 'right'
        else if (direction == 'right')
          direction = 'left'
      }

      if (this.verticalControlsReversed) {
        if (direction == 'up')
          direction = 'down'
        else if (direction == 'down')
          direction = 'up'
      }

      pacman.changeDirection(direction, this.allowPacmanMovement);
    }
  }

  /**
   * Calls various class functions depending upon the pressed key
   * @param {Event} e - The keydown event to evaluate
   */
  handleKeyDown(e) {
    if (e.keyCode === 27) {
      // ESC key
      this.handlePauseKey();
    } else if (e.keyCode === 81) {
      // Q
      this.soundButtonClick();
    } else if (this.movementKeys[e.keyCode]) {
      if(this.pacmans.length > 1 && e.keyCode > 41)
        this.changeDirection(this.pacmans[1], this.movementKeys[e.keyCode]);
      else
        this.changeDirection(this.pacmans[0], this.movementKeys[e.keyCode]);
    }
  }

  /**
   * Handle behavior for the pause key
   */
  handlePauseKey() {
    if (this.allowPause) {
      this.allowPause = false;

      setTimeout(() => {
        if (!this.cutscene) {
          this.allowPause = true;
        }
      }, 500);

      this.gameEngine.changePausedState(this.gameEngine.running);
      this.soundManager.play('pause');

      if (this.gameEngine.started) {
        this.soundManager.resumeAmbience();
        this.gameUi.style.filter = 'unset';
        this.movementButtons.style.filter = 'unset';
        this.pausedText.style.visibility = 'hidden';
        this.pauseButton.innerHTML = 'pause';
        this.activeTimers.forEach((timer) => {
          timer.resume();
        });
      } else {
        this.soundManager.stopAmbience();
        this.soundManager.setAmbience('pause_beat', true);
        this.gameUi.style.filter = 'blur(5px)';
        this.movementButtons.style.filter = 'blur(5px)';
        this.pausedText.style.visibility = 'visible';
        this.pauseButton.innerHTML = 'play_arrow';
        this.activeTimers.forEach((timer) => {
          timer.pause();
        });
      }
    }
  }

  /**
   * Adds points to the player's total
   * @param {({ detail: { points: Number }})} e - Contains a quantity of points to add
   */
  awardPoints(e) {
    this.points += e.detail.points;
    this.pointsDisplay.innerText = this.points;
    if (this.points > (this.highScore || 0)) {
      this.highScore = this.points;
      this.highScoreDisplay.innerText = this.points;
      localStorage.setItem('highScore', this.highScore);
    }

    if (this.points >= 10000 && !this.extraLifeGiven) {
      this.extraLifeGiven = true;
      this.soundManager.play('extra_life');
      this.lives += 1;
      this.updateExtraLivesDisplay();
    }

    if (e.detail.type === 'fruit') {
      const left = e.detail.points >= 1000
        ? this.scaledTileSize * 12.5
        : this.scaledTileSize * 13;
      const top = this.scaledTileSize * 16.5;
      const width = e.detail.points >= 1000
        ? this.scaledTileSize * 3
        : this.scaledTileSize * 2;
      const height = this.scaledTileSize * 2;

      this.displayText({ left, top }, e.detail.points, 2000, width, height);
      this.soundManager.play('fruit');
      this.updateFruitDisplay(
        this.fruit.determineImage('fruit', e.detail.points),
      );
    }
  }

  /**
   * Animates Pacman's death, subtracts a life, and resets character positions if
   * the player has remaining lives.
   */
  deathSequence(e) {
    const pacman = e.detail.pacman;

    this.allowPause = false;
    this.cutscene = true;
    this.soundManager.setCutscene(this.cutscene);
    this.soundManager.stopAmbience();
    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } });
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } }); 

    this.allowKeyPresses = false;
    //stop all pacmans - makes more consistent
    this.pacmans.forEach((pacman) => {
      pacman.moving = false;
    });
    this.ghosts.forEach((ghost) => {
      const ghostRef = ghost;
      ghostRef.moving = false;
    });

    this.rumbleControllerDeath(pacman.pacmanIndex);
    new Timer(() => {
      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.display = false;
      });
      pacman.prepDeathAnimation();
      this.playDeathSound();

      if (this.lives > 0) {
        this.lives -= 1;

        new Timer(() => {
          this.mazeCover.style.visibility = 'visible';
          new Timer(() => {
            this.allowKeyPresses = true;
            this.mazeCover.style.visibility = 'hidden';
            this.pacmans.forEach((pacman) => {
              pacman.reset();
            });
            this.ghosts.forEach((ghost) => {
              ghost.reset();
            });
            this.fruit.hideFruit();
            this.stopRumbleAllControllers();
            this.startGameplay();
          }, 500);
        }, 2250);
      } else {
        this.gameOver();
      }
    }, 750);
  }

  playDeathSound() {
    let min = 1;
    let max = 29;
    
    let selectionIndex = Math.floor(Math.random() * (max - min + 1)) + min;
    this.soundManager.play('death/death ('+ selectionIndex + ')');
  }

  /**
   * Displays GAME OVER text and displays the menu so players can play again
   */
  gameOver() {
    localStorage.setItem('highScore', this.highScore);

    new Timer(() => {
      this.displayText(
        {
          left: this.scaledTileSize * 9,
          top: this.scaledTileSize * 16.5,
        },
        'game_over',
        4000,
        this.scaledTileSize * 10,
        this.scaledTileSize * 2,
      );
      this.fruit.hideFruit();

      new Timer(() => {
        this.leftCover.style.left = '0';
        this.rightCover.style.right = '0';

        setTimeout(() => {
          this.mainMenu.style.opacity = 1;
          this.gameStartButton.disabled = false;
          this.mainMenu.style.visibility = 'visible';
        }, 1000);
      }, 2500);
    }, 2250);
  }

  /**
   * Handle events related to the number of remaining dots
   */
  dotEaten() {
    this.remainingDots -= 1;

    this.soundManager.playDotSound();

    if (this.remainingDots === 174 || this.remainingDots === 74) {
      this.createFruit();
    }

    if (this.remainingDots === 40 || this.remainingDots === 20) {
      this.speedUpBlinky();
    }

    //Testing:
    //TODO: testing change back to 0
    // if (this.remainingDots === 0) {
    //   this.advanceLevel();
    // }
    if (this.remainingDots === 120) {
      this.remainingDots = 0;
      this.advanceLevel();
    }
  }

  /**
   * Creates a bonus fruit for ten seconds
   */
  createFruit() {
    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.fruit.showFruit(this.fruitPoints[this.level] || 5000);
    this.fruitTimer = new Timer(() => {
      this.fruit.hideFruit();
    }, 10000);
  }

  /**
   * Speeds up Blinky and raises the background noise pitch
   */
  speedUpBlinky() {
    this.blinky.speedUp();

    if (this.scaredGhosts.length === 0 && this.eyeGhosts === 0) {
      this.soundManager.setAmbience(this.determineSiren(this.remainingDots));
    }
  }

  /**
   * Determines the correct siren ambience
   * @param {Number} remainingDots
   * @returns {String}
   */
  determineSiren(remainingDots) {
    let sirenNum;

    if (remainingDots < 20) {
      sirenNum = 3;
    } else if (remainingDots < 40) {
      sirenNum = 2;
    } else if (remainingDots < 80) {
      sirenNum = 1;
    } else {
       return ''
    }

    return `siren_${sirenNum}`;
  }

  /**
   * Resets the gameboard and prepares the next level
   */
  advanceLevel() {
    this.allowPause = false;
    this.cutscene = true;
    this.soundManager.setCutscene(this.cutscene);
    this.allowKeyPresses = false;
    this.soundManager.stopAmbience();
    this.soundManager.play('level_end/level_end_'+ this.level);

    this.entityList.forEach((entity) => {
      const entityRef = entity;
      entityRef.moving = false;
    });

    this.removeTimer({ detail: { timer: this.fruitTimer } });
    this.removeTimer({ detail: { timer: this.ghostCycleTimer } });
    this.removeTimer({ detail: { timer: this.endIdleTimer } });
    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });

    const imgBase = 'app/style//graphics/spriteSheets/maze/';

    new Timer(() => {
      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.display = false;
      });

      this.mazeImg.src = `${imgBase}maze_white.svg`;
      new Timer(() => {
        this.mazeImg.src = `${imgBase}maze_blue.svg`;
        new Timer(() => {
          this.mazeImg.src = `${imgBase}maze_white.svg`;
          new Timer(() => {
            this.mazeImg.src = `${imgBase}maze_blue.svg`;
            new Timer(() => {
              this.mazeImg.src = `${imgBase}maze_white.svg`;
              new Timer(() => {
                this.mazeImg.src = `${imgBase}maze_blue.svg`;
                new Timer(() => {
                  this.mazeCover.style.visibility = 'visible';
                  new Timer(() => {
                    this.mazeCover.style.visibility = 'hidden';
                    this.level += 1;

                    if(this.level > 11) {
                      this.videoContainer.style.visibility = 'visible';
                      new Timer(() => {
                        this.pacmanVideo.play();
                        let firstvideo = true;
                        let stopTime = 435; 
                        this.pacmanVideo.addEventListener('timeupdate', () => {
                          if(firstvideo && this.pacmanVideo.currentTime >= stopTime)
                          {
                            firstvideo = false;
                            this.pacmanVideo.src = 'app/style/videos/rick.mp4';
                            this.pacmanVideo.load();
                            this.pacmanVideo.play();
                            stopTime = 435;
                          }
                          // else if(!firstvideo && this.pacmanVideo.currentTime >= stopTime) {
                          //   this.pacmanVideo.pause(); // Stop the video
                          //   this.pacmanVideo.currentTime = stopTime; // Ensure it doesn't progress further
                          // }
                          //   stopTime = 435; 
                          // if (this.pacmanVideo.currentTime >= stopTime) {
                          //   this.pacmanVideo.pause(); // Stop the video
                          //   video.currentTime = stopTime; // Ensure it doesn't progress further
                          //   videoPlayer.src = videos[currentVideoIndex];
                          //   videoPlayer.load();
                          //   videoPlayer.play();
                          // }
                        });
                        // this.pacmanVideo.addEventListener('ended', () => {
                        //   currentVideoIndex++;
                        //   if (!played) {
                        //       played = true;
                        //       //videoPlayer.src = videos[currentVideoIndex];
                        //       videoPlayer.load();
                        //       videoPlayer.play();
                        //   }
                        // });
                      }, 5000);
                    } else {
                      this.setupForLevel();

                      this.allowKeyPresses = true;
                      this.entityList.forEach((entity) => {
                        const entityRef = entity;
                        if (
                          entityRef instanceof Pickup
                          && entityRef.type !== 'fruit'
                        ) {
                          this.remainingDots += 1;
                        }
                      });
                      this.startGameplay();
                    }
                  }, 500);
                }, 250);
              }, 250);
            }, 250);
          }, 250);
        }, 250);
      }, 250);
    }, 2000);
  }

  setupForLevel() {
    this.pacmenOnLevel = 4
    this.speedLevel = 1;
    this.horizontalControlsReversed = false;
    this.verticalControlsReversed = false;
    switch(this.level) {
      // 4 pacmen
      case 1:
        this.speedLevel = 2;
        break;
      case 2:
        this.speedLevel = 5;
        break;
      case 3:
        this.speedLevel = 5;
        this.horizontalControlsReversed = true;
        break;
      case 4:
        this.speedLevel = 5;
        this.horizontalControlsReversed = true;
        this.verticalControlsReversed = true;
        break;
      // 2 pacmen
      case 5:
        this.pacmenOnLevel = 2
        this.speedLevel = 2;
        break;
      case 6:
        this.pacmenOnLevel = 2
        this.speedLevel = 5;
        break;
      case 7:
        this.pacmenOnLevel = 2
        this.speedLevel = 5;
        this.horizontalControlsReversed = true;
        break;
      case 8:
        this.pacmenOnLevel = 2
        this.speedLevel = 5;
        this.horizontalControlsReversed = true;
        this.verticalControlsReversed = true;
        break;
      // 1 pacman
      case 9:
        this.pacmenOnLevel = 1
        this.speedLevel = 2;
        break;
      case 10:
        this.pacmenOnLevel = 1
        this.speedLevel = 5;
        break;
      case 11:
        this.pacmenOnLevel = 1
        this.speedLevel = 5;
        this.horizontalControlsReversed = true;
        this.verticalControlsReversed = true;
        break;
    }

    this.entityList.forEach((entity) => {
      const entityRef = entity;
      if (entityRef.level) {
        entityRef.level = this.speedLevel;
      }
      if (entityRef instanceof Pacman) {
        entityRef.enabled = (entityRef.pacmanIndex < this.pacmenOnLevel);
      }
      entityRef.reset();
      if (entityRef instanceof Ghost) {
        entityRef.resetDefaultSpeed();
      }
    });
  }

  /**
   * Flashes ghosts blue and white to indicate the end of the powerup
   * @param {Number} flashes - Total number of elapsed flashes
   * @param {Number} maxFlashes - Total flashes to show
   */
  flashGhosts(flashes, maxFlashes) {
    if (flashes === maxFlashes) {
      this.scaredGhosts.forEach((ghost) => {
        ghost.endScared();
      });
      this.scaredGhosts = [];
      if (this.eyeGhosts === 0) {
        this.soundManager.setAmbience(this.determineSiren(this.remainingDots));
      }
    } else if (this.scaredGhosts.length > 0) {
      this.scaredGhosts.forEach((ghost) => {
        ghost.toggleScaredColor();
      });

      this.ghostFlashTimer = new Timer(() => {
        this.flashGhosts(flashes + 1, maxFlashes);
      }, 250);
    }
  }

  /**
   * Upon eating a power pellet, sets the ghosts to 'scared' mode
   */
  powerUp() {
    if (this.remainingDots !== 0) {
      this.rumbleAllControllers();
      this.soundManager.play('powerup/powerup ('+ this.level + ')');
      this.soundManager.setAmbience('power_up');
    }

    this.removeTimer({ detail: { timer: this.ghostFlashTimer } });

    this.ghostCombo = 0;
    this.scaredGhosts = [];

    this.ghosts.forEach((ghost) => {
      if (ghost.mode !== 'eyes') {
        this.scaredGhosts.push(ghost);
      }
    });

    this.scaredGhosts.forEach((ghost) => {
      ghost.becomeScared();
    });

    const powerDuration = Math.max((7 - this.speedLevel) * 1000, 0);
    this.ghostFlashTimer = new Timer(() => {
      this.flashGhosts(0, 9);
    }, powerDuration);
  }

  /**
   * Determines the quantity of points to give based on the current combo
   */
  determineComboPoints() {
    return 100 * (2 ** this.ghostCombo);
  }

  /**
   * Upon eating a ghost, award points and temporarily pause movement
   * @param {CustomEvent} e - Contains a target ghost object
   */
  eatGhost(e) {
    const pauseDuration = 1000;
    const { position, measurement } = e.detail.ghost;
    const pacman = e.detail.pacman;

    this.pauseTimer({ detail: { timer: this.ghostFlashTimer } });
    this.pauseTimer({ detail: { timer: this.ghostCycleTimer } });
    this.pauseTimer({ detail: { timer: this.fruitTimer } });
    this.soundManager.play('eat_ghost');

    this.scaredGhosts = this.scaredGhosts.filter(
      ghost => ghost.name !== e.detail.ghost.name,
    );
    this.eyeGhosts += 1;

    this.ghostCombo += 1;
    const comboPoints = this.determineComboPoints();
    window.dispatchEvent(
      new CustomEvent('awardPoints', {
        detail: {
          points: comboPoints,
        },
      }),
    );
    this.displayText(position, comboPoints, pauseDuration, measurement);

    this.allowPacmanMovement = false;
    pacman.display = false;
    this.pacmans.forEach((pac) => {
      pac.moving = false;
    });
    
    e.detail.ghost.display = false;
    e.detail.ghost.moving = false;

    this.ghosts.forEach((ghost) => {
      const ghostRef = ghost;
      ghostRef.animate = false;
      ghostRef.pause(true);
      ghostRef.allowCollision = false;
    });

    new Timer(() => {
      this.soundManager.setAmbience('eyes');

      this.resumeTimer({ detail: { timer: this.ghostFlashTimer } });
      this.resumeTimer({ detail: { timer: this.ghostCycleTimer } });
      this.resumeTimer({ detail: { timer: this.fruitTimer } });
      this.allowPacmanMovement = true;
      pacman.display = true;
      this.pacmans.forEach((pac) => {
        pac.moving = true;
      });
      e.detail.ghost.display = true;
      e.detail.ghost.moving = true;
      this.ghosts.forEach((ghost) => {
        const ghostRef = ghost;
        ghostRef.animate = true;
        ghostRef.pause(false);
        ghostRef.allowCollision = true;
      });
    }, pauseDuration);
  }

  /**
   * Decrements the count of "eye" ghosts and updates the ambience
   */
  restoreGhost() {
    this.eyeGhosts -= 1;

    if (this.eyeGhosts === 0) {
      const sound = this.scaredGhosts.length > 0
        ? 'power_up'
        : this.determineSiren(this.remainingDots);
      this.soundManager.setAmbience(sound);
    }
  }

  /**
   * Creates a temporary div to display points on screen
   * @param {({ left: number, top: number })} position - CSS coordinates to display the points at
   * @param {Number} amount - Amount of points to display
   * @param {Number} duration - Milliseconds to display the points before disappearing
   * @param {Number} width - Image width in pixels
   * @param {Number} height - Image height in pixels
   */
  displayText(position, amount, duration, width, height) {
    const pointsDiv = document.createElement('div');

    pointsDiv.style.position = 'absolute';
    pointsDiv.style.backgroundSize = `${width}px`;
    pointsDiv.style.backgroundImage = 'url(app/style/graphics/'
        + `spriteSheets/text/${amount}.svg`;
    pointsDiv.style.width = `${width}px`;
    pointsDiv.style.height = `${height || width}px`;
    pointsDiv.style.top = `${position.top}px`;
    pointsDiv.style.left = `${position.left}px`;
    pointsDiv.style.zIndex = 2;

    this.mazeDiv.appendChild(pointsDiv);

    new Timer(() => {
      this.mazeDiv.removeChild(pointsDiv);
    }, duration);
  }

  /**
   * Pushes a Timer to the activeTimers array
   * @param {({ detail: { timer: Object }})} e
   */
  addTimer(e) {
    this.activeTimers.push(e.detail.timer);
  }

  /**
   * Checks if a Timer with a matching ID exists
   * @param {({ detail: { timer: Object }})} e
   * @returns {Boolean}
   */
  timerExists(e) {
    return !!(e.detail.timer || {}).timerId;
  }

  /**
   * Pauses a timer
   * @param {({ detail: { timer: Object }})} e
   */
  pauseTimer(e) {
    if (this.timerExists(e)) {
      e.detail.timer.pause(true);
    }
  }

  /**
   * Resumes a timer
   * @param {({ detail: { timer: Object }})} e
   */
  resumeTimer(e) {
    if (this.timerExists(e)) {
      e.detail.timer.resume(true);
    }
  }

  /**
   * Removes a Timer from activeTimers
   * @param {({ detail: { timer: Object }})} e
   */
  removeTimer(e) {
    if (this.timerExists(e)) {
      window.clearTimeout(e.detail.timer.timerId);
      this.activeTimers = this.activeTimers.filter(
        timer => timer.timerId !== e.detail.timer.timerId,
      );
    }
  }
}