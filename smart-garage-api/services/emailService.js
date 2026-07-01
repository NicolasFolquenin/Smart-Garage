const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const enviarEmailResetSenha = async (destinatario, token) => {
    const resetUrl = `http://localhost:5173/resetar-senha/${token}`;

    const mailOptions = {
        from: '"Smart Garage" <seu-email@exemplo.com>',
        to: destinatario,
        subject: 'Redefinição de Senha - Smart Garage',
        html: `
            <p>Você solicitou a redefinição da sua senha.</p>
            <p>Clique no link a seguir para criar uma nova senha:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
        `,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { enviarEmailResetSenha };