// const translate = require('@iamtraction/google-translate');

// translate('Charudatta', { to: 'mr' }).then(res => {
//     console.log(res.text);
//     }).catch(err => {
//     console.error(err);
//     });

// https://www.google.com/inputtools/request?text=21-20-1203&ime=transliteration_en_mr&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&uv&cb=_callbacks_._4kk9nfkr0
// const https = require('https');

// async function translateToMarathi(text) {
//     const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mr&dt=t&q=${encodeURIComponent(text)}`;
    
//     return new Promise((resolve, reject) => {
//         https.get(url, res => {
//             let data = '';
//             res.on('data', chunk => data += chunk);
//             res.on('end', () => {
//                 try {
//                     resolve(JSON.parse(data)[0][0][0]); // Directly resolve the translated text
//                 } catch (error) {
//                     reject('Error parsing response');
//                 }
//             });
//         }).on('error', reject);
//     });
// }

// module.exports = {
//     translateToMarathi
// };


//#################################################

// const axios = require('axios');

// const text = 'hello'; // Replace with your input text
// const url = `https://www.google.com/inputtools/request?text=${encodeURIComponent(text)}&ime=transliteration_en_mr&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&uv&cb=_callbacks_._4kk9nfkr0`;

// axios.get(url)
//   .then(response => {
//     console.log(response.data)
//     // Extract the response data and parse it
//     const responseData = response.data;

//     // Remove the callback wrapper and extract JSON part
//     const jsonString = responseData.replace(/\/\*API\*\/_callbacks_._4kk9nfkr0\(/, '').replace(/\);$/, '');

//     // Parse the cleaned string into JSON
//     const parsedData = JSON.parse(jsonString);

//     // Access the specific value
//     const result = parsedData[1][0][1][0]; // This gives you "२१-२०-१२०३"
    
//     console.log('Extracted value:', result);
//   })
//   .catch(error => {
//     console.log('Error:', error.message);
//   });

//////////////////////////////////////////////////////

// const axios = require('axios');

// // Function to translate a value using Google Input Tools API
// async function translateJson(inputJson) {
//     const translatedJson = {};

//     for (const [key, value] of Object.entries(inputJson)) {
//         const apiUrl = `https://inputtools.google.com/request?text=${encodeURIComponent(value)}&itc=mr-t-i0-und&num=13&cp=0&cs=1&ie=utf-8&oe=utf-8`;

//         try {
//             const response = await axios.get(apiUrl);

//             // Check if translation is available in the response
//             if (response.data && response.data[1] && response.data[1][0] && response.data[1][0][1]) {
//                 translatedJson[key] = response.data[1][0][1][0];
//             } else {
//                 translatedJson[key] = value;  // Keep the original value if no translation found
//             }
//         } catch (error) {
//             console.error(`Error translating key "${key}":`, error.message);
//             translatedJson[key] = value;  // Fallback to original value in case of an error
//         }
//     }

//     return translatedJson;
// }

// // Example usage
// (async () => {
//     const input = {
//         greeting: "I am pranav and I am 23 years old",
//         farewell: "DOB is 2024-10-21"
//     };

//     const translated = await translateJson(input);
//     console.log(translated);
// })();