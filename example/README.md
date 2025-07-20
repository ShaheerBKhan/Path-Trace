# Path Trace Extension - Usage Guide

This guide demonstrates how to use the Path Trace extension with the included demo file.

## Setup

1. Open this workspace in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new window, open the `example/demo.ts` file

## Testing the Extension

### Step 1: Set Source Function

1. Place your cursor on the `main` function (line 3)
2. Right-click and select "Path Trace: Set Source Function"
3. You should see a notification: "Source function set: main"

### Step 2: Set Destination Function

Choose one of these destination functions to test different paths:

**Option A: Test Path to `logAccess`**
1. Place your cursor on the `logAccess` function (line 26)
2. Right-click and select "Path Trace: Set Destination Function"
3. You should see: "Destination function set: logAccess"

**Option B: Test Path to `auditLog`**
1. Place your cursor on the `auditLog` function (line 47)
2. Right-click and select "Path Trace: Set Destination Function"
3. You should see: "Destination function set: auditLog"

### Step 3: Find the Path

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "Path Trace: Find Path Between Functions"
3. Press Enter

### Expected Results

**For `main` → `logAccess` path:**
```
Path found (6 steps):
1. main (example/demo.ts:3)
2. processUserData (example/demo.ts:7)
3. validateInput (example/demo.ts:14)
4. checkPermissions (example/demo.ts:20)
5. authenticateUser (example/demo.ts:24)
6. logAccess (example/demo.ts:28)
```

**For `main` → `auditLog` path:**
```
Path found (7 steps):
1. main (example/demo.ts:3)
2. processUserData (example/demo.ts:7)
3. transformData (example/demo.ts:32)
4. formatOutput (example/demo.ts:41)
5. saveToDatabase (example/demo.ts:45)
6. auditLog (example/demo.ts:49)
```

## Interactive Features

When a path is found, you'll see options to:

1. **Show Path Details**: Opens a new document with the complete path
2. **Navigate to Steps**: Automatically jumps to each function with 2-second delays

## Testing Alternative Paths

Try setting `alternativeProcessing` (line 53) as source and `logAccess` as destination to see a shorter path:

```
Path found (2 steps):
1. alternativeProcessing (example/demo.ts:53)
2. logAccess (example/demo.ts:28)
```

## Troubleshooting

- **"No function found at current position"**: Make sure your cursor is on a function name or declaration
- **"No path found"**: The functions might not be connected through calls, or the path exceeds the maximum search depth
- **Language server issues**: Ensure the TypeScript language server is running and the file has no syntax errors

## Configuration

You can adjust these settings in VS Code:

- `pathTrace.maxSearchDepth`: Maximum search depth (default: 50)
- `pathTrace.showProgressNotifications`: Show progress during search (default: true)

## Tips

1. The extension works with any language that supports call hierarchy (TypeScript, JavaScript, Python, C#, Java, etc.)
2. Place your cursor directly on function names for best results
3. The search uses breadth-first traversal to find the shortest path
4. Large codebases may take longer to search - use the progress notifications to monitor
