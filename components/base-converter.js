class BaseConverter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = /*component template*/ `
            <style>
                #form-container {
                    font-size: 1rem;
                }
                form input {
                    display: inline;
                    margin: 0.2rem;
                }
                .info {
                    font-size: 1.5rem;
                }
                .warning {
                    color: orange;
                }
                .error {
                    color: red;
                }
            </style>
            <div id="form-container">
                <form>
                    <label for="digit">Convert</label>
                    <input type="text" name="digit" size="4" maxlength="255" />
                    <label for="base-from">from</label>
                    <input type="text" name="base-from" size="2" maxlength="2" />
                    <label for="base-to">to</label>
                    <input type="text" name="base-to" size="2" maxlength="2" />
                    <button type="button" id="submit">Convert</button>
                </form>
                <div id="msg-placeholder" role="alert" aria-live=""assertive />
            </div>
        `;
    }
  
    connectedCallback() {
        this._submitButton = this.shadowRoot.querySelector("#submit");
        this._messagePlaceholder = this.shadowRoot.querySelector("#msg-placeholder");
        
        // Add event listeners to our button element
        this._submitButton.addEventListener("click", this._convertDigit.bind(this));
        console.log("Event bound 😎");
    }
  
    disconnectedCallback() {
        this._formSubmitButton.removeEventListener("click", this._convertDigit);
        console.log("Listener cleaned 😊");
    }
  
    _displayMessage(messageText, messageType) {
        const validMessageTypes = ["error", "warning", "info"];
        this._message = document.createElement("div");
        this._message.innerText = messageText;
        this._message.className = validMessageTypes.includes(messageType) ? messageType : "info";

        this._messagePlaceholder.append(this._message);
    }

    _cleanPlaceholder() {
        this._messagePlaceholder.innerHTML = null;
    }
  
    _validateNumberPerBase(num, base) {
        if (!num || !base) return false;
        const reg = /^\d+$/;
        if (!reg.test(num) || !reg.test(base)) return false;
        const n = num.split('');
        for(let i=0; i<n.length; i++) {
            if (n[i] >= base) return false;
        }
        return true;
    }

    _verifyBase(num) {
        return new Promise((resolve, reject)  => {
            if (!Number.isNaN(num) && (num >= 2 && num <=10)) resolve(num);
            else reject(`Invalid base ${num}`);
        });
    }

    _verifyNumber(num, base) {
        return new Promise((resolve, reject)  => {
            if (!Number.isNaN(num) && this._validateNumberPerBase(num+"", base)) resolve(num);
            else reject("Invalid number per base");
        });
    }

    _convertBase = function (num) {
        return {
            from : function (baseFrom) {
                return {
                    to : function (baseTo) {
                        return parseInt(num, baseFrom).toString(baseTo);
                    }
                };
            }
        };
    };

    async _convertDigit() {
        this._cleanPlaceholder();
        this._form = this.shadowRoot.querySelector("form");

        try {
            const f = await this._verifyBase(+this._form.elements["base-from"].value);
            const t = await this._verifyBase(+this._form.elements["base-to"].value);
            const d = await this._verifyNumber(+this._form.elements["digit"].value, +this._form.elements["base-from"].value);
            
            const result = this._convertBase(d).from(f).to(t)
            this._displayMessage(`Result value: ${result}`);
        } catch (e) { 
            this._displayMessage(e, "error");
        }
    }
}
  
customElements.define("base-converter", BaseConverter);