# Fartlek Trainer Development Guide

## Development Commands
- **Run locally**: Open index.html in a browser
- **Deploy**: Upload all files to web server
- **Test PWA**: Use Chrome DevTools > Application > Service Worker

## Code Style Guidelines

### JavaScript
- Use camelCase for variables and functions
- Use PascalCase for module objects (WORKOUT, SPEECH, etc.)
- JSDoc comments for functions and modules
- Group related functionality in separate modules (workout.js, speech.js, etc.)
- Use const for objects that won't be reassigned
- Prefer function declarations over expressions
- Add event listeners in app.js initialization

### HTML/CSS
- Use semantic HTML5 elements (header, section, etc.)
- Mobile-first responsive design
- CSS classes should be kebab-case

### Error Handling
- Use try/catch for error-prone operations (speech synthesis, storage)
- Log errors to console with descriptive messages
- Gracefully degrade functionality when features aren't supported

### Data Flow
- State lives in APP object in config.js
- Modules communicate through direct function calls
- DOM updates happen in APP utility functions