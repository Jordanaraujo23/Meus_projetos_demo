/* ============================================
   FALE CONOSCO - PREMIUM INTERACTIONS
   Validação de formulário e envio
   ============================================ */

// ===== FORM VALIDATION =====
function validateField(field) {
    const value = field.value.trim();
    const type = field.getAttribute('type') || field.tagName.toLowerCase();
    
    let isValid = true;
    let errorMessage = '';
    
    // Check if required
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório';
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'E-mail inválido';
        }
    }
    
    // Phone validation
    if (field.name === 'phone' && value) {
        const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Telefone inválido';
        }
    }
    
    // Update UI
    updateFieldUI(field, isValid, errorMessage);
    
    return isValid;
}

function updateFieldUI(field, isValid, errorMessage) {
    const errorElement = field.parentElement.querySelector('.error-message');
    const successElement = field.parentElement.querySelector('.success-message');
    
    field.classList.remove('error', 'success');
    
    if (errorElement) {
        errorElement.classList.remove('show');
    }
    if (successElement) {
        successElement.classList.remove('show');
    }
    
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }
    } else if (field.value.trim()) {
        field.classList.add('success');
        if (successElement) {
            successElement.classList.add('show');
        }
    }
}

// ===== FORM SUBMISSION =====
async function submitContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const fields = form.querySelectorAll('input, textarea, select');
    
    // Validate all fields
    let isFormValid = true;
    fields.forEach(field => {
        if (!validateField(field)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        return;
    }
    
    // Show loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Collect form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    console.log('Enviando mensagem:', data);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success
    showSuccessMessage();
    
    // Reset form
    form.reset();
    fields.forEach(field => {
        field.classList.remove('error', 'success');
    });
    
    // Hide loading
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
}

function showSuccessMessage() {
    const container = document.querySelector('.contact-form-container');
    
    const successHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--accent-green), var(--primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; animation: scaleIn 0.5s ease;">
                <i class="fas fa-check" style="font-size: 3rem; color: white;"></i>
            </div>
            <h3 style="color: var(--secondary); margin-bottom: 1rem;">Mensagem Enviada!</h3>
            <p style="color: var(--text-light); margin-bottom: 2rem;">
                Recebemos sua mensagem e entraremos em contato em breve.
            </p>
            <button onclick="location.reload()" class="btn btn-primary">
                Enviar Nova Mensagem
            </button>
        </div>
    `;
    
    container.innerHTML = successHTML;
}

// ===== PHONE MASK =====
function phoneMask(value) {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Fale Conosco Premium...');
    
    // Add validation listeners
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', submitContactForm);
        
        const fields = form.querySelectorAll('input, textarea, select');
        fields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    validateField(field);
                }
            });
        });
        
        // Phone mask
        const phoneField = form.querySelector('[name="phone"]');
        if (phoneField) {
            phoneField.addEventListener('input', (e) => {
                e.target.value = phoneMask(e.target.value);
            });
        }
    }
    
    console.log('✅ Fale Conosco Premium carregado!');
});

// ===== EXPORT =====
window.FaleConoscoPremium = {
    validateField,
    submitContactForm
};
