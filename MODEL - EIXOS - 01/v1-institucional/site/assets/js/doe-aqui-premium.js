/* ============================================
   DOE AQUI - PREMIUM INTERACTIONS
   Multi-step form, validação e animações
   ============================================ */

let currentStep = 1;
const totalSteps = 4;
let formData = {
    amount: null,
    frequency: 'once',
    paymentMethod: null,
    personalInfo: {}
};

// ===== STEP NAVIGATION =====
function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    
    // Hide current step
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show new step
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
    
    // Update progress
    updateProgress(step);
    
    currentStep = step;
}

function nextStep() {
    if (validateCurrentStep()) {
        goToStep(currentStep + 1);
    }
}

function prevStep() {
    goToStep(currentStep - 1);
}

function updateProgress(step) {
    // Update circles
    document.querySelectorAll('.form-step').forEach((el, index) => {
        el.classList.remove('active', 'completed');
        if (index + 1 < step) {
            el.classList.add('completed');
        } else if (index + 1 === step) {
            el.classList.add('active');
        }
    });
    
    // Update progress line
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    document.querySelector('.progress-line').style.width = `${progress}%`;
}

// ===== AMOUNT SELECTION =====
function selectAmount(amount) {
    formData.amount = amount;
    
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    event.target.classList.add('selected');
    
    // Clear custom amount
    document.querySelector('.custom-amount').value = '';
    
    updateImpactPreview(amount);
}

function setCustomAmount(value) {
    formData.amount = parseFloat(value);
    
    document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    updateImpactPreview(value);
}

function updateImpactPreview(amount) {
    const preview = document.querySelector('.impact-preview');
    if (!preview) return;
    
    let impact = '';
    
    if (amount >= 500) {
        impact = '🎯 Pode ajudar 10 famílias com cestas básicas completas';
    } else if (amount >= 200) {
        impact = '🏥 Pode custear 5 consultas médicas';
    } else if (amount >= 100) {
        impact = '📚 Pode fornecer material escolar para 3 crianças';
    } else if (amount >= 50) {
        impact = '🍽️ Pode alimentar 2 famílias por uma semana';
    } else {
        impact = '💝 Toda contribuição faz diferença!';
    }
    
    preview.innerHTML = `
        <h4>Seu Impacto</h4>
        <div class="impact-items">
            <div class="impact-item">
                <i class="fas fa-check-circle"></i>
                <span>${impact}</span>
            </div>
        </div>
    `;
}

// ===== PAYMENT METHOD =====
function selectPaymentMethod(method) {
    formData.paymentMethod = method;
    
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    event.target.closest('.payment-method').classList.add('selected');
}

// ===== VALIDATION =====
function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            if (!formData.amount || formData.amount <= 0) {
                alert('Por favor, selecione ou digite um valor para doar.');
                return false;
            }
            return true;
            
        case 2:
            if (!formData.paymentMethod) {
                alert('Por favor, selecione uma forma de pagamento.');
                return false;
            }
            return true;
            
        case 3:
            const name = document.querySelector('[name="name"]').value;
            const email = document.querySelector('[name="email"]').value;
            const phone = document.querySelector('[name="phone"]').value;
            
            if (!name || !email || !phone) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return false;
            }
            
            formData.personalInfo = { name, email, phone };
            return true;
            
        default:
            return true;
    }
}

// ===== SUBMIT =====
function submitDonation() {
    console.log('Doação enviada:', formData);
    
    // Show success message
    document.querySelector('.form-content').innerHTML = `
        <div style="text-align: center; padding: 3rem;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, var(--accent-green), var(--primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; animation: scaleIn 0.5s ease;">
                <i class="fas fa-check" style="font-size: 3rem; color: white;"></i>
            </div>
            <h2 style="color: var(--secondary); margin-bottom: 1rem;">Doação Confirmada!</h2>
            <p style="color: var(--text-light); font-size: 1.1rem; margin-bottom: 2rem;">
                Obrigado por contribuir com R$ ${formData.amount.toFixed(2)}!<br>
                Você receberá um e-mail de confirmação em breve.
            </p>
            <button onclick="location.reload()" class="btn btn-primary">
                Fazer Nova Doação
            </button>
        </div>
    `;
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Doe Aqui Premium...');
    
    updateProgress(1);
    
    console.log('✅ Doe Aqui Premium carregado!');
});

// ===== EXPORT =====
window.DoeAquiPremium = {
    goToStep,
    nextStep,
    prevStep,
    selectAmount,
    setCustomAmount,
    selectPaymentMethod,
    submitDonation
};
