import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://shvlfzqqputhddkulttx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNodmxmenFxcHV0aGRka3VsdHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1ODQ2ODUsImV4cCI6MjA3MzE2MDY4NX0.W1Cph1CNWVSpQfw3fVSpPqSLn338PqG5ayDnSjfCD68'
const BUCKET = 'danz-uploader'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const fileInput = document.getElementById('fileInput')
const uploadBtn = document.getElementById('uploadBtn')
const resultDiv = document.getElementById('result')
const progressBar = document.getElementById('progressBar')

function formatDate(date){
  return date.toLocaleString('id-ID', {
    day:'2-digit', month:'short', year:'numeric',
    hour:'2-digit', minute:'2-digit'
  })
}

function safeCopy(text, btn){
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      btn.innerText = "Copied!"
      setTimeout(() => btn.innerText = "Copy", 1500)
    })
  } else {
    const t = document.createElement("textarea")
    t.value = text
    document.body.appendChild(t)
    t.select()
    document.execCommand("copy")
    document.body.removeChild(t)
    alert("✅ Link disalin")
  }
}

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0]
  if (!file) return alert('Pilih file dulu')

  const fileName = Date.now() + '-' + file.name
  progressBar.style.width = '20%'

  try {
    const { error } = await supabase
      .storage
      .from(BUCKET)
      .upload(fileName, file)

    if (error) throw error

    const fileUrl = `/uploads/${fileName}`
    const previewUrl = URL.createObjectURL(file)

    let preview = ''
    if (file.type.startsWith('image/')) {
      preview = `<img src="${previewUrl}" style="max-width:100%;border-radius:10px">`
    } else if (file.type.startsWith('video/')) {
      preview = `<video src="${previewUrl}" controls style="width:100%"></video>`
    } else if (file.type.startsWith('audio/')) {
      preview = `<audio src="${previewUrl}" controls></audio>`
    }

    resultDiv.style.display = "block"
    resultDiv.innerHTML = `
      <p>✅ Upload berhasil (${formatDate(new Date())})</p>
      <div class="result-box">
        <input id="fileUrl" value="${fileUrl}" readonly>
        <button id="copyBtn">Copy</button>
      </div>
      ${preview}
    `

    document.getElementById("copyBtn")
      .addEventListener("click", e => safeCopy(fileUrl, e.target))

    progressBar.style.width = '100%'

  } catch (err) {
    alert(err.message)
    progressBar.style.width = '0%'
  }
})
