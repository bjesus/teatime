export default defineAppConfig({
  title: "TeaTime",
  icon: "🫖",
  ipfsGateways: {
    "ipfs.io": {
      name: "IPFS.io",
      description: "IPFS official gateway",
      info: "https://docs.ipfs.tech/concepts/ipfs-gateway/",
      url: "https://ipfs.io/ipfs/${cid}?filename=${filename}",
    },
    localhost: {
      name: "Local IPFS Gateway",
      description: "Local IPFS gateway",
      info: "https://docs.ipfs.tech/install/ipfs-desktop/",
      url: "http://${cid}.ipfs.localhost:8080/?filename=${filename}",
    },
  },
});
