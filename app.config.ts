export default defineAppConfig({
  title: "TeaTime",
  icon: "🫖",
  ipfsGateways: [
    {
      value: "ipfs.io",
      name: "IPFS.io",
      description: "IPFS official gateway",
      info: "https://docs.ipfs.tech/concepts/ipfs-gateway/",
      url: "https://ipfs.io/{CID}?filename={filename}",
    },
    {
      value: "localhost",
      name: "Local IPFS Gateway",
      description: "Local IPFS gateway",
      info: "https://docs.ipfs.tech/install/ipfs-desktop/",
      url: "http://{CID}.ipfs.localhost:8080/?filename={filename}",
    },
  ],
});
