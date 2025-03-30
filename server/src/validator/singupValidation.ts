import { body } from "express-validator";

export const singupValidate = [
    // Name validation: Should allow letters, spaces, and apostrophes (for names like O'Neill), with a minimum of 3 characters
    body("username")
        .isLength({ min: 3 })
        .withMessage("username must be at least 3 characters long"),

    // Email validation: More complex email format validation (e.g., no special characters or consecutive dots)
    body("email")
        .isEmail()
        .withMessage("Invalid email address")
        .matches(/^(?!.*\.\.)(?!.*@.*@)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/) // More restrictive email pattern
        .withMessage("Email must follow a valid pattern (e.g., example@domain.com)"),

    // Password validation: Require at least one lowercase letter, one uppercase letter, one digit, and a special character
    body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]|:;,.<>?~`/-]).+$/) // Require upper, lower, number, special char
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),

    // Confirm Password validation: Ensure it matches the password field
    body("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password and confirm password do not match");
        }
        return true;
    }),
];
