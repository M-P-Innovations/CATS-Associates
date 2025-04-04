
function generateRTIForm(data) {
    // Update with the actual path to your image
    var ifTypeDeathContent = `</table>
    
    

    `;

    if (false) {
        ifTypeDeathContent = `
      <tr>
        <td style="border: 1px solid black; padding: 5px;">मरणूत्तर पांचनामा</td>
        <td style="border: 1px solid black; padding: 5px;">शव पांचनामा</td>
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">पोस्टमोरटूम रीपोर्ट</td>
        <td style="border: 1px solid black; padding: 5px;">वीसेरा प्रेपोर्ट (असल्यास)</td>
    </tr>
    </table>`;
    };

    const tableContent = `
    <style>
    @media print {
    #second-page-content {
        break-before: page;   /* Modern browsers */
        page-break-before: always; /* Older browsers */
    }
    
    /* Optional styling for better print layout */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    td, th {
        border: 1px solid black;
        padding: 8px;
        text-align: left;
        }
    }
    </style>
    <table style="border-spacing: 30px 3px; border: 1px; width: 100%;">
    <tr>
        <td style="border: 1px solid black; padding: 5px;">स्टेशन डायरीचीप्रत
        <td style="border: 1px solid black; padding: 5px;">वाहन जप्ती पत्रक 
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">प्रथम खबर
        <td style="border: 1px solid black; padding: 5px;">जमानतनामा 
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">जि दि एन्ट्री
        <td style="border: 1px solid black; padding: 5px;">वाहनाची दस्तावेज (आर सी , पर्मिट, फिटनेस, विमा)
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">गुण्याच्या तापसीलाचा नमूना
        <td style="border: 1px solid black; padding: 5px;">१६१ बयाने
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">घटनास्थळ पांचनामा
        <td style="border: 1px solid black; padding: 5px;">वाहन चालक परवाना
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">एम एल सी
        <td style="border: 1px solid black; padding: 5px;">घटना स्थळी टिपललेले छायाचित्र
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">अटक मेमो
        <td style="border: 1px solid black; padding: 5px;">अंतिम अहवाल
    </tr>
    <tr>
        <td style="border: 1px solid black; padding: 5px;">मोटर वाहन तांत्रिक तपासणी अहवाल
        <td style="border: 1px solid black; padding: 5px;">मर्ग खबर
    </tr>
    ${ifTypeDeathContent}
    `
    const htmlContent = `<center style="margin-left:100px">जोडपत्र - अ 
        सूचना अधिकार अधिनियम 2005
        </center>

        के. नंबर - <span style="margin-left:0px" class="input" role="textbox" contentEditable>${data.claim_no}</span>

        प्रति, 
        जन माहिती अधिकारी,तथा 
        वरिष्ट पोलीस निक्रीक्षक
        <span style="margin-left:0px" class="input" role="textbox" contentEditable>${data.police_station}</span>

        आवेदका चे पूर्ण नाव - ${data.insurer} तर्फे श्री. चारुदत्त रामचंद्र कानडे
        1.पत्ता - प्लॉट नो २२ दीनदयाल नगर पडोळे- ले-ओउट, पडोळे होप्सितल च्या मागे रींग रोड नागपूर - 440022 
        2.फोन नंबर - ७६२०३५४४९९
        3.आवश्यक सूचनेचे विवरण - विमा कंपनीला अपघात प्रकरण प्राप्त झाले असून त्याच्या निराकरण सत्यापित प्रत ची पूर्तता करण्यास आपणास समक्ष विनंती.
        अ. सूचनेचा विषय - पुलिस स्टेशन <span style="margin-left:0px" class="input" role="textbox" contentEditable>${data.police_station}</span> अ. प क्रमांक - <span style="margin-left:0px" class="input" role="textbox" contentEditable>${data.fir_no}</span> प्रथम खबर 
        दिनांक <span style="margin-left:0px" class="input" role="textbox" contentEditable>${data.fir_date.split('त')[0].split('-').reverse().join('-')}</span> मध्ये झालेल्या मोटार अपघात प्रकरणी.
        ब. संबंधित सूचनेचा कालावधी - १५ दिवस       
        क. आवश्यक सूचनेचे विस्तृत वर्णन - वरील माहिती प्रमाणे विमा कंपनीला अपघात प्रकरण प्राप्त झाले असून व सदर प्रकरण न्याय प्राधिकरणाच्या संकेत स्थळी प्राप्त होत नसल्याने आपणा समक्ष अर्ज. सदर प्रकरणाच्या निराकरण करीता सत्यापित प्रत ची पूर्तता करण्यास आपणास समक्ष विनंती
        ${tableContent}
        
        
        4. उपरोक्त माहितीचा उपयोग फक्त कार्यालयीन कामासाठी करण्यात येईल व इतर कुठलाही गैर वापर होणार नाही याची दक्षता घेण्यात येईल.
        5. सूचना पत्र द्वारा  पाहिजे अथवा व्यक्तिगत  रूपात - पत्राद्वारे
          आवश्यक हे अथवा  कसे - पत्राद्वारे (प्रत्यक्ष पत्रका खर्च अतिरिक्त शुल्क  मध्ये समावेश  केल्या जाईल)
          जर पत्रद्वारा  आहे  तर त्या संदर्भीय  रजिस्टर्ड (साधारण रजिस्टर्ड अथवा स्पीड पोस्ट).
        6. माहिती आवश्यक असल्याचे प्रयोजन - मोटार अपघात दावा  प्रकरणी नीराकरणा  हेतू.

        
        

        स्थान     : नागपूर                                                 
        दिनांक  :  ${data.current_date}​                                           <span style="float: right; margin-right: 50px">आवेदकाचे हस्ताक्षर</span>
    
        `;

    return htmlContent;
}

module.exports = {
    generateRTIForm
}