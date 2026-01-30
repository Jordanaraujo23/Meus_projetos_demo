import { db } from './firebase-config.js';
import { collection, query, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const targetSection = document.querySelector('.stats-hero-section');
    if (!targetSection) return;

    const container = document.createElement('div');
    container.className = 'photo-bubbles-container';
    targetSection.appendChild(container);

    const colors = ['bubble-red', 'bubble-yellow', 'bubble-green', 'bubble-blue'];
    
    try {
        // Fetch from Gallery
        const galleryQ = query(collection(db, "galeria"), limit(20));
        const gallerySnapshot = await getDocs(galleryQ);
        
        // Fetch from Projects
        const projectsQ = query(collection(db, "projetos"), limit(20));
        const projectsSnapshot = await getDocs(projectsQ);
        
        const galleryItems = [];
        
        // Process Gallery
        gallerySnapshot.forEach((doc) => {
            const data = doc.data();
            const imageUrl = data.imageUrl && data.imageUrl.startsWith('http') 
                ? data.imageUrl 
                : (data.imageUrl || '').replace('../', '');
            
            if (imageUrl) galleryItems.push(imageUrl);
        });

        // Process Projects
        projectsSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.imageUrl) {
                const url = data.imageUrl.startsWith('http') ? data.imageUrl : data.imageUrl.replace('../', '');
                galleryItems.push(url);
            }
            if (data.gallery && Array.isArray(data.gallery)) {
                data.gallery.forEach(img => {
                    const url = img.startsWith('http') ? img : img.replace('../', '');
                    galleryItems.push(url);
                });
            }
        });

        if (galleryItems.length === 0) return;

        // Shuffle and limit to amount of images, max 20 as requested
        const maxBubbles = Math.min(galleryItems.length, 20);
        const shuffled = galleryItems.sort(() => 0.5 - Math.random());
        const selectedItems = shuffled.slice(0, maxBubbles);

        selectedItems.forEach((imgUrl, index) => {
            createBubble(imgUrl, index);
        });

    } catch (error) {
        console.error("Error fetching bubbles:", error);
    }

    function createBubble(imgUrl, index) {
        const bubble = document.createElement('div');
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        bubble.className = `photo-bubble ${colorClass} interactive`;
        
        // Slightly larger bubbles for this dark section
        const size = Math.floor(Math.random() * 40) + 60;
        
        // Distribute them across the section
        const posX = Math.random() * 90 + 5;
        const posY = Math.random() * 90 + 5;
        
        // Random movement offsets for keyframes
        const mx1 = (Math.random() * 100 - 50) + "px";
        const my1 = (Math.random() * 100 - 50) + "px";
        const mx2 = (Math.random() * 100 - 50) + "px";
        const my2 = (Math.random() * 100 - 50) + "px";
        const mx3 = (Math.random() * 100 - 50) + "px";
        const my3 = (Math.random() * 100 - 50) + "px";
        
        const duration = (Math.random() * 15 + 15) + "s";
        const delay = (Math.random() * 5) + "s";

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${posX}%`;
        bubble.style.top = `${posY}%`;
        bubble.style.backgroundImage = `url(${imgUrl})`;
        bubble.style.animationDelay = delay;
        bubble.style.setProperty('--float-duration', duration);
        bubble.style.setProperty('--move-x-1', mx1);
        bubble.style.setProperty('--move-y-1', my1);
        bubble.style.setProperty('--move-x-2', mx2);
        bubble.style.setProperty('--move-y-2', my2);
        bubble.style.setProperty('--move-x-3', mx3);
        bubble.style.setProperty('--move-y-3', my3);
        
        // Increased opacity to 75% as requested
        bubble.style.opacity = "0.75";

        container.appendChild(bubble);

        // Click to go to gallery
        bubble.onclick = () => {
            window.location.href = 'galeria.html';
        };
    }
});
