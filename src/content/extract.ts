export const extractSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const container = document.createElement("div");
  const baseUri = document.baseURI;

  // Traverse all ranges and clone their contents into the container
  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    container.appendChild(range.cloneContents());
  }

  // 2. Convert relative URLs to absolute URLs for <a> and <img> tags
  container.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href) {
      a.href = new URL(href, baseUri).href;
    }
  });

  container.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src) {
      img.src = new URL(src, baseUri).href;
    }
  });

  return {
    text: selection.toString(),
    html: container.innerHTML,
  };
};
