const DISCORD_TOKEN = "<insert-your-discord-token-here>"

function sendNotification(type, msg) {
  const notifications = document.querySelector(".notifications")
  const notif = document.createElement("div")
  notif.className = `notification ${type}`
  notif.textContent = msg
  notifications.appendChild(notif)
  setTimeout(() => {
    notifications.removeChild(notif)
  }, 6000);
}

class Display {
  static scrollThreshold = 120
  #columns = []
  #images = []

  constructor(columnCount) {
    this.ref = document.querySelector("#display")
    this.html = document.querySelector("html")
    this.#recalculateColumns(columnCount)

    document.addEventListener("scroll", this.checkScrollBottom.bind(this))
  }

  set columnCount(newValue) {
    this.#recalculateColumns(newValue)
  }

  #recalculateColumns(columnCount) {
    this.#images.forEach(i => i.remove())
    Array.from(this.ref.children).forEach(c => c.remove())

    this.#columns = Array.from({ length: columnCount }).fill(0).map(() => {
      const e = document.createElement("div")
      e.className = "column"
      return e
    })
    this.#columns.forEach(e => this.ref.appendChild(e))
    this.#images.forEach(i => this.#appendToColumn(i))
    this.checkScrollBottom()
  }

  #convertImageSize(imageWidth, imageHeight) {
    const columnWidth = this.#columns[0].clientWidth
    const width = columnWidth;
    const height = parseInt(imageHeight / (imageWidth / width));
    return { width, height }
  }

  #appendToColumn(image) {
    const { width, height } = this.#convertImageSize(image.width, image.height)
    image.width = width
    image.height = height
    image.src = `${image.src.split("?")[0]}?width=${width}&height=${height}`;

    this.#getShortestColumn().appendChild(image)
  }

  #getShortestColumn() {
    return this.#columns.map(e => [e, e.clientHeight]).reduce((prev, curr) => prev[1] > curr[1] ? curr : prev)[0]
  }

  addImage(imageData) {
    let image = document.createElement("img")
    const { width, height } = this.#convertImageSize(imageData.width, imageData.height)
    image.width = width
    image.height = height
    image.src = `${imageData.url}?width=${width}&height=${height}`
    image.addEventListener("click", () => expandImage(imageData))

    this.#images.push(image)
    this.#getShortestColumn().appendChild(image)
  }

  checkScrollBottom() {
    const shortestColumn = this.#getShortestColumn()
    if (shortestColumn.scrollHeight - this.html.clientHeight - this.html.scrollTop < Display.scrollThreshold) {
      request()
    }
  }

  clear() {
    this.#images.forEach(i => i.remove())
    this.#images = []
  }
}

let channelIdInputTimeout
let display
const channelIdInputDelayMs = 400

window.addEventListener("load", () => {
  const expandedImageBg = document.querySelector("#expanded-image-bg")
  const expandedImage = document.querySelector("#expanded-image")
  expandedImageBg.addEventListener("click", e => e.target === expandedImageBg || e.target === expandedImage ? expandImage(null) : null)

  channelIdInput = document.querySelector("#channel-id")
  channelIdInput.addEventListener("input", e => {
    clearTimeout(channelIdInputTimeout);
    channelIdInputTimeout = setInterval(() => {
      newChannelId(e.target.value)
      clearTimeout(channelIdInputTimeout);
    }, channelIdInputDelayMs);
  })
  currentChannelId = channelIdInput.value

  columnCountInput = document.querySelector("#column-count")
  columnCountInput.addEventListener("input", e => {
    const min = e.target.min;
    const max = e.target.max;
    const value = parseInt(e.target.value);
    if (value > max) {
      e.target.value = min;
    } else if (value < min) {
      e.target.value = max;
    }
    display.columnCount = e.target.value
  })
  display = new Display(columnCountInput.value)
})

let currentOffset = 0
let currentChannelId
let requestAllowed = true;

let finished = false;
const setFinished = v => {
  finished = v
  document.querySelector("#image-end").hidden = !v;
}

