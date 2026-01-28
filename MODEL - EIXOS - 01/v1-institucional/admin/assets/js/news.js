import { db, storage } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, addDoc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { initCommon } from './admin-common.js';

initCommon();

const newsTable = document.getElementById('news-table')?.querySelector('tbody');
if (newsTable) {
    const q = query(collection(db, "noticias"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        newsTable.innerHTML = '';
        if (snapshot.empty) {
            newsTable.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:2rem;">Nenhuma notícia encontrada.</td></tr>';
            return;
        }
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('pt-BR') : 'Recente';
            const row = `
                <tr>
                    <td><strong>${data.title}</strong></td>
                    <td><span class="status-badge active">${data.category || 'Geral'}</span></td>
                    <td>${date}</td>
                    <td>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-action btn-edit" onclick="editNews('${docSnap.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                            <button class="btn-action btn-delete" onclick="deleteNews('${docSnap.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
            newsTable.insertAdjacentHTML('beforeend', row);
        });
    });
}

window.deleteNews = async (id) => {
    if (confirm('Deseja realmente excluir esta notícia? Esta ação não pode ser desfeita.')) {
        try { 
            await deleteDoc(doc(db, "noticias", id)); 
            alert('Notícia excluída com sucesso!');
        }
        catch (error) { 
            console.error(error); 
            alert('Erro ao excluir notícia.');
        }
    }
};

window.editNews = async (id) => {
    try {
        const docRef = doc(db, "noticias", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            const form = document.getElementById('form-new-news');
            const modal = document.getElementById('modal-new-news');
            
            // Populate form
            document.getElementById('news-id').value = id;
            form.news_title.value = data.title;
            form.news_category.value = data.category || 'Geral';
            form.news_excerpt.value = data.excerpt || '';
            form.news_content.value = data.content || '';
            
            // Handle image preview
            if (data.imageUrl) {
                previewImg.src = data.imageUrl;
                imagePreview.style.display = 'block';
            }

            // Change modal title and button text
            modal.querySelector('h3').innerHTML = '<i class="fas fa-edit"></i> Editar Notícia';
            btnSaveNews.innerText = 'Salvar Alterações';
            
            window.openModal('modal-new-news');
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar dados da notícia.');
    }
};

// New News Submission
const btnSaveNews = document.getElementById('btn-save-news');
if (btnSaveNews) {
    btnSaveNews.addEventListener('click', async () => {
        const form = document.getElementById('form-new-news');
        const formData = new FormData(form);
        const imageFile = formData.get('news_image_file');
        const newsId = formData.get('news_id');
        
        const newsData = {
            title: formData.get('news_title'),
            category: formData.get('news_category'),
            excerpt: formData.get('news_excerpt'),
            content: formData.get('news_content'),
            updatedAt: new Date()
        };

        if (!newsId) {
            newsData.createdAt = new Date();
            newsData.imageUrl = '../assets/img/news-hero.png'; // Default for new news
        }

        if (!newsData.title) {
            alert('Por favor, insira um título.');
            return;
        }

        btnSaveNews.disabled = true;
        btnSaveNews.innerText = 'Salvando...';

        try {
            // Upload image to Storage if selected
            if (imageFile && imageFile.size > 0) {
                const storageRef = ref(storage, `noticias/${Date.now()}_${imageFile.name}`);
                const uploadResult = await uploadBytes(storageRef, imageFile);
                newsData.imageUrl = await getDownloadURL(uploadResult.ref);
            }

            if (newsId) {
                await updateDoc(doc(db, "noticias", newsId), newsData);
                alert('Notícia atualizada com sucesso!');
            } else {
                await addDoc(collection(db, "noticias"), newsData);
                alert('Notícia publicada com sucesso!');
            }
            
            window.closeModal('modal-new-news');
            resetNewNewsForm();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar notícia: ' + error.message);
        } finally {
            btnSaveNews.disabled = false;
            btnSaveNews.innerText = newsId ? 'Salvar Alterações' : 'Publicar Notícia';
        }
    });
}

// Preview handling
const newsImageInput = document.getElementById('news-image-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = imagePreview?.querySelector('img');

const fileUploadBtn = document.querySelector('.file-upload-btn span');

if (newsImageInput) {
    newsImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && previewImg) {
            // Update button text
            if (fileUploadBtn) fileUploadBtn.innerText = `Arquivo: ${file.name}`;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                previewImg.src = event.target.result;
                imagePreview.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else if (imagePreview) {
            imagePreview.style.display = 'none';
            if (fileUploadBtn) fileUploadBtn.innerText = 'Clique ou arraste a imagem para selecionar';
        }
    });
}

// Reset function
function resetNewNewsForm() {
    const form = document.getElementById('form-new-news');
    const modal = document.getElementById('modal-new-news');
    if (form) {
        form.reset();
        document.getElementById('news-id').value = '';
        if (imagePreview) imagePreview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (fileUploadBtn) fileUploadBtn.innerText = 'Clique ou arraste a imagem para selecionar';
        
        // Reset modal strings
        if (modal) {
            modal.querySelector('h3').innerHTML = 'Publicar Nova Notícia';
            btnSaveNews.innerText = 'Publicar Notícia';
        }
    }
}

