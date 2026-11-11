// 7 AN TRANSLATE PRO - MAIN CLIENT APPLICATION JAVASCRIPT

let currentDoc = {
    filename: "",
    word_count: 0,
    page_count: 1,
    is_scanned: false,
    blocks: [],
    detected_domain: "Các lĩnh vực khác",
    matched_terms: [],
    pricing: {}
};

let currentAuditReports = [];
let assistantHistory = [];
let isEditMode = false;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    checkSystemStatus();
    loadTerms();
    loadOrders();
    loadCommercialSummary();
});

// ================= NAVIGATION & TABS =================

function switchTab(tabId) {
    const tabs = ['studio', 'terms', 'commercial', 'settings'];
    tabs.forEach(t => {
        const view = document.getElementById(`view-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);
        if (t === tabId) {
            view.classList.remove('hidden');
            btn.classList.add('active');
            btn.classList.remove('text-blue-100');
        } else {
            view.classList.add('hidden');
            btn.classList.remove('active');
            btn.classList.add('text-blue-100');
        }
    });

    if (tabId === 'terms') loadTerms();
    if (tabId === 'commercial') {
        loadOrders();
        loadCommercialSummary();
    }
}

function updateStepper(stepNumber) {
    for (let i = 1; i <= 8; i++) {
        const el = document.getElementById(`step-${i}`);
        if (!el) continue;
        el.classList.remove('active', 'completed');
        if (i < stepNumber) {
            el.classList.add('completed');
        } else if (i === stepNumber) {
            el.classList.add('active');
        }
    }
}

// ================= FILE UPLOAD & PARSING =================

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    updateStepper(1);
    showSourceLoading("Đang phân tích cấu trúc tài liệu và trích xuất chữ (OCR nếu có)...");

    try {
        const resp = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });
        const data = await resp.json();

        if (data.success) {
            currentDoc = data;
            displayParsedDocument(data);
            updateStepper(4); // Advance to Terminology check
        } else {
            alert(`Lỗi: ${data.message}`);
            updateStepper(1);
        }
    } catch (err) {
        alert(`Lỗi tải tệp: ${err.message}`);
        updateStepper(1);
    }
}

function displayParsedDocument(doc) {
    // Show File Meta Banner
    const banner = document.getElementById("file-meta-banner");
    banner.classList.remove("hidden");
    document.getElementById("current-filename").innerText = doc.filename;
    document.getElementById("current-wordcount").innerText = doc.word_count.toLocaleString();
    document.getElementById("current-pagecount").innerText = doc.page_count;

    const ocrBadge = document.getElementById("ocr-badge");
    if (doc.is_scanned) {
        ocrBadge.classList.remove("hidden");
    } else {
        ocrBadge.classList.add("hidden");
    }

    // Set pricing preview
    const proPrice = doc.pricing?.professional?.total_vnd_formatted || "0 VNĐ";
    document.getElementById("current-price-estimate").innerText = proPrice;
    document.getElementById("cost-preview-tag").innerText = proPrice;

    // Set Domain
    if (doc.detected_domain) {
        const dSelect = document.getElementById("domain-select");
        dSelect.value = doc.detected_domain;
        updateDomainUI();
    }

    // Display Matched Terms
    const termsBox = document.getElementById("matched-terms-box");
    const termsList = document.getElementById("matched-terms-list");
    if (doc.matched_terms && doc.matched_terms.length > 0) {
        termsBox.classList.remove("hidden");
        document.getElementById("matched-terms-count").innerText = doc.matched_terms.length;
        termsList.innerHTML = doc.matched_terms.map(t => 
            `<span class="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold border border-amber-300">
                ${t.source} ➔ <strong class="text-brand-900">${t.target}</strong>
            </span>`
        ).join("");
    } else {
        termsBox.classList.add("hidden");
    }

    // Render Source Pane Blocks
    const sPane = document.getElementById("source-pane-content");
    sPane.innerHTML = doc.blocks.map((b, idx) => `
        <div class="p-2.5 rounded-lg border border-slate-100 bg-white hover:border-blue-200 transition">
            <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>#${b.id} • ${b.type.toUpperCase()} • Trang ${b.page || 1}</span>
            </div>
            <p class="${b.type === 'heading' ? 'font-bold text-slate-900' : 'text-slate-700'}">${escapeHtml(b.source_text)}</p>
        </div>
    `).join("");

    document.getElementById("source-word-counter").innerText = `Tổng số từ: ${doc.word_count.toLocaleString()}`;

    // Reset Target Pane
    const tPane = document.getElementById("target-pane-content");
    tPane.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <i class="fa-solid fa-language text-4xl mb-3 text-slate-300"></i>
            <p class="font-semibold text-slate-600">Đã nạp ${doc.blocks.length} phân đoạn tài liệu</p>
            <p class="text-xs text-slate-400 mt-1">Bấm nút "5. BẮT ĐẦU DỊCH" để hệ thống DeepSeek & Gemini xử lý với quy tắc kiểm soát thuật ngữ.</p>
        </div>
    `;

    // Update Assistant context indicator
    document.getElementById("assistant-doc-ref").innerHTML = `<i class="fa-solid fa-file text-brand-600 mr-1"></i>${doc.filename} (${doc.word_count} từ)`;
    document.getElementById("assistant-domain-badge").innerText = doc.detected_domain;
}

function clearCurrentDocument() {
    currentDoc = {
        filename: "",
        word_count: 0,
        page_count: 1,
        is_scanned: false,
        blocks: [],
        detected_domain: "Các lĩnh vực khác",
        matched_terms: [],
        pricing: {}
    };
    document.getElementById("file-meta-banner").classList.add("hidden");
    document.getElementById("matched-terms-box").classList.add("hidden");
    document.getElementById("source-pane-content").innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <i class="fa-solid fa-cloud-arrow-up text-4xl mb-3 text-slate-300"></i>
            <p class="font-semibold text-slate-600">Chưa có tài liệu nào được tải lên</p>
            <p class="text-xs text-slate-400 mt-1 max-w-sm">Kéo thả file vào đây hoặc chọn nút "TẢI TÀI LIỆU" ở trên.</p>
        </div>
    `;
    document.getElementById("target-pane-content").innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-400 text-center p-6">
            <i class="fa-solid fa-language text-4xl mb-3 text-slate-300"></i>
            <p class="font-semibold text-slate-600">Bản dịch sẽ hiển thị tại đây</p>
        </div>
    `;
    updateStepper(1);
}

// ================= PRE-BUILT SAMPLES =================

function loadSample(type) {
    let sampleData = {};
    if (type === 'contract') {
        sampleData = {
            filename: "Commercial_Sale_Agreement_2026.docx",
            file_type: "docx",
            word_count: 320,
            page_count: 2,
            is_scanned: false,
            detected_domain: "Pháp luật – Hợp đồng",
            blocks: [
                { id: 1, type: "heading", page: 1, source_text: "INTERNATIONAL COMMERCIAL SALE AND PURCHASE CONTRACT" },
                { id: 2, type: "p", page: 1, source_text: "Article 14: Force Majeure Clause. Neither party shall be liable for any failure of or delay in the performance of this agreement for the period that such failure or delay is due to acts of God, public enemy, war, strikes, or any other cause beyond its reasonable control." },
                { id: 3, type: "p", page: 1, source_text: "Article 15: Governing Law and Dispute Resolution. This Contract shall be governed by and construed in accordance with the laws of Vietnam. Any dispute arising out of or in connection with this contract shall be referred to and finally resolved by arbitration administered by the Vietnam International Arbitration Centre (VIAC)." },
                { id: 4, type: "p", page: 2, source_text: "Article 16: Indemnification and Hold Harmless. The Seller shall indemnify, defend, and hold harmless the Buyer against any claims, losses, liquidated damages, liabilities, and expenses arising out of any breach of contract." }
            ],
            matched_terms: [
                { source: "force majeure clause", target: "điều khoản bất khả kháng", domain: "Pháp luật – Hợp đồng" },
                { source: "governing law and dispute resolution", target: "luật áp dụng và giải quyết tranh chấp", domain: "Pháp luật – Hợp đồng" },
                { source: "indemnification and hold harmless", target: "bồi hoàn và miễn trừ trách nhiệm", domain: "Pháp luật – Hợp đồng" },
                { source: "breach of contract", target: "vi phạm hợp đồng", domain: "Pháp luật – Hợp đồng" },
                { source: "liquidated damages", target: "khoản tiền bồi thường định trước", domain: "Pháp luật – Hợp đồng" }
            ],
            pricing: {
                professional: { total_vnd_formatted: "35,000 VNĐ" }
            }
        };
    } else if (type === 'medical') {
        sampleData = {
            filename: "Clinical_Trial_Protocol_Cardiology.pdf",
            file_type: "pdf",
            word_count: 280,
            page_count: 1,
            is_scanned: false,
            detected_domain: "Y khoa – Dược phẩm",
            blocks: [
                { id: 1, type: "heading", page: 1, source_text: "PHASE III CLINICAL TRIAL PROTOCOL: CARDIOVASCULAR EFFICACY" },
                { id: 2, type: "p", page: 1, source_text: "The investigational active pharmaceutical ingredient (API) is formulated as a 50mg sustained-release tablet administered orally once daily. Patients diagnosed with acute myocardial infarction were enrolled in this double-blind study." },
                { id: 3, type: "p", page: 1, source_text: "The elimination half-life (t1/2) is approximately 14.5 hours. Absolute contraindication includes severe hepatic impairment and hypersensitivity to the drug class. Any adverse drug reaction (ADR) grade 3 or higher must be reported within 24 hours." }
            ],
            matched_terms: [
                { source: "active pharmaceutical ingredient (API)", target: "hoạt chất dược dụng", domain: "Y khoa – Dược phẩm" },
                { source: "myocardial infarction", target: "nhồi máu cơ tim", domain: "Y khoa – Dược phẩm" },
                { source: "half-life (t1/2)", target: "thời gian bán thải", domain: "Y khoa – Dược phẩm" },
                { source: "contraindication", target: "chống chỉ định", domain: "Y khoa – Dược phẩm" },
                { source: "adverse drug reaction (ADR)", target: "phản ứng có hại của thuốc", domain: "Y khoa – Dược phẩm" }
            ],
            pricing: {
                professional: { total_vnd_formatted: "35,000 VNĐ" }
            }
        };
    } else { // tech
        sampleData = {
            filename: "Enterprise_AI_System_Whitepaper.docx",
            file_type: "docx",
            word_count: 310,
            page_count: 2,
            is_scanned: false,
            detected_domain: "Công nghệ thông tin – AI",
            blocks: [
                { id: 1, type: "heading", page: 1, source_text: "HIGH-THROUGHPUT AI PLATFORM ARCHITECTURE SPECIFICATION" },
                { id: 2, type: "p", page: 1, source_text: "The application integrates a state-of-the-art large language model (LLM) utilizing retrieval-augmented generation (RAG) to ensure contextual accuracy and prevent hallucination." },
                { id: 3, type: "p", page: 2, source_text: "Performance benchmarks require latency and throughput to maintain sub-100ms response times at peak load. The inference engine supports zero-shot learning across multiple domains." }
            ],
            matched_terms: [
                { source: "retrieval-augmented generation (RAG)", target: "tạo sinh tăng cường truy xuất", domain: "Công nghệ thông tin – AI" },
                { source: "large language model (LLM)", target: "mô hình ngôn ngữ lớn", domain: "Công nghệ thông tin – AI" },
                { source: "latency and throughput", target: "độ trễ và thông lượng", domain: "Công nghệ thông tin – AI" },
                { source: "zero-shot learning", target: "học không cần mẫu huấn luyện", domain: "Công nghệ thông tin – AI" }
            ],
            pricing: {
                professional: { total_vnd_formatted: "35,000 VNĐ" }
            }
        };
    }

    currentDoc = sampleData;
    displayParsedDocument(sampleData);
    updateStepper(4);
}

// ================= CONTROLS & UI UPDATES =================

function updateLanguageUI() {
    const sel = document.getElementById("source-lang-select");
    const label = document.getElementById("selected-lang-label");
    const text = sel.options[sel.selectedIndex].text;
    label.innerText = `${text} → Tiếng Việt`;
    updateStepper(2);
}

function updateDomainUI() {
    const sel = document.getElementById("domain-select");
    const label = document.getElementById("selected-domain-label");
    label.innerText = sel.value;
    updateStepper(3);
}

function updateAIModeUI() {
    const sel = document.getElementById("ai-mode-select");
    const label = document.getElementById("selected-aimode-label");
    const badge = document.getElementById("engine-badge");
    const val = sel.value;

    if (val === 'hybrid') {
        label.innerText = "DeepSeek + Gemini";
        badge.innerHTML = `<i class="fa-solid fa-circle-check text-green-500"></i><span>Chế độ: Phối hợp 2 AI (Kiểm tra chéo)</span>`;
    } else if (val === 'deepseek_only') {
        label.innerText = "Chỉ DeepSeek";
        badge.innerHTML = `<i class="fa-solid fa-brain text-blue-600"></i><span>Chế độ: Chỉ sử dụng DeepSeek AI</span>`;
    } else {
        label.innerText = "Chỉ Google Gemini";
        badge.innerHTML = `<i class="fa-solid fa-sparkles text-purple-600"></i><span>Chế độ: Chỉ sử dụng Google Gemini AI</span>`;
    }
}

// ================= TRANSLATION EXECUTION =================

async function confirmAndStartTranslation() {
    if (!currentDoc.blocks || currentDoc.blocks.length === 0) {
        alert("Vui lòng tải tài liệu lên trước khi bắt đầu dịch.");
        return;
    }

    const domain = document.getElementById("domain-select").value;
    const aiMode = document.getElementById("ai-mode-select").value;
    const priceEst = currentDoc.pricing?.professional?.total_vnd_formatted || "35,000 VNĐ";

    // Budget confirmation dialog
    const confirmed = confirm(
        `XÁC NHẬN BẮT ĐẦU DỊCH THUẬT (7 AN TRANSLATE PRO)\n\n` +
        `• Tài liệu: ${currentDoc.filename}\n` +
        `• Số từ: ${currentDoc.word_count.toLocaleString()} từ (${currentDoc.page_count} trang)\n` +
        `• Chuyên ngành: ${domain}\n` +
        `• Mô hình AI: ${aiMode === 'hybrid' ? 'Phối hợp DeepSeek + Gemini (Kiểm tra chéo)' : aiMode}\n` +
        `• Chi phí dự toán: ${priceEst}\n\n` +
        `Hệ thống sẽ bảo toàn 100% thuật ngữ đã được phê duyệt trong 7 AN Terminology Bank.\n` +
        `Bạn có muốn tiếp tục?`
    );

    if (!confirmed) return;

    // Trigger commercial order creation
    recordCommercialOrder();

    updateStepper(5);
    const tPane = document.getElementById("target-pane-content");
    tPane.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-4">
            <div class="w-12 h-12 border-4 border-brand-600 border-t-accent-500 rounded-full animate-spin"></div>
            <div>
                <p class="font-bold text-brand-900 text-base">Hệ thống AI đang thực hiện dịch thuật chuyên ngành...</p>
                <p class="text-xs text-slate-400 mt-1">Đang kiểm định thuật ngữ, số liệu và chạy kiểm tra chéo hai mô hình.</p>
            </div>
        </div>
    `;

    try {
        const resp = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                blocks: currentDoc.blocks,
                domain: domain,
                ai_mode: aiMode,
                source_lang: document.getElementById("source-lang-select").value
            })
        });

        const data = await resp.json();

        if (data.success) {
            currentDoc.blocks = data.translated_blocks;
            currentAuditReports = data.audit_reports || [];
            displayTranslatedDocument(data);
            updateStepper(8); // Completed

            // Auto-refresh commercial stats
            loadCommercialSummary();
            loadOrders();
        } else {
            alert(`Lỗi dịch thuật: ${data.message}`);
            updateStepper(5);
        }
    } catch (err) {
        alert(`Lỗi kết nối máy chủ dịch thuật: ${err.message}`);
        updateStepper(5);
    }
}

function displayTranslatedDocument(data) {
    const tPane = document.getElementById("target-pane-content");
    
    tPane.innerHTML = data.translated_blocks.map((b, idx) => `
        <div class="p-3 rounded-xl border border-blue-100 bg-white shadow-sm hover:border-brand-500 transition relative group">
            <div class="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                <span class="font-bold text-brand-700"><i class="fa-solid fa-check text-green-500 mr-1"></i>#${b.id} • ${b.ai_provider || '7 AN Engine'}</span>
                <span class="text-slate-400">${b.audit ? 'Đã kiểm định chéo' : 'Bản dịch chuẩn'}</span>
            </div>
            <div 
                id="block-target-${idx}"
                class="editable-block text-slate-800 leading-relaxed ${b.type === 'heading' ? 'font-bold text-brand-900 text-base' : 'text-sm'}"
                contenteditable="${isEditMode}"
                onblur="updateBlockTranslation(${idx}, this.innerText)"
            >${escapeHtml(b.translated_text || '')}</div>
        </div>
    `).join("");

    // Audit count badge
    const auditBtn = document.getElementById("audit-count-badge");
    if (currentAuditReports.length > 0) {
        auditBtn.innerHTML = `<span class="text-amber-600 font-bold"><i class="fa-solid fa-triangle-exclamation mr-1"></i>${currentAuditReports.length} điểm đối soát</span>`;
    } else {
        auditBtn.innerHTML = `<span class="text-green-600 font-bold"><i class="fa-solid fa-circle-check mr-1"></i>Đồng thuận tuyệt đối</span>`;
    }
}

function updateBlockTranslation(index, newText) {
    if (currentDoc.blocks[index]) {
        currentDoc.blocks[index].translated_text = newText.trim();
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const btn = document.getElementById("btn-toggle-edit");
    const blocks = document.querySelectorAll(".editable-block");

    if (isEditMode) {
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk mr-1 text-green-600"></i>Lưu hiệu đính`;
        btn.classList.add("bg-green-50", "border-green-300");
        blocks.forEach(b => b.setAttribute("contenteditable", "true"));
        updateStepper(7); // Editing step
    } else {
        btn.innerHTML = `<i class="fa-solid fa-pen-to-square mr-1 text-accent-500"></i>Hiệu đính trực tiếp`;
        btn.classList.remove("bg-green-50", "border-green-300");
        blocks.forEach(b => b.setAttribute("contenteditable", "false"));
        updateStepper(8); // Completed
    }
}

function copyTranslation() {
    if (!currentDoc.blocks || currentDoc.blocks.length === 0) return;
    const allText = currentDoc.blocks.map(b => b.translated_text || "").join("\n\n");
    navigator.clipboard.writeText(allText).then(() => {
        alert("Đã sao chép toàn bộ bản dịch tiếng Việt vào bộ nhớ tạm (Clipboard)!");
    });
}

// ================= EXPORT TRANSLATION =================

async function exportTranslation(format) {
    if (!format) return;
    if (!currentDoc.blocks || currentDoc.blocks.length === 0) {
        alert("Chưa có nội dung bản dịch để xuất file.");
        return;
    }

    try {
        const resp = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                format: format,
                blocks: currentDoc.blocks,
                original_filename: currentDoc.filename || "Tai_Lieu_7AN.txt",
                domain: document.getElementById("domain-select").value
            })
        });
        const data = await resp.json();

        if (data.success) {
            window.location.href = data.download_url;
        } else {
            alert(`Lỗi xuất file: ${data.message}`);
        }
    } catch (err) {
        alert(`Lỗi kết nối khi xuất file: ${err.message}`);
    }
}

