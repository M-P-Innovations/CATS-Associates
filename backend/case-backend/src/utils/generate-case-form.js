
function generateCourtForm(data) {
    const htmlContent = `<div style="line-height: 1.8;">    
<div style="float: right;">Civil / Criminal / CP
Exp./Ord.C.A.No ______________
</div>
 
To,
The Officer-in-Charges
District Court Copying Section, ${data.court_location}
 
<h1 style="font-size: 25px; font-weight:bold">Subject: Application for the Grant of Certified Copy</h1>
Name of the Applicant : ${data.name}
 
Mobile No : ${data.mobile_number}
 
<div style="display: grid; grid-template-columns: 1fr 3fr; gap: 10px; font-family: inherit;">
  <div>Name of the Court</div>
  <div>: <span>_________________________________________________________</span></div>
  
  <div>Name of Judicial Officer</div>
  <div>: <span>_________________________________________________________</span></div>
  
  <div>Types of Case & Case No.</div>
  <div>: <span>_________________________________________________________</span></div>
  
  <div>Name of Parties</div>
  <div>: <span>_________________________________________________________</span></div>
  
  <div>Decided on / Fixed On</div>
  <div>: <span>_________________________________________________________</span></div>
  
  <div>Certified copies of </div>
  <div>: As per index, Chargesheet, FIR, Crime Details, Spot punchnama, MLC, 161 Statement, Arrest Memo, Bail Bond, Inquest, Postmortem report, Seizer memo, From AA, Motor Vehicle Inspection report, Vehicle Documents, CA Report if any.</div>
  
  <div>Copies to be supplied to</div>
  <div>: <span>___________________________________________________________</span></div>
  
  <div>Thanking You</div>
</div>

 
Place :    Nagpur
Date  :    ${data.current_date}  ​​​​​​​​<div style="float: right; margin-right:50px">​Applicant Signature</div>
</div>



<center><b><u>For Office Use Only</u></b></center> 


<div style="line-height: 1.4; text-align: left; width: auto; margin-bottom: 0; padding: 0;">
    Civil / Criminal / CP<br>
    Exp./Ord.C.A.No______________<br>
    Dated ______________________<br>
    Amount Rs __________________<br>
    Applicant Name ______________
</div>
<span style="margin-left:220px;">​Sr. Clerk</span>
<div style="float: right; font-family: inherit; line-height: 1.4;">
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Coping Charges</span>
        <span>Rs_____________________</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Comparing Charges</span>
        <span>Rs_____________________</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Express Charges</span>
        <span>Rs_____________________</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Total</span>
        <span>Rs_____________________</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Deposited</span>
        <span>Rs_____________________</span>
    </div>

    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Expenditure</span>
        <span>Rs_____________________</span>
    </div>
    <div style="display: flex; justify-content: space-between; width: 400px;">
        <span>Balance</span>
        <span>Rs_____________________</span>
    </div>

    <div style="float: right; width: 300px; margin-right: 20px; line-height: 1.6; white-space: normal; overflow-wrap: break-word;">
<span>The date on which copy applied for 
____________he date on which the 
application is completed in all respect 
_______________the date given  
to the application for taking delivery 
_____________the date on which 
the copy was ready for delivery 
___________the date on which it
was delivered.
     <p style="margin-left:30px; margin-top: 0;">Asst. Supdt. Record Keep District Court, Nagpur</p></span>
    </div>
</div>









Applicant is received with record
 
On________________________
 

Asst. Supdt. Record Room
District Court, Nagpur                                   

 
     
 
 
 
 
 
 











 
Solomon Affirmation,
I ${data.name} S/o______________________________age _________
Occupation as verification  officer  resident of _____________________________________________
_________________________________________________________________________________
do here by taken an oath and state on solemn affirmation that I being third party in a matter have been obtained above papers and the contents stated of the above papers, are true and correct to the best of my knowledge and belief, I hereby assure no misuse of the provided documents.
 
Hence verified and signed by Adv _____________________________________________________
 
Place -

Date -​​​​​​​​​ ${data.current_date}                <div style="float: right;margin-right:20px;text-align: center;">Deponent

Adv __________________
</div>
        `;

    return htmlContent;
}

module.exports = {
    generateCourtForm
}