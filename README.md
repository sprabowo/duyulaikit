# Duyulaikit

Duyulaikit is a self hosted backend service for [Lyket](https://lyket.dev/). if you want to use Lyket service in paid version, i highly recommend it. this is experimental and purpose for fun only, you can use it in your personal website / blog. It's free

## Technologies

- [Vercel](https://vercel.com)
- [Cloud Local Storage](https://cls.tools/)

## Usage

Setup your storage using Cloud Local Storage

```sh
npm install -g cloud-local-storage-cli
cls init # do registration by type email and password
cat ~/.clsrc # save your CLS_TOKEN
cls set
# ? Type a key for your storage (leave empty to name it automatically):
# [type enter]
# ? Type the data you would like to save:
# { "demo": { "updown_button": [], "clap_button": [], "like_button": [], "user": [] } }
# save your CLS_KEY
openssl rand -base64 32 # generate api key with randomize
# save your API_KEY
```

Clone & Deploy in Vercel

```sh
git clone https://github.com/sprabowo/duyulaikit
npm i -g vercel
vercel deploy
# don't forget to setup Environtment Variable through vercel.com
# use the same key value like in .env.example
```

Embed lyket widget on website

```html
<!-- If you want to use twitter like style -->
<!-- data-lyket-id and data-lyket-namespace is required -->
<div
	data-lyket-type="like"
	data-lyket-id="your-blog-post-1-slug"
	data-lyket-template="twitter"
	data-lyket-namespace="demo"
></div>

<!-- simple like style -->
<div
	data-lyket-type="like"
	data-lyket-id="your-blog-post-2-slug"
	data-lyket-template="simple"
	data-lyket-namespace="demo"
></div>

<!-- simple clap style -->
<div
	data-lyket-type="clap"
	data-lyket-id="your-blog-post-3-slug"
	data-lyket-template="simple"
	data-lyket-namespace="demo"
></div>

<!-- medium clap style -->
<div
	data-lyket-type="clap"
	data-lyket-id="your-blog-post-4-slug"
	data-lyket-template="medium"
	data-lyket-namespace="demo"
></div>

<!-- simple updown vote style -->
<div
	data-lyket-type="updown"
	data-lyket-id="your-blog-post-5-slug"
	data-lyket-template="simple"
	data-lyket-namespace="demo"
></div>

<!-- reddit updown vote style -->
<div
	data-lyket-type="updown"
	data-lyket-id="your-blog-post-6-slug"
	data-lyket-template="reddit"
	data-lyket-namespace="demo"
></div>

<script src="https://unpkg.com/@lyket/widget@1.3.5/dist/lyket.js?apiKey=API_KEY&baseUrl=https://yourdomain.vercel.app/api"></script>
```

## Support
<a href="https://karyakarsa.com/sprabowo/tip" target="_blank"><img src="https://upload.karyakarsa.com/api/qrcode?url=sprabowo%2Ftip&size=200" alt="Karya Karsa" width="150px"></a>  <a href="https://www.buymeacoffee.com/sprabowo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" width="150px" height="auto"></a>