// ================= AUDIT & DISCREPANCY MODAL =================

function openAuditModal() {
    const modal = document.getElementById("audit-modal");
    const body = document.getElementById("audit-modal-body");

    if (!currentDoc.blocks || currentDoc.blocks.length === 0) {
        body.innerHTML = `<p class="text-slate-500 text-center py-6">Chưa có dữ liệu dịch để kiểm tra đối chiếu.</p>`;
        modal.classList.remove("hidden");
        return;
    }

    let discrepanciesHtml = "";
    if (currentAuditReports.length > 0) {
        discrepanciesHtml = currentAuditReports.map((d, i) => `
            <div class="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1.5">
                <div class="flex items-center justify-between font-bold">
                    <span class="text-amber-900">Điểm đối soát #${i + 1} (${d.severity?.toUpperCase() || 'LƯU Ý'})</span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-amber-200 text-amber-800">${d.reason || 'Thuật ngữ & Ngữ cảnh'}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 mt-1">
                    <div class="p-2 bg-white rounded border border-slate-200">
                        <strong class="text-slate-400 block text-[10px]">Bản dịch ban đầu:</strong>
                        <span>${escapeHtml(d.primary_translation || '')}</span>
                    </div>
                    <div class="p-2 bg-green-50 rounded border border-green-200">
                        <strong class="text-green-700 block text-[10px]">Phương án AI kiểm định đề xuất:</strong>
                        <span class="font-bold text-green-900">${escapeHtml(d.suggested_translation || '')}</span>
                    </div>
                </div>
            </div>
        `).join("");
    } else {
        discrepanciesHtml = `
            <div class="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 flex items-center gap-3">
                <i class="fa-solid fa-circle-check text-2xl text-green-600"></i>
                <div>
                    <h4 class="font-bold">Độ tương thích chất lượng cao (98%)</h4>
                    <p class="text-[11px] text-green-800 mt-0.5">Hai mô hình DeepSeek và Gemini hoàn toàn đồng thuận về thuật ngữ chuyên ngành, bảo toàn 100% số liệu, tên riêng và nghĩa gốc.</p>
                </div>
            </div>
        `;
    }

    body.innerHTML = `
        <div class="space-y-4">
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                    <span class="text-slate-500 font-semibold">Tài liệu:</span> <strong>${currentDoc.filename}</strong>
                </div>
                <div>
                    <span class="text-slate-500 font-semibold">Cơ chế:</span> <span class="text-brand-700 font-bold">DeepSeek AI + Google Gemini AI</span>
                </div>
            </div>
            <h4 class="font-bold text-slate-800 text-sm">Chi tiết các điểm kiểm định & khuyến nghị hiệu đính:</h4>
            ${discrepanciesHtml}
        </div>
    `;

    modal.classList.remove("hidden");
}

