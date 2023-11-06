import { Table, Column, Model, DataType } from 'sequelize-typescript';
import sequelize from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
@Table({
    modelName: 'User',
    defaultScope: {
        attributes: { exclude: ["password", "emailVerificationLink", "emailVerificationLinkExpiredAt"] },
    },
    scopes: {
        withSecretColumns: {
            attributes: { include: ["password", "emailVerificationLink", "emailVerificationLinkExpiredAt"] },
        },
    }
})
class User extends Model<User> {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    userName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Must be a valid email address",
            }
        }
    })
    email: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    password: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    googleId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    emailVerificationLink: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    emailVerificationLinkExpiredAt: Date;

    @Column({
        type: DataType.DATE,
    })
    lastLoginAt: Date;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isProfileCompleted: boolean;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    emailVerified: boolean;

    @Column({
        type: DataType.NUMBER,
    })
    totalNumberOfLogin: number;

    // Static method to authenticate a user
    static async authenticate(email: string, password: string) {
        const user = await User.scope('withSecretColumns').findOne({
            where: {
                email,
            },
        });
        if (!user || !user.password) {
            return {
                status: false,
                message: 'No user found with this email',
            };
        }
        const passwordCompared = await bcrypt.compare(password, user.password);
        if (passwordCompared) {
            return {
                status: true,
                data: user,
            };
        }
        return {
            status: false,
            message: 'Password incorrect',
        };
    }

    generateToken(): string {
        const userId = this.id;
        const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return token;
    }
}
sequelize.addModels([User])
export { User }