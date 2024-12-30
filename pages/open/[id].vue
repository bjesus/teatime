<template>
  <Error v-if="error" :error="error" :attempted="lastResult" />
  <BookView
    :bookURL="bookURL"
    :downloadProgress="downloadProgress"
    :bookProgress="bookProgress"
    :bookFile="bookFile"
  />
</template>

<script setup lang="ts">
const route = useRoute();
const appConfig = useAppConfig();
const downloadProgress = ref(0);
const bookFile = useState("bookFile", () => null as null | File);
const bookURL = useState("bookURL", () => "");
const bookProgress = ref(0);
const lastResult = useState("lastResult", () => null);
const isLoading = useState("isLoading", () => false);
const error = ref(null);

const result = {
  ipfs_cid: route.params.id,
  ...route.query,
};

useHead({
  title: `${result.title} | ` + appConfig.title,
});

const getBook = async (result) => {
  lastResult.value = result;
  console.log("Selected result:", result.title);
  isLoading.value = true;
  error.value = null;
  bookFile.value = null;
  downloadProgress.value = 0;

  const filename = sanitize(
    `${result.author} - ${result.title}.${result.ext}`.trim(),
  );

  try {
    const urls = [
      "https://ipfs.io",
      "https://flk-ipfs.xyz",
      "https://ipfs.cyou",
      "https://storry.tv",
      "https://dweb.link",
      "https://gateway.pinata.cloud",
      "https://ipfs.runfission.com",
      "https://nftstorage.link",
      "https://4everland.io",
      "https://w3s.link",
      "http://localhost:8080",
    ].map((u) => `${u}/ipfs/${result.ipfs_cid}`);

    bookURL.value = result.ipfs_cid;

    const retrievedFile = await getFile(result.ipfs_cid);
    if (retrievedFile) {
      console.log("Got file from IndexDB");
      bookFile.value = retrievedFile;
      console.log(retrievedFile);
    } else {
      const blob = await downloadUrls(urls, result.size);
      bookFile.value = new File([blob], filename, {
        type: blob.type,
        lastModified: new Date().getTime(),
      });
      console.log("Download completed");
      await saveFile(bookFile.value, result.ipfs_cid);
    }
    const { fraction } = updatedHistory.find((b) =>
      bookURL.value.includes(result.ipfs_cid),
    );
    bookProgress.value = fraction;
  } catch (error) {
    console.error("Download failed:", error);
    error.value = error;
    return;
  } finally {
    isLoading.value = false;
  }
};

const downloadUrls = (urls: string[], contentLength: number): Promise<Blob> => {
  const controller = new AbortController();
  const signal = controller.signal;

  const downloads = urls.map((url) =>
    fetch(url, { signal }).then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error("Response body is null");

      const reader = response.body.getReader();
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      return {
        read: async function () {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            chunks.push(value);
            receivedLength += value.length;
            const progress = (receivedLength / contentLength) * 100;
            if (progress > downloadProgress.value) {
              downloadProgress.value = progress;
            }

            // if (downloadProgress.value >= 100) {
            //   controller.abort();
            //   break;
            // }
          }

          return new Blob(chunks, {
            type:
              response.headers.get("content-type") ||
              "application/octet-stream",
          });
        },
        contentType:
          response.headers.get("content-type") || "application/octet-stream",
      };
    }),
  );

  return new Promise((resolve, reject) => {
    let completedDownloads = 0;
    let failedDownloads = 0;

    downloads.forEach(async (download) => {
      try {
        const { read, contentType } = await download;
        const blob = await read();
        resolve(new Blob([blob], { type: contentType }));
        controller.abort(); // Cancel other ongoing downloads
      } catch (error) {
        failedDownloads++;
        if (failedDownloads === urls.length) {
          reject(new Error("All downloads failed"));
        }
      } finally {
        completedDownloads++;
        if (
          completedDownloads === urls.length &&
          failedDownloads === urls.length
        ) {
          reject(new Error("All downloads failed"));
        }
      }
    });
  });
};

getBook(result);
</script>