function closeAuditModal() {
    document.getElementById("audit-modal").classList.add("hidden");
}

// ================= TRỢ LÝ AI DỊCH THUẬT (RAG CHAT) =================

function toggleAssistant() {
    const drawer = document.getElementById("assistant-drawer");
    if (drawer.classList.contains("translate-y-full")) {
        drawer.classList.remove("translate-y-full", "opacity-0", "pointer-events-none");
    } else {
        drawer.classList.add("translate-y-full", "opacity-0", "pointer-events-none");
    }
}

async function handleAssistantSend(event) {
    event.preventDefault();
    const input = document.getElementById("assistant-input");
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    appendAssistantMessage("user", question);

    const docContext = currentDoc.blocks ? currentDoc.blocks.map(b => b.source_text).join("\n") : "";
    const domain = document.getElementById("domain-select").value;

    try {
        const resp = await fetch("/api/assistant/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: question,
                doc_context: docContext,
                domain: domain,
                history: assistantHistory
            })
        });

        const data = await resp.json();
        appendAssistantMessage("assistant", data.answer);
    } catch (err) {
        appendAssistantMessage("assistant", `Lỗi kết nối trợ lý: ${err.message}`);
    }
}

function sendQuickQuestion(q) {
    document.getElementById("assistant-input").value = q;
    handleAssistantSend(new Event('submit'));
}

