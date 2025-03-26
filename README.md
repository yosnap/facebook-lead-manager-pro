# Facebook Lead Manager Pro

A powerful Chrome extension for automated Facebook lead generation. This tool helps you efficiently search and collect profiles, pages, and groups from Facebook.

## Features

- 🔍 Advanced search capabilities for:
  - People profiles
  - Business pages
  - Groups
- 📍 Location-based filtering
- ⚡ Automatic scrolling and data collection
- ⏸️ Pause/Resume functionality
- 📊 Real-time results display
- 🔄 Automatic profile processing
- 🎯 Customizable search parameters

## Installation

### For Development

1. Clone this repository:
```bash
git clone https://github.com/yosnap/facebook-lead-manager-pro.git
cd facebook-lead-manager-pro
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode" in the top right
- Click "Load unpacked"
- Select the `dist` folder from the project

### For Users

1. Download the latest release from the [Releases page](https://github.com/yosnap/facebook-lead-manager-pro/releases)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Drag and drop the downloaded `.zip` file onto the extensions page

## Usage

1. Click the extension icon in your Chrome toolbar
2. Select the type of search (People, Pages, or Groups)
3. Enter your search term
4. (Optional) Enter a city for location-based filtering
5. Click "Start Search"
6. View results in real-time as they are collected
7. Use the pause/stop buttons to control the search process

## Development

### Project Structure

```
facebook-lead-manager-pro/
├── src/
│   ├── popup.tsx       # Extension popup interface
│   ├── content.ts      # Content script for Facebook interaction
│   ├── background.ts   # Background script
│   └── popup.html      # Popup HTML template
├── dist/              # Compiled extension files
├── webpack.dev.js     # Development webpack configuration
└── webpack.prod.js    # Production webpack configuration
```

### Build Commands

- Development build: `npm run dev`
- Production build: `npm run build`
- Watch mode: `npm run watch`

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Security

This extension requires permissions to:
- Access Facebook.com
- Read and modify web content on Facebook.com
- Store data locally

No data is sent to external servers. All processing is done locally in your browser.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/yosnap/facebook-lead-manager-pro/issues) page
2. Create a new issue if your problem isn't already listed

## Disclaimer

This tool is for educational purposes only. Users are responsible for complying with Facebook's terms of service and applicable laws regarding data collection and usage.