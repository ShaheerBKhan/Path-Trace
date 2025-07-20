# Change Log

All notable changes to the "Path Trace" extension will be documented in this file.

## [0.0.1] - 2025-01-20

### Added
- Initial release of Path Trace extension
- Set source function command - mark any function as the starting point for tracing
- Set destination function command - mark any function as the target for tracing
- Find path command - search for execution paths between source and destination functions
- Interactive path display with file locations and line numbers
- Navigation support to step through each function in the discovered path
- Context menu integration for easy access to source/destination setting
- Support for all languages that provide call hierarchy information
- Breadth-first search algorithm with cycle detection
- Configurable search depth limit (50 steps) to prevent infinite loops

### Features
- **Multi-language support**: Works with TypeScript, JavaScript, Python, C#, Java, Go, Rust, and any language with call hierarchy support
- **Smart path finding**: Uses VS Code's built-in call hierarchy to discover function call relationships
- **Interactive results**: Choose between viewing path details or navigating through each step
- **Context integration**: Right-click context menu for easy source/destination function setting
- **Performance optimized**: Limits search depth and uses visited tracking to prevent infinite loops

### Technical Details
- Built with TypeScript and esbuild for optimal performance
- Leverages VS Code's `vscode.prepareCallHierarchy` and `vscode.provideOutgoingCalls` commands
- Implements breadth-first search for finding shortest call paths
- Uses proper error handling and user feedback throughout the workflow