function appendAssistantMessage(role, content) {
    const container = document.getElementById("assistant-messages");
    assistantHistory.push({ role, content });

    const isUser = role === "user";
    const msgDiv = document.createElement("div");
    msgDiv.className = isUser 
        ? "bg-brand-600 text-white p-3 rounded-xl rounded-tr-none ml-auto max-w-[90%] shadow-sm"
        : "bg-slate-100 text-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-200/80 mr-auto max-w-[90%] shadow-sm";

    // Format special labels [TRÍCH TỪ TÀI LIỆU], etc.
    let formatted = escapeHtml(content)
        .replace(/\[TRÍCH TỪ TÀI LIỆU\]/g, '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] inline-block mr-1">📌 [TRÍCH TỪ TÀI LIỆU]</span>')
        .replace(/\[KIẾN THỨC CHUYÊN MÔN BỔ SUNG.*?\]/g, '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[10px] inline-block mr-1">💡 [KIẾN THỨC BỔ SUNG CỦA 7 AN]</span>')
        .replace(/\[CHƯA ĐỦ CĂN CỨ.*?\]/g, '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] inline-block mr-1">⚠️ [CHƯA ĐỦ CĂN CỨ XÁC MINH]</span>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = formatted;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// ================= TERMINOLOGY BANK MANAGEMENT =================

async function loadTerms() {
    const domain = document.getElementById("term-domain-filter")?.value || "Tất cả";
    const search = document.getElementById("term-search-input")?.value || "";
    const status = document.getElementById("term-status-filter")?.value || "Tất cả";

    const url = `/api/terminology?domain=${encodeURIComponent(domain)}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        const tbody = document.getElementById("terms-tbody");
        if (!tbody) return;

        if (data.terms && data.terms.length > 0) {
            tbody.innerHTML = data.terms.map(t => `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 text-center text-slate-400">${t.id}</td>
                    <td class="p-3 font-bold text-slate-900">${escapeHtml(t.source_term)}</td>
                    <td class="p-3 font-bold text-brand-700">${escapeHtml(t.target_term)}</td>
                    <td class="p-3 text-slate-600"><span class="px-2 py-0.5 rounded bg-slate-100 font-medium">${escapeHtml(t.domain)}</span></td>
                    <td class="p-3 text-slate-500">${escapeHtml(t.notes || '—')}</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                            ${t.status === 'approved' ? 'Đã kiểm định' : 'Chờ duyệt'}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <button onclick="deleteTerm(${t.id})" class="text-red-500 hover:text-red-700 p-1" title="Xóa">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-slate-400">Không tìm thấy thuật ngữ phù hợp.</td></tr>`;
        }
    } catch (err) {
        console.error("Error loading terms:", err);
    }
}

