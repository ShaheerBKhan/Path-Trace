# Path Trace

Path Trace is a VS Code extension that helps you trace execution paths between functions by leveraging VS Code's call hierarchy feature. It allows you to set a source function and a destination function, then searches through the call hierarchy to find a path from the source to the destination.

## Features

- **Set Source Function**: Mark any function as the starting point for path tracing
- **Set Destination Function**: Mark any function as the target for path tracing  
- **Find Path**: Search for a call path between the source and destination functions
- **Interactive Path Display**: View the complete path with file locations and line numbers
- **Performance Optimized**: Uses efficient BFS algorithm with optimized queue operations
- **Configurable**: Customizable search depth and progress notifications

## How to Use

### Quick Start

1. **Set Source Function**:
   - Place your cursor on any function name or inside a function body
   - Use Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) → "Path Trace: Set Source"
   - Or right-click → "Path Trace" → "Set Source"

2. **Set Destination Function**:
   - Place your cursor on the target function
   - Use Command Palette → "Path Trace: Set Destination"
   - Or right-click → "Path Trace" → "Set Destination"

3. **Find Path**:
   - Use Command Palette → "Path Trace: Find Path"
   - Or right-click → "Path Trace" → "Find Path"
   - The extension will search for the shortest path and display results

### Example

```typescript
function main() {
    processUserData();
}

function processUserData() {
    validateInput();
}

function validateInput() {
    authenticateUser();
}

function authenticateUser() {
    // Target function
}
```

Set `main` as source and `authenticateUser` as destination to see the path: `main → processUserData → validateInput → authenticateUser`

## Configuration

Access settings via VS Code preferences:

- **Path Trace: Max Search Depth** (default: 50): Maximum depth to search to prevent infinite loops
- **Path Trace: Show Progress Notifications** (default: true): Display progress during path search

## Requirements

- VS Code 1.102.0 or higher
- TypeScript/JavaScript language support for optimal results
- Works with any language that supports VS Code's call hierarchy

## Known Issues

- Call hierarchy availability depends on the language server
- Some dynamic function calls may not be detected
- Performance may vary with very large codebases

## Release Notes

### 0.0.1

- Initial release
- Basic path tracing functionality
- BFS algorithm implementation
- Configurable search depth
- Progress notifications

## Contributing

Found a bug or have a feature request? Please create an issue on [GitHub](https://github.com/ShaheerBKhan/Path-Trace/issues).

## License

MIT License - see [LICENSE](LICENSE) file for details.
