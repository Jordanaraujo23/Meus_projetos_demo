/* ============================================
   EDITAIS - PREMIUM INTERACTIONS
   Tabs, filtros e preview de documentos
   ============================================ */

// ===== DOCUMENTS DATA =====
const documentsData = {
    editais: [
        { id: 1, title: 'Edital de Fomento 2026', type: 'PDF', date: '2026-01-15', size: '2.5 MB', description: 'Edital para captação de recursos públicos' },
        { id: 2, title: 'Chamada Pública - Voluntários', type: 'PDF', date: '2026-01-10', size: '1.8 MB', description: 'Processo seletivo para voluntários' }
    ],
    prestacao: [
        { id: 3, title: 'Relatório Anual 2025', type: 'PDF', date: '2025-12-31', size: '5.2 MB', description: 'Prestação de contas do exercício 2025' },
        { id: 4, title: 'Balanço Financeiro Q4', type: 'PDF', date: '2025-12-31', size: '3.1 MB', description: 'Demonstrativo financeiro do 4º trimestre' }
    ],
    documentos: [
        { id: 5, title: 'Estatuto Social', type: 'PDF', date: '2024-06-15', size: '1.2 MB', description: 'Estatuto atualizado da organização' },
        { id: 6, title: 'CNPJ e Certificados', type: 'PDF', date: '2024-01-10', size: '800 KB', description: 'Documentação legal da instituição' }
    ]
};

let currentTab = 'editais';

// ===== TAB NAVIGATION =====
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Render documents
    renderDocuments(tabName);
}

// ===== RENDER DOCUMENTS =====
function renderDocuments(category) {
    const container = document.querySelector(`[data-tab="${category}"] .documents-grid`);
    if (!container) return;
    
    const docs = documentsData[category] || [];
    
    container.innerHTML = docs.map(doc => `
        <div class="document-card">
            <div class="document-preview">
                <i class="fas fa-file-pdf"></i>
                <span class="document-type">${doc.type}</span>
            </div>
            <div class="document-content">
                <h3 class="document-title">${doc.title}</h3>
                <div class="document-meta">
                    <span class="meta-item">
                        <i class="far fa-calendar"></i>
                        ${formatDate(doc.date)}
                    </span>
                    <span class="meta-item">
                        <i class="fas fa-file"></i>
                        ${doc.size}
                    </span>
                </div>
                <p class="document-description">${doc.description}</p>
                <div class="document-actions">
                    <button class="doc-btn doc-btn-primary" onclick="downloadDocument(${doc.id})">
                        <i class="fas fa-download"></i>
                        Baixar
                    </button>
                    <button class="doc-btn doc-btn-outline" onclick="previewDocument(${doc.id})">
                        <i class="fas fa-eye"></i>
                        Visualizar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== DOCUMENT ACTIONS =====
function downloadDocument(id) {
    console.log('Baixando documento:', id);
    alert('Download iniciado! (Simulação)');
}

function previewDocument(id) {
    console.log('Visualizando documento:', id);
    alert('Abrindo visualização... (Simulação)');
}

// ===== FILTERS =====
function filterDocuments() {
    const year = document.querySelector('[name="year"]')?.value;
    const type = document.querySelector('[name="type"]')?.value;
    
    console.log('Filtrando:', { year, type });
    
    // Apply filters (simulation)
    renderDocuments(currentTab);
}

function searchDocuments(query) {
    console.log('Buscando:', query);
    
    // Apply search (simulation)
    if (query.length > 2) {
        renderDocuments(currentTab);
    }
}

// ===== HELPER FUNCTIONS =====
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Editais Premium...');
    
    // Render initial documents
    Object.keys(documentsData).forEach(category => {
        renderDocuments(category);
    });
    
    // Add search listener
    const searchInput = document.querySelector('.search-documents input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchDocuments(e.target.value);
        });
    }
    
    console.log('✅ Editais Premium carregado!');
});

// ===== EXPORT =====
window.EditaisPremium = {
    switchTab,
    downloadDocument,
    previewDocument,
    filterDocuments
};
