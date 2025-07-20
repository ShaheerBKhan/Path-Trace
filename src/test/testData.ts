// Test file data for Path Trace extension tests
export const testCode = `// Test file for Path Trace extension
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
}

function transformData() {
    console.log("Transforming data");
    formatOutput();
}

function formatOutput() {
    console.log("Formatting output");
}

// Isolated function with no path to others
function isolatedFunction() {
    console.log("This function is isolated");
}

// Deep nested functions for testing max depth
function level1() { level2(); }
function level2() { level3(); }
function level3() { level4(); }
function level4() { level5(); }
function level5() { level6(); }
function level6() { level7(); }
function level7() { level8(); }
function level8() { level9(); }
function level9() { level10(); }
function level10() { level11(); }
function level11() { level12(); }
function level12() { level13(); }
function level13() { level14(); }
function level14() { level15(); }
function level15() { console.log("Deep function"); }
`;
