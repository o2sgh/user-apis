import { body } from 'express-validator';

const authValidator = {
    signupValidator: [
        body('email').isLength({ min: 8 })
            .withMessage('email is required').isEmail().withMessage('Invalid email address'),
        body('userName').notEmpty().withMessage('name is required'),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'g')
            .withMessage('Password must contain at least one lower, one upper, one digit, and one special character'),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ],
    loginValidator: [
        body('email').notEmpty()
            .withMessage('email is required').isEmail().withMessage('Invalid email address'),
        body('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    ],
    verifyEmailValidator: [
        body('encryptedToken').notEmpty()
            .withMessage('Token is required'),
    ],
    googleLoginValidator: [
        body('token').notEmpty()
            .withMessage('Token is required'),
    ],
    updateProfileValidator: [
        body('userName').notEmpty()
            .withMessage('name is required'),
    ],
    resetPasswordValidator: [
        body('oldPassword').notEmpty().withMessage('Old password is required'),
        body('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 'g')
            .withMessage('Password must contain at least one lower, one upper, one digit, and one special character'),
        body('reEnterPassword').notEmpty().withMessage('please re-enter password').custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),
    ]
};

export default authValidator;