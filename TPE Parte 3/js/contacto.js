function init() {
    const values = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const contactForm = document.forms['contactForm'];
    const captcha = document.querySelector('#captchaCode');
    const captchaInput = document.querySelector('#captchaInput');

    const nameErrorDiv = document.querySelector('#name-error');
    const phoneErrorDiv = document.querySelector('#phone-error');
    const emailErrorDiv = document.querySelector('#email-error');
    const messageErrorDiv = document.querySelector('#message-error');
    const captchaErrorDiv = document.querySelector('#captcha-error');

    var captchaCode;
    var isValidCaptcha = false;

    document.querySelector('#btnSubmit').addEventListener("click", () => {
        validarInputValue(contactForm.name.value, nameErrorDiv, "nombre");
        validarInputValue(contactForm.phone.value, phoneErrorDiv, "teléfono");
        validarInputValue(contactForm.email.value, emailErrorDiv, "email");
        validarInputValue(contactForm.message.value, messageErrorDiv, "mensaje");
        validarCaptcha(captchaInput.value, captchaErrorDiv);

        if (isFormValid(contactForm.name.value, contactForm.phone.value, contactForm.email.value, contactForm.message.value)) {
            document.querySelector('#contactoFormContainer').classList.add("d-none")
            document.querySelector('#submitMessage').classList.remove("d-none")
            document.querySelector('#submitMessage').classList.add("d-flex")
        }
    });

    generateCaptcha();

    /**
     * Genera el codigo del captcha
     */
    function generateCaptcha() {
        captchaCode = "";
        for (let i = 0; i < 6; i++) {
            captchaCode += values.charAt(Math.floor(Math.random() * values.length));
        }
        captcha.innerHTML = captchaCode;
    }

    /**
     * Valida si el captcha es valido
     * 
     * @param captchaInput 
     * @param captchaErrorDiv 
     */
    function validarCaptcha(captchaInput, captchaErrorDiv) {
        if (captchaInput.length === 0) {
            captchaErrorDiv.innerHTML = "El captcha es requerido.";
            isValidCaptcha = false;
        } else if (captchaInput !== captchaCode) {
            captchaErrorDiv.innerHTML = "Código incorrecto, vuelva a intentar.";
            generateCaptcha();
            isValidCaptcha = false;
        } else {
            captchaErrorDiv.innerHTML = "";
            isValidCaptcha = true;
        }
    }

    /**
     * Valida si el input tiene valor, es caso de no tener le setea el mensaje de error al div
     * 
     * @param inputValue 
     * @param errorDiv 
     * @param campo 
     */
    function validarInputValue(inputValue, errorDiv, campo) {
        if (inputValue.length === 0) {
            errorDiv.innerHTML = "El " + campo + " es requerido."
        } else {
            errorDiv.innerHTML = "";
        }
    }

    /**
     * Valida que todos los campos del formulario sean validos
     * 
     * @param nameInputValue 
     * @param phoneInputValue 
     * @param emailInputValue 
     * @param messageInputValue 
     * @returns 
     */
    function isFormValid(nameInputValue, phoneInputValue, emailInputValue, messageInputValue) {
        return nameInputValue.length > 0 &&
            phoneInputValue.length > 0 &&
            emailInputValue.length > 0 &&
            messageInputValue.length > 0 &&
            isValidCaptcha
    }
}

init();