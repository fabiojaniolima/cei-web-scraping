const puppeteer = require('puppeteer')

const main = async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto('https://cei.b3.com.br/CEI_Responsivo/login.aspx')

  await page.waitFor(1000)

  await page.type('#ctl00_ContentPlaceHolder1_txtLogin', '12345678')
  await page.type('#ctl00_ContentPlaceHolder1_txtSenha', 'minha_senha')

  await page.waitFor(3000)

  await browser.close()
}

main()
