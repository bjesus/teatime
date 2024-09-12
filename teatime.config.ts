async function sha1sum(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

let config = {
  dbConfig: {
    serverMode: "full",
    requestChunkSize: 4096,
    url: "/books.db",
  },
  title: "TeaTime",
  icon: "🫖",
  getDirectLink: (result, filename) => {
    return false;
  },
  getBookURL: (result, filename) => {
    return `http://localhost:8080/ipfs/${result.ipfs_cid}?filename=${filename}`;
  },
  getImageURL: async (result) => {
    const hash = await sha1sum(result.Coverurl);
    return `images/${hash}`;
  },
};

export default config;
