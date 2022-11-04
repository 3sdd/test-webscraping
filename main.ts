
import puppeteer from "puppeteer"
import fs from "fs"

async function main(){
    console.log("hi")

    // ブラウザ起動
    // headless:falseにするとブラウザが表示される。 trueではブラウザは見えなくなる
    const b=await puppeteer.launch({
        headless:false,
    })
    // secret mode
    // https://github.com/puppeteer/puppeteer/issues/4400#issuecomment-647009247
    const browser=await b.createIncognitoBrowserContext()

    // 新規ページ
    const page=await browser.newPage()
    // URLへ移動
    await page.goto('https://developers.google.com/web/')



    // 画像保存
    const targetSelector="figure.devsite-landing-row-item-image img"
    await page.waitForSelector(targetSelector)

    const srcList=await page.evaluate((selector)=>{
        const srcList=[...document.querySelectorAll(selector)].map(img=>img.getAttribute('src'))
        return srcList
    },targetSelector)

    for(const [index,src] of Object.entries(srcList)){
        console.log(index,src)
        if(!src){
            continue
        }
        // ファイルのbuffer取得
        const newPage=await browser.newPage()
        const viewSource= await newPage.goto(src)
        const file=await viewSource?.buffer()
        // 保存する
        if(file){
            const filename=`image-${index}.png`
            await fs.promises.writeFile(filename,file)
        }
        await newPage.close()
    }

    // スクリーンショットを撮る
    await page.screenshot({
        path:'ss.png'
    })



    // ブラウザ閉じる
    await browser.close()
}


main()