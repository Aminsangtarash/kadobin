const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.sendcode = async (req, res) => {
    try {
        if (req.body.mobile) {
            res.status(200).send({ message: "کد ورود با موفقیت ارسال شد." })
        }

    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                username: req.body.mobile,
            },
        });

        if (!user) {
            await User.create({
                mobile: req.body.mobile,
                username: req.body.mobile
            });
        }

        const passwordIsValid = bcrypt.compareSync(
            req.body.code,
            "12345"
        );

        if (!passwordIsValid) {
            return res.status(401).send({
                message: "Invalid Password!",
            });
        }

        const token = jwt.sign({ id: user.id },
            config.secret,
            {
                algorithm: 'HS256',
                allowInsecureKeySizes: true,
                expiresIn: 86400, // 24 hours
            });

        let authorities = [];
        const roles = await user.getRoles();
        for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }

        req.session.token = token;

        return res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: authorities,
        });
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({
            message: "You've been signed out!"
        });
    } catch (err) {
        this.next(err);
    }
};