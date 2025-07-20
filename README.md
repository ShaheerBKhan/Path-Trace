# path-t# Path Trace

Path Trace is a VS Code extension that helps you trace execution paths between functions by leveraging VS Code's call hierarchy feature. It allows you to set a source function and a destination function, then searches through the call hierarchy to find a path from the source to the destination.

## Features

- **Set Source Function**: Mark any function as the starting point for path tracing
- **Set Destination Function**: Mark any function as the target for path tracing  
- **Find Path**: Search for a call path between the source and destination functions
- **Interactive Path Display**: View the complete path with file locations and line numbers
- **Navigation Support**: Step through each function in the discovered path

## How to Use

### Setting Source and Destination Functions

1. **Set Source Function**:
   - Place your cursor on any function name, declaration, or call
   - Right-click and select "Path Trace: Set Source Function" from the context menu
   - Or use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and search for "Path Trace: Set Source Function"

2. **Set Destination Function**:
   - Place your cursor on your target function
   - Right-click and select "Path Trace: Set Destination Function" from the context menu
   - Or use the Command Palette and search for "Path Trace: Set Destination Function"

### Finding the Path

3. **Find Path**:
   - Use the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Search for "Path Trace: Find Path Between Functions"
   - The extension will search for a call path from source to destination

### Viewing Results

When a path is found, you'll see a notification with options to:
- **Show Path Details**: Opens a new document with the complete path listing
- **Navigate to Steps**: Automatically navigates through each step in the path with 2-second pauses

## Example

```typescript
// Example code structure
function main() {
    processData();
}

function processData() {
    validateInput();
    transformData();
}

function transformData() {
    helperFunction();
}

function helperFunction() {
    // target function
}
```

If you set `main` as source and `helperFunction` as destination, the extension will find:
```
Path found (4 steps):
1. main (src/example.ts:2)
2. processData (src/example.ts:6)
3. transformData (src/example.ts:11)
4. helperFunction (src/example.ts:15)
```

## Requirements

- VS Code version 1.102.0 or higher
- Language support with call hierarchy (TypeScript, JavaScript, Python, C#, Java, etc.)
- The language server must support the Call Hierarchy feature

## Supported Languages

This extension works with any language that supports VS Code's Call Hierarchy feature:
- TypeScript/JavaScript
- Python
- C/C++
- C#
- Java
- Go
- Rust
- And many others with appropriate language extensions

## Limitations

- Search depth is limited to 50 steps to prevent infinite loops
- Performance depends on the size of your codebase and the complexity of call relationships
- Requires the language server to provide accurate call hierarchy information

## Development

To run the extension in development mode:

1. Clone this repository
2. Open in VS Code
3. Run `npm install` to install dependencies
4. Press `F5` to launch a new Extension Development Host window
5. Test the extension in the new window

## Building

```bash
npm run compile    # Compile TypeScript and bundle with esbuild
npm run watch      # Watch mode for development
npm run package    # Create production build
```

## Contributing

Feel free to open issues and pull requests on the GitHub repository.

## License

This project is licensed under the MIT License.README

This is the README for your extension "path-trace". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
