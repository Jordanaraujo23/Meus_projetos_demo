import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const galleryMasonry = document.querySelector('.gallery-masonry');
    let galleryData = [];

    if (galleryMasonry) {
        // Fetch all first, we can sort locally if needed to be safe
        const q = query(collection(db, "galeria"), orderBy("createdAt", "desc"));
        
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                galleryMasonry.innerHTML = '<p class="text-center w-100 py-5 text-muted">A galeria será atualizada em breve.</p>';
                return;
            }

            galleryMasonry.innerHTML = '';
            galleryData = [];

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Only replace relative paths, don't touch full https URLs
                const imageUrl = data.imageUrl && data.imageUrl.startsWith('http') 
                    ? data.imageUrl 
                    : (data.imageUrl || '').replace('../', '');
                
                const dateValue = data.createdAt;
                let dateStr = '';
                if (dateValue) {
                    if (dateValue.toDate) dateStr = dateValue.toDate().toLocaleDateString('pt-BR');
                    else if (dateValue instanceof Date) dateStr = dateValue.toLocaleDateString('pt-BR');
                    else dateStr = new Date(dateValue).toLocaleDateString('pt-BR');
                }

                galleryData.push({
                    src: imageUrl,
                    title: data.title || 'Galeria',
                    caption: data.description || dateStr
                });

                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `
                    <img src="${imageUrl}" alt="${data.title || 'Foto'}" loading="lazy">
                    <div class="gallery-overlay">
                        <h4>${data.title || 'Galeria'}</h4>
                        <p>${data.description || dateStr}</p>
                    </div>
                `;
                
                const currentIndex = galleryData.length - 1;
                item.onclick = () => {
                     if (window.openLightbox) {
                         // Lightbox logic in gallery.js usually takes src, title, caption
                         // But index and data array is better for prev/next
                         const img = galleryData[currentIndex];
                         window.openLightbox(img.src, img.title, img.caption);
                     }
                };

                galleryMasonry.appendChild(item);
            });
        });
    }
});
