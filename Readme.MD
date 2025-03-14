# Fartlek Trainer

Fartlek Trainer is a custom interval training app for runners. It allows users to create personalized fartlek workouts with customizable intervals, speeds, and voice announcements.

## Features

- Create custom interval workouts with warm-up, fast run, slow run, repeats, and cool-down phases.
- Set target speeds for fast and slow runs in either miles per hour (mph) or kilometers per hour (kph).
- Voice announcements for workout phases and countdowns.
- Save and load custom workouts.
- Keep the screen on during workouts to prevent interruptions.
- Progressive Web App (PWA) support for offline usage and home screen installation.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/fartlek-trainer.git
   cd fartlek-trainer
   ```

2. Open `index.html` in your preferred web browser.

## Usage

1. Open the app in your web browser.
2. Create your workout by setting the warm-up time, fast run time, slow run time, number of repeats, and cool-down time.
3. Set target speeds for fast and slow runs.
4. Click "Start Workout" to begin your workout.
5. Use the settings menu to enable/disable voice announcements, select a voice, adjust volume, and keep the screen on during workouts.
6. Save your workout for future use.

## Project Structure

```
index.html
manifest.json
service-worker.js
css/
  styles.css
icons/
  icon-192.png
  icon-512.png
js/
  app.js
  audio.js
  config.js
  menu.js
  speech.js
  speed.js
  storage.js
  timer.js
  wakelock.js
  workout.js
```

- `index.html`: Main HTML file for the app.
- `manifest.json`: PWA manifest file.
- `service-worker.js`: Service worker for caching assets and offline support.
- `css/styles.css`: Stylesheet for the app.
- `icons/`: Icons for the app.
- `js/`: JavaScript files for various functionalities.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.