async function request() {
  if (!currentChannelId) return
  if (!requestAllowed) return
  if (finished) return
  requestAllowed = false

  const res = await fetch(
    `https://discord.com/api/v9/channels/${currentChannelId}/messages/search?has=image&offset=${currentOffset}`,
    {
      headers: {
        accept: "*/*",
        authorization:
          DISCORD_TOKEN,
      },
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  )

  if (res.status === 429) {
    sendNotification("error", "You are being rate limited!")
    const data = await res.json();
    setTimeout(() => {
      requestAllowed = true
      request()
    }, data.retry_after * 1000);
    return;
  } else if (res.status === 400) {
    sendNotification("warning", "Unknown fetch error.")
    return;
  } else if (!res.ok) {
    console.warn("unknown search fetch error")
    return;
  }
  requestAllowed = true
  const data = await res.json();
  const images = data.messages.flat().map(msg => msg.attachments.map(i => ({
    filename: i.filename,
    url: i.proxy_url,
    width: i.width,
    height: i.height,
    timestamp: msg.timestamp,
    author_username: `${msg.author.username}#${msg.author.discriminator}`,
    author_pfp_url: `https://cdn.discordapp.com/avatars/${msg.author.id}/${msg.author.avatar}?size=80`,
    message_url: `https://discord.com/channels/@me/${msg.channel_id}/${msg.id}`
  }))).flat();
  currentOffset += data.messages.length
  images.forEach(img => display.addImage(img))
  if (currentOffset >= data.total_results) {
    setFinished(true)
  }
  display.checkScrollBottom()
}

function newChannelId(channelId) {
  display.clear()
  currentOffset = 0
  currentChannelId = channelId
  requestAllowed = true;
  setFinished(false)
  request();
}

let originalLinkOnClick
let messageLinkOnClick
function expandImage(imageData) {
  console.log(imageData)
  const html = document.querySelector("html")
  const expandedImage = document.querySelector("#expanded-image")
  const expandedImageBg = document.querySelector("#expanded-image-bg")
  const authorPfp = document.querySelector("#author-pfp")
  const authorUsername = document.querySelector("#author-username")
  const creationDate = document.querySelector("#creation-date")
  const expandedImg = document.querySelector("#expanded-img")
  const imageFilename = document.querySelector("#image-filename")
  const originalImageSize = document.querySelector("#original-image-size")
  const originalLink = document.querySelector("#original-link")
  const messageLink = document.querySelector("#message-link")

  if (imageData) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }; 
    const date = new Date(imageData.timestamp)

    originalLinkOnClick = () => {
      window.open(imageData.url, "_blank")
    }
    messageLinkOnClick = () => {
      window.open(imageData.message_url, "_blank")
    }

    authorPfp.src = imageData.author_pfp_url
    authorUsername.textContent = imageData.author_username
    creationDate.textContent = date.toLocaleDateString(navigator.language, options)
    expandedImg.width = imageData.width
    expandedImg.height = imageData.height
    expandedImg.src = imageData.url
    imageFilename.textContent = imageData.filename
    originalImageSize.textContent = `${imageData.width}x${imageData.height}`
    originalLink.addEventListener("click", originalLinkOnClick)
    messageLink.addEventListener("click", messageLinkOnClick)
  } else {
    setTimeout(() => {
      expandedImg.width = 0
      expandedImg.height = 0
      expandedImg.src = ""
      originalLink.removeEventListener("click", originalLinkOnClick)
      messageLink.removeEventListener("click", messageLinkOnClick)
    }, 200);
  }

  if (imageData) {
    expandedImage.classList.add("expanded-image-active")
    expandedImageBg.classList.add("expanded-image-bg-active")
    html.style.overflow = "hidden";
    expandedImageBg.style.visibility = "visible"
  } else {
    expandedImage.classList.remove("expanded-image-active")
    expandedImageBg.classList.remove("expanded-image-bg-active")
    setTimeout(() => {
      html.style.overflow = "auto";
      expandedImageBg.style.visibility = "hidden"
    }, 200);
  }
}