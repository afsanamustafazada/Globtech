const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = __dirname;
const port = Number(process.env.PORT || 3000);
const defaultModel = "gemini-2.5-flash";

loadEnvFile(path.join(rootDir, ".env"));

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      return;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 12000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });

    request.on("error", reject);
  });
}

function getStaticFilePath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${port}`);
  const cleanPath = decodeURIComponent(url.pathname);
  const requestedPath = cleanPath === "/" ? "/index.html" : cleanPath;
  const resolvedPath = path.resolve(rootDir, `.${requestedPath}`);

  if (!resolvedPath.startsWith(rootDir)) {
    return null;
  }

  return resolvedPath;
}

function serveStatic(request, response) {
  const filePath = getStaticFilePath(request.url);

  if (!filePath) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=3600",
    });
    response.end(content);
  });
}

function buildGeminiPayload(message, language) {
  const languageName = {
    az: "Azerbaijani",
    ru: "Russian",
    en: "English",
  }[language] || "Azerbaijani";

  return {
    system_instruction: {
      parts: [
        {
          text:
            "You are GlobTech Consulting & Engineering's website assistant. " +
            "Help potential clients describe IT infrastructure, ELV, CCTV, access control, fire alarm, cloud, DevOps and service projects. " +
            "Answer concisely, practically and in the requested language. Use a clear structure: detected systems, suggested first steps, risk notes and next question. " +
            "Do not invent prices, legal guarantees or confirmed project commitments. " +
            "End with a short next step for contacting GlobTech.",
        },
      ],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Language: ${languageName}\nClient request: ${message}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.45,
      maxOutputTokens: 700,
    },
  };
}

async function handleGemini(request, response) {
  if (request.method !== "POST") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    sendJson(response, 500, {
      error: "GEMINI_API_KEY is not configured on the server.",
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const message = String(body.message || "").trim();
    const language = String(body.language || "az").trim();

    if (message.length < 8) {
      sendJson(response, 400, {
        error: "Please describe the project in a little more detail.",
      });
      return;
    }

    const model = process.env.GEMINI_MODEL || defaultModel;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const geminiResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(buildGeminiPayload(message.slice(0, 4000), language)),
    });

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      sendJson(response, geminiResponse.status, {
        error: data.error?.message || "Gemini API request failed.",
      });
      return;
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() || "No response was returned.";

    sendJson(response, 200, { text });
  } catch (error) {
    sendJson(response, 500, { error: error.message || "Server error." });
  }
}

const server = http.createServer((request, response) => {
  if (request.url.startsWith("/api/gemini")) {
    handleGemini(request, response);
    return;
  }

  serveStatic(request, response);
});

server.listen(port, () => {
  console.log(`GlobTech site running at http://localhost:${port}`);
});
