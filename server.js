const http = require("http");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

const PORT = process.env.PORT;
const notesData = require("./data/notes.json");
const dbPath = path.join(__dirname, "data", "notes.json");

// Logger middleware
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

// JSON middleware
const jsonMiddleware = (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    next();
};

const getNotesHandler = (req, res) => {
    res.write(JSON.stringify(notesData));
    res.statusCode = 200;
    res.end();
};

const getOneNoteHandler = (req, res) => {
    const id = req.url.split("/")[3];
    const note = notesData.find((note) => note.id === id);
    console.log(note);
    if (note) {
        res.write(JSON.stringify(note));
    } else {
        res.write(JSON.stringify({ message: "User not found" }));
        res.statusCode = 404;
    }

    res.end();
};

const postNoteHandler = (req, res) => {
    let body = "";
    // Listen for data
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        try {
            const newNote = {
                id: uuidv4(),
                ...JSON.parse(body),
            };

            const updatedNotes = JSON.stringify([...notesData, newNote]);

            await fs.writeFile(dbPath, updatedNotes, "utf8");
            console.log("Data appended successfully!");
            res.statusCode = 201;
            res.write(JSON.stringify(newNote));
            res.end();
        } catch (error) {
            throw new Error(error);
        }
    });
};

const updateNoteHandler = (req, res) => {
    const id = req.url.split("/")[3];
    let body = "";
    // Listen for data
    req.on("data", (chunk) => {
        body += chunk.toString();
    });
    req.on("end", async () => {
        try {
            let indexNum;
            const notes = notesData;
            notes.forEach((note, index) => {
                if (note.id === id) indexNum = index;
            });

            notes[indexNum] = {
                ...notes[indexNum],
                ...JSON.parse(body),
            };
            const updatedNotes = JSON.stringify(notes, null, 2);

            await fs.writeFile(dbPath, updatedNotes, "utf8");
            res.statusCode = 201;
            res.write(JSON.stringify(notes[indexNum]));
            res.end();
        } catch (error) {
            throw new Error(error);
        }
    });
};

const deleteNoteHandler = async (req, res) => {
    try {
        const id = req.url.split("/")[3];
        const notes = notesData;

        const updatedNotes = notes.map((note) => {
            if (note.id != id) return note;
        });
        console.log(updatedNotes);
        await fs.writeFile(
            dbPath,
            JSON.stringify(updatedNotes, null, 2),
            "utf8"
        );
        res.statusCode = 201;
        res.write(JSON.stringify(updatedNotes));
        res.end();
    } catch (error) {
        throw new Error(error);
    }
};

const server = http.createServer((req, res) => {
    logger(req, res, () => {
        jsonMiddleware(req, res, () => {
            if (req.url === "/notes/getNotes" && req.method === "GET") {
                getNotesHandler(req, res);
            } else if (
                req.url.match(
                    /^\/notes\/getNote\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
                ) &&
                req.method === "GET"
            ) {
                getOneNoteHandler(req, res);
            } else if (req.url === "/notes/addNote" && req.method === "POST") {
                postNoteHandler(req, res);
            } else if (
                req.url.match(
                    /^\/notes\/updateNote\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
                ) &&
                req.method === "PUT"
            ) {
                updateNoteHandler(req, res);
            } else if (
                req.url.match(
                    /^\/notes\/deleteNote\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
                ) &&
                req.method === "DELETE"
            ) {
                deleteNoteHandler(req, res);
            }
        });
    });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
