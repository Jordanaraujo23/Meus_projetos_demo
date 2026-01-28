import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        console.log("Contact form JS initialized.");
        
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // Visual feedback: disable button
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

            const formData = new FormData(contactForm);
            const senderName = formData.get("senderName");
            const email = formData.get("email");
            
            const data = {
                senderName: senderName,
                email: email,
                whatsapp: formData.get("whatsapp"),
                subject: formData.get("subject"),
                message: formData.get("message"),
                status: "unread",
                createdAt: serverTimestamp()
            };

            try {
                console.log("Attempting to send message to Firestore...", data);
                await addDoc(collection(db, "fale-conosco"), data);
                
                // Beautiful success message replacement
                contactForm.innerHTML = `
                    <div class="reveal active" style="text-align: center; padding: 2rem 0; animation: fadeIn 0.5s ease;">
                        <div style="width: 80px; height: 80px; background: #dcfce7; color: #16a34a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.5rem; box-shadow: 0 10px 15px -3px rgba(22, 163, 74, 0.1);">
                            <i class="fas fa-check"></i>
                        </div>
                        <h3 style="margin-bottom: 1rem; color: var(--secondary);">Mensagem Enviada!</h3>
                        <p style="color: var(--text-light); margin-bottom: 2rem; line-height: 1.6;">
                            Obrigado pelo seu contato, <strong>${senderName}</strong>.<br>
                            Nossa equipe retornará em breve no e-mail <strong>${email}</strong>.
                        </p>
                        <button onclick="window.location.reload()" class="btn btn-outline btn-sm">Enviar outra mensagem</button>
                    </div>
                `;
                
                // Scroll to the message
                contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                console.log("Message sent successfully!");
            } catch (error) {
                console.error("Erro ao enviar para Firebase:", error);
                
                // Error message without replacing the form
                const errorMsg = document.createElement("div");
                errorMsg.style.color = "#ef4444";
                errorMsg.style.background = "#fef2f2";
                errorMsg.style.padding = "1rem";
                errorMsg.style.borderRadius = "var(--radius-sm)";
                errorMsg.style.marginTop = "1rem";
                errorMsg.style.fontSize = "0.9rem";
                errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i> Erro ao enviar: ${error.message}. Por favor, tente novamente ou use nosso WhatsApp.`;
                
                // Remove previous error if any
                const prevError = contactForm.querySelector('.error-feedback');
                if (prevError) prevError.remove();
                
                errorMsg.className = 'error-feedback';
                contactForm.appendChild(errorMsg);
                
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }
});