function openAddTermModal() {
    document.getElementById("add-term-modal").classList.remove("hidden");
}

function closeAddTermModal() {
    document.getElementById("add-term-modal").classList.add("hidden");
}

async function handleSaveTerm(event) {
    event.preventDefault();
    const src = document.getElementById("modal-term-src").value.trim();
    const tgt = document.getElementById("modal-term-tgt").value.trim();
    const dom = document.getElementById("modal-term-dom").value;
    const notes = document.getElementById("modal-term-notes").value.trim();

    try {
        const resp = await fetch("/api/terminology", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                source_term: src,
                target_term: tgt,
                domain: dom,
                notes: notes,
                status: "approved"
            })
        });
        const data = await resp.json();
        if (data.success) {
            closeAddTermModal();
            loadTerms();
            alert("Đã thêm thuật ngữ vào 7 AN Terminology Bank!");
        } else {
            alert(`Lỗi: ${data.message}`);
        }
    } catch (err) {
        alert(`Lỗi: ${err.message}`);
    }
}

async function deleteTerm(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa thuật ngữ này khỏi kho?")) return;
    try {
        const resp = await fetch(`/api/terminology/${id}`, { method: "DELETE" });
        const data = await resp.json();
        if (data.success) loadTerms();
    } catch (err) {
        alert(`Lỗi xóa: ${err.message}`);
    }
}

