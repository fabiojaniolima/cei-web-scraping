require('dotenv/config')
const puppeteer = require('puppeteer-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')

const {
  CEI_USERNAME,
  CEI_PASSWORD,
  CEI_MAIN_URL,
  BACKGROUND_NAVIGATION,
  CAPTCHA_TOKEN,
} = process.env

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: CAPTCHA_TOKEN,
    },
    visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
  })
)

const main = async () => {
  const browser = await puppeteer.launch({ headless: BACKGROUND_NAVIGATION })
  const page = await browser.newPage()
  await page.goto(`${CEI_MAIN_URL}/login.aspx`)

  await page.waitForFunction(
    'document.querySelector("body").innerText.includes("CPF/CNPJ")'
  )

  await page.type('#ctl00_ContentPlaceHolder1_txtLogin', CEI_USERNAME)
  await page.type('#ctl00_ContentPlaceHolder1_txtSenha', CEI_PASSWORD)

  await page.solveRecaptchas()

  await Promise.all([
    page.waitForNavigation(),
    page.click('#ctl00_ContentPlaceHolder1_btnLogar'),
  ])

  await page.goto(`${CEI_MAIN_URL}/ConsultarCarteiraAtivos.aspx`)

  await page.click('#ctl00_ContentPlaceHolder1_btnConsultar')

  await Promise.all([
    page.waitForResponse(`${CEI_MAIN_URL}/ConsultarCarteiraAtivos.aspx`),
    page.click('#ctl00_ContentPlaceHolder1_btnConsultar'),
  ])

  await page.waitFor(1000)

  const result = await page.evaluate(() => {
    const columnsTitle = []
    const stocks = []

    document
      .querySelector(
        'table[id^=ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl0] thead > tr'
      )
      .querySelectorAll('th')
      .forEach(column => {
        columnsTitle.push(column.innerText)
      })

    document
      .querySelectorAll(
        'table[id^=ctl00_ContentPlaceHolder1_rptAgenteContaMercado_ctl0] tbody tr'
      )
      .forEach(stock => {
        let newObject = {}

        stock.querySelectorAll('td').forEach((value, index) => {
          newObject[columnsTitle[index]] = value.innerText
        })

        stocks.push(newObject)
      })

    return stocks
  })

  console.log(result)

  await browser.close()
}

main()
