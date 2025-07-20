// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import Denque from 'denque';
import * as vscode from 'vscode';

interface FunctionInfo {
    name: string;
    uri: vscode.Uri;
    range: vscode.Range;
    selectionRange: vscode.Range;
}

class PathTracer {
    private sourceFunction: FunctionInfo | undefined;
    private destinationFunction: FunctionInfo | undefined;

    public setSource(functionInfo: FunctionInfo) {
        this.sourceFunction = functionInfo;
        vscode.window.showInformationMessage(`Source function set: ${functionInfo.name}`);
    }

    public setDestination(functionInfo: FunctionInfo) {
        this.destinationFunction = functionInfo;
        vscode.window.showInformationMessage(`Destination function set: ${functionInfo.name}`);
    }

    public async findPath(): Promise<void> {
        if (!this.sourceFunction) {
            vscode.window.showErrorMessage('Source function not set. Please set a source function first.');
            return;
        }

        if (!this.destinationFunction) {
            vscode.window.showErrorMessage('Destination function not set. Please set a destination function first.');
            return;
        }

        const config = vscode.workspace.getConfiguration('pathTrace');
        const showProgress = config.get<boolean>('showProgressNotifications', true);

        if (showProgress) {
            vscode.window.showInformationMessage(`Searching for path from ${this.sourceFunction.name} to ${this.destinationFunction.name}...`);
        }

        try {
            const path = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Path Trace",
                cancellable: true
            }, async (progress, token) => {
                progress.report({ message: "Searching for function path..." });
                return await this.searchPath(this.sourceFunction!, this.destinationFunction!, progress, token);
            });

            if (path && path.length > 0) {
                await this.displayPath(path);
            } else {
                vscode.window.showInformationMessage(`No path found from ${this.sourceFunction.name} to ${this.destinationFunction.name}`);
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Cancelled') {
                vscode.window.showInformationMessage('Path search was cancelled');
            } else {
                vscode.window.showErrorMessage(`Error finding path: ${error}`);
            }
        }
    }

    private async searchPath(
        source: FunctionInfo, 
        destination: FunctionInfo, 
        progress?: vscode.Progress<{ message?: string; increment?: number }>,
        token?: vscode.CancellationToken
    ): Promise<FunctionInfo[] | null> {
        const config = vscode.workspace.getConfiguration('pathTrace');
        const maxDepth = config.get<number>('maxSearchDepth', 50);
        
        const visited = new Set<string>();
        const queue = new Denque<{ func: FunctionInfo; path: FunctionInfo[] }>();
        queue.push({ func: source, path: [source] });
        let searchCount = 0;

        while (queue.length > 0) {
            // Check for cancellation
            if (token?.isCancellationRequested) {
                throw new Error('Cancelled');
            }

            const { func, path } = queue.shift()!;  // O(1) operation now!
            const funcKey = `${func.uri.toString()}:${func.range.start.line}:${func.range.start.character}`;

            if (visited.has(funcKey)) {
                continue;
            }
            visited.add(funcKey);
            searchCount++;

            // Update progress every 10 searches
            if (progress && searchCount % 10 === 0) {
                progress.report({ 
                    message: `Searched ${searchCount} functions, current: ${func.name}` 
                });
            }

            // Check if we've reached the destination
            if (this.functionsMatch(func, destination)) {
                return path;
            }

            // Prevent infinite loops by limiting search depth
            if (path.length > maxDepth) {
                continue;
            }

            try {
                // Get outgoing calls from current function
                const outgoingCalls = await this.getOutgoingCalls(func);
                
                for (const call of outgoingCalls) {
                    const callKey = `${call.uri.toString()}:${call.range.start.line}:${call.range.start.character}`;
                    if (!visited.has(callKey)) {
                        queue.push({            
                            func: call,
                            path: [...path, call]
                        });
                    }
                }
            } catch (error) {
                console.error(`Error getting outgoing calls for ${func.name}:`, error);
            }
        }

        return null;
    }

    private functionsMatch(func1: FunctionInfo, func2: FunctionInfo): boolean {
        return func1.uri.toString() === func2.uri.toString() &&
               func1.range.start.line === func2.range.start.line &&
               func1.range.start.character === func2.range.start.character;
    }

    private async getOutgoingCalls(func: FunctionInfo): Promise<FunctionInfo[]> {
        try {
            // Get call hierarchy item for the function
            const callHierarchyItems = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
                'vscode.prepareCallHierarchy',
                func.uri,
                func.selectionRange.start
            );

            if (!callHierarchyItems || callHierarchyItems.length === 0) {
                return [];
            }

            const item = callHierarchyItems[0];
            
            // Get outgoing calls
            const outgoingCalls = await vscode.commands.executeCommand<vscode.CallHierarchyOutgoingCall[]>(
                'vscode.provideOutgoingCalls',
                item
            );

            if (!outgoingCalls) {
                return [];
            }

            return outgoingCalls.map(call => ({
                name: call.to.name,
                uri: call.to.uri,
                range: call.to.range,
                selectionRange: call.to.selectionRange
            }));
        } catch (error) {
            console.error('Error getting outgoing calls:', error);
            return [];
        }
    }

    private async displayPath(path: FunctionInfo[]): Promise<void> {
        const pathString = path.map((func, index) => {
            return `${index + 1}. ${func.name} (${vscode.workspace.asRelativePath(func.uri)}:${func.range.start.line + 1})`;
        }).join('\n');

        const message = `Path found (${path.length} steps):\n${pathString}`;
        
        // Show the path in an information message
        const action = await vscode.window.showInformationMessage(
            `Path found with ${path.length} steps. Would you like to see the details?`,
            'Show Path Details',
            'Navigate to Steps'
        );

        if (action === 'Show Path Details') {
            // Create and show a new document with the path details
            const doc = await vscode.workspace.openTextDocument({
                content: message,
                language: 'plaintext'
            });
            await vscode.window.showTextDocument(doc);
        } else if (action === 'Navigate to Steps') {
            // Navigate through each step of the path
            for (let i = 0; i < path.length; i++) {
                const func = path[i];
                const doc = await vscode.workspace.openTextDocument(func.uri);
                const editor = await vscode.window.showTextDocument(doc);
                editor.selection = new vscode.Selection(func.selectionRange.start, func.selectionRange.end);
                editor.revealRange(func.range, vscode.TextEditorRevealType.InCenter);
                
                if (i < path.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Pause for 2 seconds
                }
            }
        }
    }
}

