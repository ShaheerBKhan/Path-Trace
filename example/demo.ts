// Demo file to test Path Trace extension functionality

export function main() {
    console.log("Starting main function");
    processUserData();
}

function processUserData() {
    console.log("Processing user data");
    const isValid = validateInput();
    if (isValid) {
        transformData();
    }
}

function validateInput(): boolean {
    console.log("Validating input");
    checkPermissions();
    return true;
}

function checkPermissions() {
    console.log("Checking user permissions");
    authenticateUser();
}

function authenticateUser() {
    console.log("Authenticating user");
    logAccess();
}

function logAccess() {
    console.log("Logging access");
    // This could be our destination function
}

function transformData() {
    console.log("Transforming data");
    const processed = processInBatches();
    formatOutput(processed);
}

function processInBatches(): string[] {
    console.log("Processing in batches");
    return ["batch1", "batch2"];
}

function formatOutput(data: string[]) {
    console.log("Formatting output");
    saveToDatabase(data);
}

function saveToDatabase(data: string[]) {
    console.log("Saving to database");
    auditLog();
}

function auditLog() {
    console.log("Creating audit log");
    // Another potential destination
}

// Alternative path
function alternativeProcessing() {
    console.log("Alternative processing");
    logAccess(); // This creates another path to logAccess
}
