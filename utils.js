const fs = require("fs");

const dataToAppend = { name: "New Item" }; // Data you want to add

// Function to read, modify, and write JSON file
function appendToJSON(fileName, data) {
    fs.readFile(fileName, "utf8", (err, fileContent) => {
        if (err) {
            console.error(err);
            return;
        }

        // Parse JSON data
        let content = JSON.parse(fileContent);

        // Assuming data needs to be appended to an array in the JSON
        content.push(data);

        // Stringify the updated data
        const updatedContent = JSON.stringify(content, null, 2);

        // Write the updated JSON data to the file
        fs.writeFile(fileName, updatedContent, "utf8", (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log("Data appended successfully!");
        });
    });
}

appendToJSON("data.json", dataToAppend); // Replace 'data.json' with your filename