const pathTracer = new PathTracer();

async function getFunctionAtPosition(editor: vscode.TextEditor, position: vscode.Position): Promise<FunctionInfo | null> {
    try {
        const callHierarchyItems = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
            'vscode.prepareCallHierarchy',
            editor.document.uri,
            position
        );

        if (!callHierarchyItems || callHierarchyItems.length === 0) {
            return null;
        }

        const item = callHierarchyItems[0];
        return {
            name: item.name,
            uri: item.uri,
            range: item.range,
            selectionRange: item.selectionRange
        };
    } catch (error) {
        console.error('Error getting function at position:', error);
        return null;
    }
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Path Trace extension is now active!');

    // Register command to set source function
    const setSourceCommand = vscode.commands.registerCommand('path-trace.setSource', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const position = editor.selection.active;
        const functionInfo = await getFunctionAtPosition(editor, position);
        
        if (functionInfo) {
            pathTracer.setSource(functionInfo);
        } else {
            vscode.window.showErrorMessage('No function found at current position');
        }
    });

    // Register command to set destination function
    const setDestinationCommand = vscode.commands.registerCommand('path-trace.setDestination', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const position = editor.selection.active;
        const functionInfo = await getFunctionAtPosition(editor, position);
        
        if (functionInfo) {
            pathTracer.setDestination(functionInfo);
        } else {
            vscode.window.showErrorMessage('No function found at current position');
        }
    });

    // Register command to find path
    const findPathCommand = vscode.commands.registerCommand('path-trace.findPath', async () => {
        await pathTracer.findPath();
    });

    context.subscriptions.push(setSourceCommand, setDestinationCommand, findPathCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
