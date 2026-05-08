import { message } from "antd";

let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

window.isEmail = (email) => emailRegex.test(email)

window.getRandomId = ()=> Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)

window.notify = (text, type) => {
    switch (type) {
        case "success":
            message.success(text)
            break;
        case "error":
            message.error(text)
            break;
        case "info":
            message.info(text)
            break;
        case "warning":
            message.warning(text)
            break;
        default:
            message.info(text)
    }
}