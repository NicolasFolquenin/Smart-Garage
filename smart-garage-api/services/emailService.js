const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false, // true porque você está usando a porta 465 no .env
    auth: {
        user: process.env.EMAIL_USER,
        pass: (process.env.EMAIL_PASS || '').replace(/\s/g, ''), // Garante que espaços copiados sem querer sejam removidos
    },
});

const enviarEmailResetSenha = async (destinatario, token) => {
    // Monta o link dinamicamente usando a variável do .env
    const resetUrl = `${process.env.FRONTEND_URL}/resetar-senha/${token}`;

    const mailOptions = {
        from: `"Smart Garage" <${process.env.EMAIL_USER}>`,
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