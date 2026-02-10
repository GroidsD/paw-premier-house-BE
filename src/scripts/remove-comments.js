import fs from "fs";
import path from "path";

const TARGET_DIR = "./src";

function stripComments(code) {
    let result = "";
    let inString = false;
    let stringChar = "";
    let i = 0;

    while (i < code.length) {
        const c = code[i];
        const next = code[i + 1];

        if (!inString && c === "/" && next === "/") {
            while (i < code.length && code[i] !== "\n") i++;
            continue;
        }

        if (!inString && c === "/" && next === "*") {
            i += 2;
            while (i < code.length && !(code[i] === "*" && code[i + 1] === "/"))
                i++;
            i += 2;
            continue;
        }

        if ((c === '"' || c === "'" || c === "`") && code[i - 1] !== "\\") {
            if (!inString) {
                inString = true;
                stringChar = c;
            } else if (stringChar === c) {
                inString = false;
            }
        }

        result += c;
        i++;
    }

    return result;
}

function walk(dir) {
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);

        if (stat.isDirectory()) {
            walk(full);
        } else if (/\.(js|ts)$/.test(file)) {
            const code = fs.readFileSync(full, "utf8");
            const cleaned = stripComments(code);
            fs.writeFileSync(full, cleaned);
            console.log("✔ cleaned:", full);
        }
    }
}

walk(TARGET_DIR);
