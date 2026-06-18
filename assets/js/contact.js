/**
 * contact.js - Implements inline validation, localStorage storage, and success toasts
 */

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('form-name');
  const emailInput = document.getElementById('form-email');
  const messageInput = document.getElementById('form-message');

  const errName = document.getElementById('err-name');
  const errEmail = document.getElementById('err-email');
  const errMessage = document.getElementById('err-message');

  const successToast = document.getElementById('success-toast');

  if (!form) return;

  // Inline Validation Helper Functions
  const validateName = () => {
    const val = nameInput.value.trim();
    if (val.length < 3) {
      errName.classList.remove('hidden');
      nameInput.classList.add('border-red-500');
      nameInput.classList.remove('border-green-500');
      return false;
    } else {
      errName.classList.add('hidden');
      nameInput.classList.remove('border-red-500');
      nameInput.classList.add('border-green-500');
      return true;
    }
  };

  const validateEmail = () => {
    const val = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      errEmail.classList.remove('hidden');
      emailInput.classList.add('border-red-500');
      emailInput.classList.remove('border-green-500');
      return false;
    } else {
      errEmail.classList.add('hidden');
      emailInput.classList.remove('border-red-500');
      emailInput.classList.add('border-green-500');
      return true;
    }
  };

  const validateMessage = () => {
    const val = messageInput.value.trim();
    if (val.length < 10) {
      errMessage.classList.remove('hidden');
      messageInput.classList.add('border-red-500');
      messageInput.classList.remove('border-green-500');
      return false;
    } else {
      errMessage.classList.add('hidden');
      messageInput.classList.remove('border-red-500');
      messageInput.classList.add('border-green-500');
      return true;
    }
  };

  // Add event listeners for realtime validation on input and blur
  nameInput.addEventListener('input', validateName);
  nameInput.addEventListener('blur', validateName);

  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  messageInput.addEventListener('input', validateMessage);
  messageInput.addEventListener('blur', validateMessage);

  // Form submit handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Run all validations
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    // Block submission if any fields are invalid
    if (!isNameValid || !isEmailValid || !isMessageValid) {
      return;
    }

    // Capture Form Values
    const inquiry = {
      id: 'inquiry_' + Date.now(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
      timestamp: new Date().toISOString()
    };

    // Save to LocalStorage MVP database
    try {
      const existingInquiries = JSON.parse(localStorage.getItem('anggy_inquiries') || '[]');
      existingInquiries.push(inquiry);
      localStorage.setItem('anggy_inquiries', JSON.stringify(existingInquiries));
    } catch (err) {
      console.error('Could not save inquiry to localStorage database:', err);
    }

    // Reset Form fields and green borders
    form.reset();
    [nameInput, emailInput, messageInput].forEach(input => {
      input.classList.remove('border-green-500', 'border-red-500');
    });

    // Trigger toast notification
    if (successToast) {
      successToast.classList.add('active');

      // Hide after 4 seconds
      setTimeout(() => {
        successToast.classList.remove('active');
      }, 4000);
    }
  });
}
