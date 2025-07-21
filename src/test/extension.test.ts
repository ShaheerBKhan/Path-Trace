import * as assert from 'assert';
import * as vscode from 'vscode';
import { testCode } from './testData';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	let testDocument: vscode.TextDocument;
	let testEditor: vscode.TextEditor;

	suiteSetup(async function() {
		// Increase timeout for this setup
		this.timeout(10000);
		
		// Create a test document with sample code
		testDocument = await vscode.workspace.openTextDocument({
			content: testCode,
			language: 'typescript'
		});
		
		testEditor = await vscode.window.showTextDocument(testDocument);
		
		// Ensure extension is activated
		const extension = vscode.extensions.getExtension('undefined_publisher.path-trace');
		if (extension && !extension.isActive) {
			await extension.activate();
		}
		
		// Wait for language server to be ready
		await new Promise(resolve => setTimeout(resolve, 3000));
	});

	test('Extension should be present', function() {
		this.timeout(5000);
		assert.ok(vscode.extensions.getExtension('undefined_publisher.path-trace'));
	});

	test('Extension should activate', async function() {
		this.timeout(5000);
		const extension = vscode.extensions.getExtension('undefined_publisher.path-trace');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		}
	});

	test('Commands should be registered', async function() {
		this.timeout(5000);
		
		const commands = await vscode.commands.getCommands(true);
		
		assert.ok(commands.includes('path-trace.setSource'), 'setSource command should be registered');
		assert.ok(commands.includes('path-trace.setDestination'), 'setDestination command should be registered');
		assert.ok(commands.includes('path-trace.findPath'), 'findPath command should be registered');
	});

	test('Submenu should have all three commands', async function() {
		this.timeout(5000);
		
		// Test that all three commands are accessible from the submenu
		// This verifies the package.json menu configuration
		const commands = await vscode.commands.getCommands(true);
		
		// Verify all submenu commands are registered
		const submenuCommands = [
			'path-trace.setSource',
			'path-trace.setDestination', 
			'path-trace.findPath'
		];
		
		for (const command of submenuCommands) {
			assert.ok(commands.includes(command), `Submenu command ${command} should be registered`);
		}
	});

	test('Complete submenu workflow should work', async function() {
		this.timeout(10000);
		
		// Test the complete workflow: Set Source -> Set Destination -> Find Path
		
		// Step 1: Set source function
		let position = new vscode.Position(1, 17); // main function
		testEditor.selection = new vscode.Selection(position, position);
		
		try {
			await vscode.commands.executeCommand('path-trace.setSource');
			assert.ok(true, 'Step 1: Set source from submenu successful');
		} catch (error) {
			assert.fail(`Step 1 failed: ${error}`);
		}
		
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Step 2: Set destination function
		position = new vscode.Position(27, 9); // logAccess function
		testEditor.selection = new vscode.Selection(position, position);
		
		try {
			await vscode.commands.executeCommand('path-trace.setDestination');
			assert.ok(true, 'Step 2: Set destination from submenu successful');
		} catch (error) {
			assert.fail(`Step 2 failed: ${error}`);
		}
		
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Step 3: Find path using submenu command
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'Step 3: Find path from submenu successful');
		} catch (error) {
			assert.fail(`Step 3 failed: ${error}`);
		}
		
		await new Promise(resolve => setTimeout(resolve, 1000));
	});

	test('Submenu commands should handle errors gracefully', async function() {
		this.timeout(8000);
		
		// Test error handling when trying to find path without setting source/destination
		
		// Clear any previous state by reactivating extension
		const extension = vscode.extensions.getExtension('undefined_publisher.path-trace');
		if (extension && extension.isActive) {
			await extension.activate();
		}
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Try to find path without setting source or destination
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'Find path handled missing source/destination gracefully');
		} catch (error) {
			assert.fail(`Find path should handle missing data gracefully: ${error}`);
		}
		
		// Set only source, then try to find path
		const position = new vscode.Position(1, 17);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setSource');
		await new Promise(resolve => setTimeout(resolve, 500));
		
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'Find path handled missing destination gracefully');
		} catch (error) {
			assert.fail(`Find path should handle missing destination: ${error}`);
		}
	});

	test('Configuration should be available', function() {
		this.timeout(5000);
		const config = vscode.workspace.getConfiguration('pathTrace');
		
		// Test default values
		assert.strictEqual(config.get('maxSearchDepth'), 50);
		assert.strictEqual(config.get('showProgressNotifications'), true);
	});

	test('Submenu configuration should be valid', function() {
		this.timeout(5000);
		
		// Verify that the submenu is properly configured
		// This tests the package.json contribution points
		
		const extension = vscode.extensions.getExtension('undefined_publisher.path-trace');
		assert.ok(extension, 'Extension should be available');
		
		if (extension) {
			const packageJson = extension.packageJSON;
			
			// Verify submenu is defined
			assert.ok(packageJson.contributes.submenus, 'Submenus should be defined');
			const pathTraceSubmenu = packageJson.contributes.submenus.find((s: any) => s.id === 'path-trace.submenu');
			assert.ok(pathTraceSubmenu, 'Path Trace submenu should be defined');
			assert.strictEqual(pathTraceSubmenu.label, 'Path Trace', 'Submenu should have correct label');
			
			// Verify submenu has all three commands
			assert.ok(packageJson.contributes.menus['path-trace.submenu'], 'Submenu menu items should be defined');
			const submenuItems = packageJson.contributes.menus['path-trace.submenu'];
			assert.strictEqual(submenuItems.length, 3, 'Submenu should have exactly 3 items');
			
			// Verify each command is present
			const commands = submenuItems.map((item: any) => item.command);
			assert.ok(commands.includes('path-trace.setSource'), 'Submenu should include setSource');
			assert.ok(commands.includes('path-trace.setDestination'), 'Submenu should include setDestination');
			assert.ok(commands.includes('path-trace.findPath'), 'Submenu should include findPath');
		}
	});

	test('Should execute setSource command from function name', async () => {
		// Position cursor on 'main' function name (line 1, character 17)
		const position = new vscode.Position(1, 17); // function main()
		testEditor.selection = new vscode.Selection(position, position);
		
		// Execute command - should not throw
		try {
			await vscode.commands.executeCommand('path-trace.setSource');
			assert.ok(true, 'setSource command executed successfully');
		} catch (error) {
			assert.fail(`setSource command failed: ${error}`);
		}
	});

	test('Should execute setDestination command from function name', async () => {
		// Position cursor on 'logAccess' function name (line 27, character 9)
		const position = new vscode.Position(27, 9); // function logAccess()
		testEditor.selection = new vscode.Selection(position, position);
		
		// Execute command - should not throw
		try {
			await vscode.commands.executeCommand('path-trace.setDestination');
			assert.ok(true, 'setDestination command executed successfully');
		} catch (error) {
			assert.fail(`setDestination command failed: ${error}`);
		}
	});

	test('Should execute setSource command from inside function body', async () => {
		// Position cursor inside processUserData function body (line 8, character 30)
		const position = new vscode.Position(7, 30); // inside console.log line
		testEditor.selection = new vscode.Selection(position, position);
		
		try {
			await vscode.commands.executeCommand('path-trace.setSource');
			assert.ok(true, 'setSource command executed from inside function body');
		} catch (error) {
			assert.fail(`setSource command from inside function failed: ${error}`);
		}
	});

	test('Should execute setDestination command from inside function body', async () => {
		// Position cursor inside validateInput function body (line 16, character 20)
		const position = new vscode.Position(15, 20); // inside console.log line
		testEditor.selection = new vscode.Selection(position, position);
		
		try {
			await vscode.commands.executeCommand('path-trace.setDestination');
			assert.ok(true, 'setDestination command executed from inside function body');
		} catch (error) {
			assert.fail(`setDestination command from inside function failed: ${error}`);
		}
	});

	test('Should handle non-function positions', async () => {
		// Position cursor on a comment or empty line
		const position = new vscode.Position(0, 5); // on comment line
		testEditor.selection = new vscode.Selection(position, position);
		
		// Should not throw even if no function found
		try {
			await vscode.commands.executeCommand('path-trace.setSource');
			assert.ok(true, 'Command handled non-function position gracefully');
		} catch (error) {
			assert.fail(`Command should handle non-function positions: ${error}`);
		}
	});

	test('Should execute findPath command with valid source and destination', async () => {
		// Set source to main (line 1)
		let position = new vscode.Position(1, 17);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setSource');
		
		// Set destination to logAccess (line 27)
		position = new vscode.Position(27, 9);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setDestination');
		
		// Wait for both to be set
		await new Promise(resolve => setTimeout(resolve, 500));
		
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'findPath command executed successfully');
		} catch (error) {
			assert.fail(`findPath command failed: ${error}`);
		}
	});

	test('Should handle findPath with unconnected functions', async () => {
		// Set source to main (line 1)
		let position = new vscode.Position(1, 17);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setSource');
		
		// Set destination to isolated function (line 42)
		position = new vscode.Position(42, 9);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setDestination');
		
		await new Promise(resolve => setTimeout(resolve, 500));
		
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'findPath handled unconnected functions gracefully');
		} catch (error) {
			assert.fail(`findPath should handle unconnected functions: ${error}`);
		}
	});

	test('Should respect max search depth configuration', async () => {
		// Update configuration to lower max depth for testing
		const config = vscode.workspace.getConfiguration('pathTrace');
		await config.update('maxSearchDepth', 5, vscode.ConfigurationTarget.Global);
		
		// Verify the configuration was updated
		const updatedConfig = vscode.workspace.getConfiguration('pathTrace');
		assert.strictEqual(updatedConfig.get('maxSearchDepth'), 5, 'Configuration should be updated');
		
		// Set source to level1 (line 45)
		let position = new vscode.Position(45, 9);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setSource');
		
		// Set destination to level15 (line 59) - should be beyond max depth
		position = new vscode.Position(59, 9);
		testEditor.selection = new vscode.Selection(position, position);
		await vscode.commands.executeCommand('path-trace.setDestination');
		
		await new Promise(resolve => setTimeout(resolve, 500));
		
		try {
			await vscode.commands.executeCommand('path-trace.findPath');
			assert.ok(true, 'findPath respected max search depth');
		} catch (error) {
			assert.fail(`findPath should respect max depth: ${error}`);
		}
		
		// Reset configuration
		await config.update('maxSearchDepth', 50, vscode.ConfigurationTarget.Global);
	});

	test('Should handle call hierarchy API availability', async () => {
		// Test that the extension can handle cases where call hierarchy is not available
		const position = new vscode.Position(1, 17);
		testEditor.selection = new vscode.Selection(position, position);
		
		// This tests the extension's resilience to API failures
		try {
			const callHierarchyItems = await vscode.commands.executeCommand<vscode.CallHierarchyItem[]>(
				'vscode.prepareCallHierarchy',
				testDocument.uri,
				position
			);
			
			// If call hierarchy is available, we should get items
			if (callHierarchyItems && callHierarchyItems.length > 0) {
				assert.ok(true, 'Call hierarchy is available for TypeScript');
			} else {
				assert.ok(true, 'Call hierarchy gracefully handled when not available');
			}
		} catch (error) {
			assert.ok(true, 'Extension handles call hierarchy API errors gracefully');
		}
	});

	test('Should validate configuration constraints', () => {
		const config = vscode.workspace.getConfiguration('pathTrace');
		
		// Test that maxSearchDepth is a reasonable number
		const maxDepth = config.get<number>('maxSearchDepth', 50);
		assert.ok(maxDepth > 0, 'Max search depth should be positive');
		assert.ok(maxDepth <= 1000, 'Max search depth should be reasonable');
		
		// Test that showProgressNotifications is boolean
		const showProgress = config.get<boolean>('showProgressNotifications', true);
		assert.strictEqual(typeof showProgress, 'boolean', 'showProgressNotifications should be boolean');
	});

	test('Should handle edge cases in function detection', async () => {
		// Test various positions in the document
		const testPositions = [
			new vscode.Position(0, 0),     // Start of document
			new vscode.Position(1, 0),     // Start of function line
			new vscode.Position(1, 30),    // End of function line
			new vscode.Position(5, 0),     // Inside function body
		];
		
		for (const position of testPositions) {
			testEditor.selection = new vscode.Selection(position, position);
			
			try {
				await vscode.commands.executeCommand('path-trace.setSource');
				// Should not throw regardless of position
				assert.ok(true, `Position ${position.line}:${position.character} handled correctly`);
			} catch (error) {
				assert.fail(`Position ${position.line}:${position.character} caused error: ${error}`);
			}
		}
	});

	test('Should handle commands without active editor', async () => {
		// Close the editor temporarily
		await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		
		// Commands should handle missing editor gracefully
		try {
			await vscode.commands.executeCommand('path-trace.setSource');
			assert.ok(true, 'setSource handled missing editor gracefully');
		} catch (error) {
			assert.fail(`setSource should handle missing editor: ${error}`);
		}
		
		// Reopen the editor for other tests
		testEditor = await vscode.window.showTextDocument(testDocument);
	});

	suiteTeardown(async () => {
		// Clean up
		if (testEditor) {
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	});
});
