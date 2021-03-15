import nodemailer from 'nodemailer'

export async function sendEmail(to: string, subject: string, html: string) {
  // let testAccount = await nodemailer.createTestAccount()
  // console.log('📝 testAccount', testAccount)

  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'mmdlwjuqf2asuesc@ethereal.email',
      pass: '4BXd4EEU2FJHdhm1YV'
    }
  })

  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>',
    to,
    subject,
    html
  })

  console.log('Message sent: %s', info.messageId)

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
