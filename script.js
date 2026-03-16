// ===== PARTICLES =====
function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const p = document.createElement("div");
    p.className = "particle";

    const size = Math.random() * 4 + 1;

    p.style.cssText = `
      width:${size}px;
      height:${size}px;
      background:rgba(124,58,237,0.4);
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      position:absolute;
      border-radius:50%;
      animation: float ${Math.random()*10+10}s linear infinite;
    `;

    container.appendChild(p);
  }
}

// ===== NAVIGATION =====
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

// ===== FILE UPLOAD =====
function handleUploadClick() {
  const input = document.getElementById("fileInput");
  if (input) input.click();
}

async function handleFileUpload(event) {

  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("summarySection").classList.remove("hidden");
  document.getElementById("summaryLoader").classList.remove("hidden");

  const fileReader = new FileReader();

  fileReader.onload = async function () {

    try {

      const typedarray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;

      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {

        const page = await pdf.getPage(i);
        const content = await page.getTextContent();

        content.items.forEach(item => {
          text += item.str + " ";
        });

      }

      generateSummary(text);

    } catch (err) {
      console.error("PDF Error:", err);
    }

  };

  fileReader.readAsArrayBuffer(file);
}

// ===== DRAG DROP =====
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("uploadZone")?.classList.add("drag-over");
}

function handleDragLeave() {
  document.getElementById("uploadZone")?.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();

  const zone = document.getElementById("uploadZone");
  if (zone) zone.classList.remove("drag-over");

  const file = e.dataTransfer.files[0];

  if (file) {
    const fakeEvent = { target: { files: [file] } };
    handleFileUpload(fakeEvent);
  }
}

// ===== SUCCESS POPUP =====
function showSuccessPopup() {
  const success = document.getElementById("successPopup");
  if (success) {
    success.classList.remove("hidden");
    success.classList.add("flex");
  }
}

function closeSuccess() {
  const success = document.getElementById("successPopup");
  if (success) success.classList.add("hidden");

  const upload = document.getElementById("upload");
  if (upload) upload.scrollIntoView({ behavior: "smooth" });
}



// ===== LOGIN / SIGNUP MODALS =====
function openLogin() {
  document.getElementById("signupModal")?.classList.add("hidden");
  const login = document.getElementById("loginModal");
  login?.classList.remove("hidden");
  login?.classList.add("flex");
}

function openSignup() {
  document.getElementById("loginModal")?.classList.add("hidden");
  const signup = document.getElementById("signupModal");
  signup?.classList.remove("hidden");
  signup?.classList.add("flex");
}

function closeLogin() {
  const login = document.getElementById("loginModal");
  login?.classList.add("hidden");
  login?.classList.remove("flex");
}

function closeSignup() {
  const signup = document.getElementById("signupModal");
  signup?.classList.add("hidden");
  signup?.classList.remove("flex");
}

function loginUser() {
  closeLogin();
  showSuccessPopup();
}

function signupUser() {
  closeSignup();
  showSuccessPopup();
}



// ===== AI SUMMARY =====
async function generateSummary(text) {

const output = document.getElementById("summaryOutput");

try {

output.innerHTML = "🤖 AI loading model... (first time takes ~10s)";

const summarizer = await window.pipeline(
"summarization",
"Xenova/distilbart-cnn-6-6"
);

const result = await summarizer(text.slice(0,1200));

document.getElementById("summaryLoader").classList.add("hidden");

output.innerHTML = result[0].summary_text;

} catch(err){

console.error(err);
output.innerHTML = "❌ AI model failed to load";

}

}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", function () {

  createParticles();

  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

});

function setDifficulty(btn){

document.querySelectorAll(".difficulty-btn")
.forEach(b=>b.classList.remove("active-diff"));

btn.classList.add("active-diff");

}


async function signupUser(){

const name=document.querySelector("#signupModal input[type='text']").value
const email=document.querySelector("#signupModal input[type='email']").value
const password=document.querySelector("#signupModal input[type='password']").value

try{

const res=await fetch("http://localhost:5000/signup",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({name,email,password})
})

const data=await res.json()

alert(data.message)

if(data.message==="Signup successful"){

// close signup
closeSignup()

// open login automatically
openLogin()

}

}catch(err){

alert("Server error")

}

}
async function loginUser(){

const email=document.querySelector("#loginModal input[type='email']").value
const password=document.querySelector("#loginModal input[type='password']").value

const res=await fetch("http://localhost:5000/login",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({email,password})
})

const data=await res.json()

alert(data.message)

if(data.message==="Login successful"){
closeLogin()
}

}


function toggleChat(){

const chat=document.getElementById("chatWindow")

chat.classList.toggle("hidden")

}



async function handleChat(event){

event.preventDefault()

const input=document.getElementById("chatInput")
const messages=document.getElementById("chatMessages")

const text=input.value.trim()

if(!text) return

// user message
messages.innerHTML+=`
<div style="margin-left:auto" class="bg-purple-600 text-white px-4 py-2 rounded-xl max-w-xs">
${text}
</div>
`

input.value=""

messages.scrollTop=messages.scrollHeight

// loading
const loading=document.createElement("div")
loading.className="bg-white/10 text-white px-4 py-2 rounded-xl max-w-xs"
loading.innerHTML="Thinking..."

messages.appendChild(loading)

try{

const res=await fetch("http://localhost:5000/chat",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({message:text})
})

const data=await res.json()

loading.remove()

messages.innerHTML+=`
<div class="bg-white/10 text-white px-4 py-2 rounded-xl max-w-xs">
${data.reply}
</div>
`

messages.scrollTop=messages.scrollHeight

}catch(err){

loading.innerHTML="AI error"

}

}