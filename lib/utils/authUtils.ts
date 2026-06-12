export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function checkPassword(password: string) {


    if (!passwordRegex.test(password)) {
        return "Password must be at least 8 characters and contain uppercase, lowercase, and a number.";

    }
    return ""

}

export function checkEmail(email: string) {
    if (!email) {
        return "Email is required";
    }
    if (!emailRegex.test(email)) {
        return "Email is invalid";
    }
    return ""
}