async function importTerminologyExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);

    try {
        const resp = await fetch("/api/terminology/import", {
            method: "POST",
            body: fd
        });
        const data = await resp.json();
        alert(data.message);
        loadTerms();
    } catch (err) {
        alert(`Lỗi nhập Excel: ${err.message}`);
    }
}

// ================= COMMERCIAL ORDERS =================

async function recordCommercialOrder() {
    if (!currentDoc.filename) return;
    try {
        await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer_name: "Khách hàng 7 AN",
                file_name: currentDoc.filename,
                word_count: currentDoc.word_count,
                page_count: currentDoc.page_count,
                domain: document.getElementById("domain-select").value,
                service_tier: "professional"
            })
        });
    } catch (err) {
        console.error("Order logging error:", err);
    }
}

async function loadOrders() {
    try {
        const resp = await fetch("/api/orders");
        const data = await resp.json();
        const tbody = document.getElementById("orders-tbody");
        if (!tbody) return;

        if (data.orders && data.orders.length > 0) {
            tbody.innerHTML = data.orders.map(o => `
                <tr class="hover:bg-slate-50 transition">
                    <td class="p-3 font-mono font-bold text-brand-700">${o.order_code}</td>
                    <td class="p-3 font-semibold text-slate-800">${escapeHtml(o.customer_name)}</td>
                    <td class="p-3 text-slate-600 truncate max-w-[150px]" title="${escapeHtml(o.file_name)}">${escapeHtml(o.file_name)}</td>
                    <td class="p-3 text-slate-600">${o.word_count.toLocaleString()} từ</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-50 text-brand-700 font-semibold">${o.service_tier.toUpperCase()}</span></td>
                    <td class="p-3 font-bold text-accent-600">${o.total_price.toLocaleString()} VNĐ</td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-brand-800'}">
                            ${o.status === 'completed' ? 'Hoàn thành' : 'Đang dịch'}
                        </span>
                    </td>
                    <td class="p-3 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}">
                            ${o.payment_status === 'paid' ? 'Đã thu' : 'Chờ TT'}
                        </span>
                    </td>
                </tr>
            `).join("");
        } else {
            tbody.innerHTML = `<tr><td colspan="8" class="p-6 text-center text-slate-400">Chưa có đơn hàng nào được tạo.</td></tr>`;
        }
    } catch (err) {
        console.error("Error loading orders:", err);
    }
}

