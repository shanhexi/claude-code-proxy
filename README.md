# Claude Code Proxy

A development tool for intercepting and visualizing Claude Code API requests. By hijacking Claude Code's network requests, it captures and displays all prompts and tool calls in real-time, helping developers understand and debug Claude Code's working mechanism.

## Features

- 🔍 **API Request Interception**: Automatically hijack Claude Code API calls
- 📊 **Visual Interface**: Intuitive web interface displaying all requests and responses
- 🛠️ **Tool Call Analysis**: Detailed recording and visualization of tool invocations
- 💬 **Prompt Visualization**: Clear display of system prompts and user messages
- 📝 **Session Management**: Support for recording and switching between multiple sessions
- 🎨 **Beautiful UI**: Modern dark theme interface

## Installation

```bash
npm install -g claude-code-proxy
```

## Usage

### Starting the Proxy

```bash
claude-code-proxy
```

After running, it will automatically:
1. Modify the globally installed Claude Code CLI file
2. Start a local server (http://localhost:3000)
3. Automatically open the browser to view the interface

### How It Works

The tool works through the following steps:

1. **CLI Hijacking**: Modify Claude Code's `cli.js` file, injecting interception code
2. **Request Interception**: Intercept `beta.messages.create` API calls
3. **Data Recording**: Record all requests and responses to log files
4. **Visual Display**: Parse and display data through a web interface

## Interface Features

### Main Interface

- **Conversation**: Display current session's input and output
- **Global Tool Set**: Show all available tool definitions
- **Guessed System Prompts**: Intelligently identified system prompts

### Function Buttons

- **Create New Log**: Create a new log session
- **Choose Example**: Select historical session records
- **Navigation Buttons**: Switch between multiple sessions

### Data Display

- **Input Panel**:
  - Model parameters (model, max_tokens, temperature)
  - System messages
  - Available tool list
  - User messages

- **Output Panel**:
  - Response type and token usage
  - AI response content (supports Markdown rendering)
  - Tool call activity
  - Other response fields

## Project Structure

```
claude-code-proxy/
├── bin/
│   └── main.js
├── script/
│   ├── main.js
│   └── alternateFile.js
├── public/
│   ├── index.html
│   └── parser.js
├── messages/
│   └── messages.log
└── package.json
```

## Technical Implementation

### CLI Modification

The tool automatically finds the globally installed `@anthropic-ai/claude-code` package and modifies its `cli.js` file:

1. Backup the original file as `cli.bak`
2. Format code using `js-beautify`
3. Inject interception code into the constructor
4. Reset executable permissions

### Data Interception

The injected code will:
- Intercept `this.beta.messages.create()` calls
- Record input parameters to log files
- Intercept streaming and non-streaming responses
- Record tool call details

### Log Format

Log files use the following format:
```
---Session 2024-01-01T00:00:00.000Z---
2024-01-01T00:00:00.000Z uid=abc123 input: {"messages":[...],"tools":[...]}
2024-01-01T00:00:01.000Z uid=abc123 stream.final: {"text":"...","tools":[...]}
```

## Security Notice

This tool is for development and debugging purposes only and modifies Claude Code installation files. Before using, please ensure:
- Understanding of how the tool works
- Use in development environments
- Regular backup of important data

## System Requirements

- Node.js >= 18
- Claude Code CLI installed (`@anthropic-ai/claude-code`)
- Supported OS: macOS, Linux, Windows

## Troubleshooting

### Claude Code Not Found
Make sure Claude Code CLI is properly installed:
```bash
npm install -g @anthropic-ai/claude-code
```

### Permission Issues
On macOS/Linux, you may need administrator privileges:
```bash
sudo claude-code-proxy
```

### Reset Claude Code
To restore original Claude Code:
1. Find the `cli.bak` file in the installation directory
2. Rename it to `cli.js`

## Development

### Local Development

```bash
git clone https://github.com/your-username/claude-code-proxy.git
cd claude-code-proxy
npm install
npm link
```

### Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Venus Shan**

## Important Notes

⚠️ **Important Reminder**:
- This tool modifies Claude Code installation files
- Only recommended for use in development environments
- Please backup important data before use
- Data recorded by the tool may contain sensitive information, please handle with care

---