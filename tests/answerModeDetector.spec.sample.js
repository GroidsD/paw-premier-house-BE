const detectAnswerMode = require("./../src/services/AI/answerModeDetector");
const testcases = require("./chatbot_mode_testcases.json");

let passed = 0;

for (const tc of testcases) {
    const result = detectAnswerMode({
        message: tc.message,
        intent: tc.intent,
        analysis: tc.analysis,
        currentUser: tc.currentUser,
    });

    const ok = result.mode === tc.expectedMode;

    if (ok) {
        passed += 1;
        console.log(`✅ ${tc.name}: ${result.mode}`);
    } else {
        console.log(
            `❌ ${tc.name}: expected=${tc.expectedMode}, got=${result.mode}, reason=${result.reason}`,
        );
    }
}

console.log(`\nPassed ${passed}/${testcases.length} testcases`);