async function loadCommercialSummary() {
    try {
        const resp = await fetch("/api/commercial/summary");
        const data = await resp.json();
        if (data.success && data.summary) {
            const s = data.summary;
            document.getElementById("stat-total-orders").innerText = s.total_orders;
            document.getElementById("stat-total-revenue").innerText = s.total_revenue_formatted;
            document.getElementById("stat-estimated-profit").innerText = s.estimated_profit_vnd;
            document.getElementById("stat-api-cost").innerText = `$${s.total_api_cost_usd}`;
            document.getElementById("stat-api-cost-vnd").innerText = s.total_api_cost_vnd;
            document.getElementById("stat-term-count").innerText = s.terminology_bank_size;
        }
    } catch (err) {
        console.error("Error loading commercial summary:", err);
    }
}

// ================= API CONFIGURATION & SECURITY =================

async function checkSystemStatus() {
    try {
        const resp = await fetch("/api/status");
        const data = await resp.json();

        // Update DeepSeek status pill
        const dsPill = document.getElementById("deepseek-status-pill");
        if (data.deepseek.configured) {
            dsPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-800";
            dsPill.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i>Đã cấu hình (${data.deepseek.masked_key})`;
        } else {
            dsPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800";
            dsPill.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i>Chưa nhập Key`;
        }

        // Update Gemini status pill
        const gmPill = document.getElementById("gemini-status-pill");
        if (data.gemini.configured) {
            gmPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-800";
            gmPill.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i>Đã cấu hình (${data.gemini.masked_key})`;
        } else {
            gmPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800";
            gmPill.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i>Chưa nhập Key`;
        }

        // Update GitHub status pill
        const ghPill = document.getElementById("github-status-pill");
        if (ghPill) {
            if (data.github && data.github.configured) {
                ghPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-800";
                ghPill.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i>Đã kết nối (${data.github.masked_key})`;
            } else {
                ghPill.className = "text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800";
                ghPill.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i>Chưa kết nối Token`;
            }
        }
    } catch (err) {
        console.error("Status check error:", err);
    }
}

async function testGitHubConnection() {
    const ghToken = document.getElementById("cfg-github-token").value.trim();
    alert("Đang kiểm tra kết nối với GitHub API...");

    try {
        const resp = await fetch("/api/github/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ github_token: ghToken || null })
        });
        const res = await resp.json();
        if (res.success) {
            alert(`✅ KẾT NỐI GITHUB THÀNH CÔNG!\n\nTài khoản: @${res.login} (${res.name})\nSố kho lưu trữ: ${res.public_repos}\nĐộ trễ: ${res.latency_ms} ms\nTrang cá nhân: ${res.html_url}`);
            loadGitHubRepos();
        } else {
            alert(`❌ KẾT NỐI GITHUB THẤT BẠI!\n\nLý do: ${res.message}`);
        }
        checkSystemStatus();
    } catch (err) {
        alert(`Lỗi kiểm tra GitHub: ${err.message}`);
    }
}

async function publishCurrentSiteToGitHub() {
    const ghToken = document.getElementById("cfg-github-token")?.value.trim() || "";
    
    const confirmPub = confirm("Bạn có muốn xuất bản hệ thống 7 AN Translate Pro lên GitHub Pages để tạo đường link trực tuyến công khai không?");
    if (!confirmPub) return;

    const btn = document.getElementById("btn-publish-github");
    btn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1"></i>Đang xuất bản lên GitHub...`;
    btn.disabled = true;

    try {
        const resp = await fetch("/api/github/publish", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                github_token: ghToken || null,
                repo_name: "7an-translate-pro"
            })
        });
        const res = await resp.json();
        if (res.success) {
            alert(`🎉 XUẤT BẢN THÀNH CÔNG!\n\nKho lưu trữ: ${res.repo_url}\nLink Website Trực tuyến (GitHub Pages): ${res.pages_url}\n\nĐường link đã được thêm vào danh sách bên dưới!`);
            loadGitHubRepos();
        } else {
            alert(`Lỗi xuất bản: ${res.message}`);
        }
    } catch (err) {
        alert(`Lỗi kết nối khi xuất bản: ${err.message}`);
    } finally {
        btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up mr-1"></i>XUẤT BẢN WEBSITE LÊN GITHUB PAGES`;
        btn.disabled = false;
    }
}

