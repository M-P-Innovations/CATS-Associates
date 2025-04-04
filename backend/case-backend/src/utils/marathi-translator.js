const axios = require('axios');

// Function to translate values in a batch using Google Input Tools API
async function translateToMarathi(inputJson) {
    const translatedJson = {};

    // Collect all values from the input JSON
    const values = Object.values(inputJson);

    // Build the API URL with all values concatenated
    const apiUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(values.join(','))}&itc=mr-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8`;

    try {
        const response = await axios.get(apiUrl);

        // Check if the translation response is valid
        if (response.data && response.data[1]) {
            // Map the translated values back to their original keys
            let i = 0;
            for (const key of Object.keys(inputJson)) {
                if (response.data[1][i] && response.data[1][i][1] && response.data[1][i][1][0]) {
                    translatedJson[key] = response.data[1][i][1][0];
                } else {
                    translatedJson[key] = inputJson[key]; // Fallback to original value if no translation found
                }
                i++;
            }
        } else {
            // Fallback to original values if no translation data is found
            Object.assign(translatedJson, inputJson);
        }
    } catch (error) {
        console.error('Error during translation:', error.message);
        // Fallback to original values in case of error
        Object.assign(translatedJson, inputJson);
    }

    return translatedJson;
}
module.exports = {
    translateToMarathi
}

// // Example usage
// (async () => {
//     const input = {
//         greeting: "23 years old",
//         farewell: "DOB is 2024-10-21"
//     };

//     const translated = await translateJson(input);
//     console.log(translated);
// })();