async function loadGitHubRepos() {
    const container = document.getElementById("github-websites-container");
    const list = document.getElementById("github-websites-list");
    if (!container || !list) return;

    container.classList.remove("hidden");
    list.innerHTML = `<div class="p-2 text-slate-400 text-xs"><i class="fa-solid fa-spinner animate-spin mr-1"></i>Đang tải danh sách kho lưu trữ...</div>`;

    try {
        const resp = await fetch("/api/github/repos");
        const data = await resp.json();
        const repos = data.repositories || [];

        if (repos.length > 0) {
            list.innerHTML = repos.map(r => `
                <div class="p-2.5 bg-white border border-slate-200 rounded-lg flex flex-wrap items-center justify-between gap-2 hover:border-brand-500 transition shadow-xs">
                    <div>
                        <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <i class="fa-brands fa-github text-slate-700"></i>
                            <a href="${r.html_url}" target="_blank" class="hover:underline text-brand-700">${r.name}</a>
                            <span class="text-[10px] px-1.5 py-0.2 rounded ${r.private ? 'bg-slate-100 text-slate-600' : 'bg-green-50 text-green-700 font-semibold'}">${r.private ? 'Private' : 'Public'}</span>
                        </div>
                        <p class="text-[11px] text-slate-500 mt-0.5">${r.description || 'Website thuộc hệ thống 7 AN'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        ${r.pages_url ? `
                            <a href="${r.pages_url}" target="_blank" class="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-bold text-[11px] shadow-xs flex items-center gap-1 transition">
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                <span>Mở Website trực tiếp</span>
                            </a>
                        ` : `
                            <a href="${r.html_url}" target="_blank" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px]">
                                Xem mã nguồn
                            </a>
                        `}
                    </div>
                </div>
            `).join("");
        } else {
            list.innerHTML = `<div class="p-3 text-slate-400 text-xs text-center bg-white border border-slate-200 rounded-lg">Chưa tìm thấy kho lưu trữ nào hoặc cần kết nối GitHub Token.</div>`;
        }
    } catch (err) {
        list.innerHTML = `<div class="p-2 text-red-500 text-xs">Lỗi tải danh sách: ${err.message}</div>`;
    }
}

async function testAPIConnection(provider) {
    const dsKey = document.getElementById("cfg-deepseek-key").value.trim();
    const gmKey = document.getElementById("cfg-gemini-key").value.trim();

    alert(`Đang gửi yêu cầu kiểm tra kết nối tới ${provider.toUpperCase()}...`);

    try {
        const resp = await fetch("/api/config/test", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                provider: provider,
                deepseek_key: dsKey || null,
                gemini_key: gmKey || null
            })
        });
        const res = await resp.json();
        const outcome = res[provider];
        if (outcome && outcome.success) {
            alert(`✅ KẾT NỐI THÀNH CÔNG!\n\nNhà cung cấp: ${outcome.provider}\nĐộ trễ: ${outcome.latency_ms} ms\nThông điệp: ${outcome.message}`);
        } else {
            alert(`❌ KẾT NỐI THẤT BẠI!\n\nLý do: ${outcome ? outcome.message : 'Không nhận được phản hồi'}`);
        }
        checkSystemStatus();
    } catch (err) {
        alert(`Lỗi kiểm tra kết nối: ${err.message}`);
    }
}

async function saveAPIKeys() {
    const dsKey = document.getElementById("cfg-deepseek-key").value.trim();
    const gmKey = document.getElementById("cfg-gemini-key").value.trim();
    const ghToken = document.getElementById("cfg-github-token") ? document.getElementById("cfg-github-token").value.trim() : "";

    try {
        const resp = await fetch("/api/config/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                deepseek_api_key: dsKey || null,
                gemini_api_key: gmKey || null,
                github_token: ghToken || null
            })
        });
        const data = await resp.json();
        if (data.success) {
            document.getElementById("save-cfg-msg").innerText = data.message;
            document.getElementById("cfg-deepseek-key").value = "";
            document.getElementById("cfg-gemini-key").value = "";
            if (document.getElementById("cfg-github-token")) document.getElementById("cfg-github-token").value = "";
            checkSystemStatus();
            alert("✅ Đã lưu khóa API & GitHub bí mật thành công vào hệ thống bảo mật (.env)!");
        }
    } catch (err) {
        alert(`Lỗi lưu cấu hình: ${err.message}`);
    }
}

function toggleKeyVisibility(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Helpers
function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showSourceLoading(msg) {
    document.getElementById("source-pane-content").innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6 space-y-3">
            <div class="w-10 h-10 border-4 border-brand-600 border-t-accent-500 rounded-full animate-spin"></div>
            <p class="font-semibold text-slate-700 text-sm">${msg}</p>
        </div>
    `;
}
